import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { grievanceService } from '../../services/grievanceService';
import { MapPin, Phone, Image as ImageIcon, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useRef } from "react";

// ---------- Translation Helper ----------
// Uses the free MyMemory API (no key required) to translate text to English
// before sending to the AI classifier so department detection works correctly.
const translateToEnglish = async (text, sourceLang) => {

  // If already English, skip the translation API call
  if (!sourceLang || sourceLang === 'en') return text;

  try {
    // MyMemory supports: ta (Tamil), ml (Malayalam), hi (Hindi)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|en`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    // If translation is garbage or empty, fall back to original text
    return translated && translated.trim() ? translated : text;
  } catch {
    // Network error – fall back to original so submission still works
    return text;
  }
};

const SubmitGrievance = () => {
    const fileInputRef = useRef(null);
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState(null); // { lat, lng }
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'detecting' | 'detected' | 'error'
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Duplicate Detection States
  const [existingGrievances, setExistingGrievances] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(null); // { id, title, similarity }

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Initialize: Fetch all grievances for duplicate check ---
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await grievanceService.getAll();
        setExistingGrievances(data);
      } catch (err) {
        console.error('Failed to fetch grievances for duplicate check', err);
      }
    };
    fetchAll();
  }, []);

  // --- Duplicate Detection Logic (Jaccard Similarity) ---
  useEffect(() => {
    if (description.length < 20) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(() => {
      const currentWords = new Set(description.toLowerCase().match(/\w+/g) || []);
      if (currentWords.size < 5) return;

      let bestMatch = null;
      let highestSim = 0;

      existingGrievances.forEach(g => {
        const otherWords = new Set(g.description.toLowerCase().match(/\w+/g) || []);
        const intersection = new Set([...currentWords].filter(x => otherWords.has(x)));
        const union = new Set([...currentWords, ...otherWords]);
        const similarity = intersection.size / union.size;

        if (similarity > highestSim) {
          highestSim = similarity;
          bestMatch = g;
        }
      });

      if (highestSim > 0.6) {
        setDuplicateWarning({
          id: bestMatch._id,
          title: bestMatch.title,
          similarity: Math.round(highestSim * 100)
        });
      } else {
        setDuplicateWarning(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [description, existingGrievances]);

  // --- GPS Location Detection ---
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('detected');
      },
      () => {
        setLocationStatus('error');
      }
    );
  };

  // --- Image Selection & Base64 Conversion ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const grievancePayload = {
      title,
      description,
      citizen: user._id,
      address,
      contactNumber: contact,
      location: location || null,
      image: imageBase64 || null,
    };

    try {
      // Step 1: Translate description to English before sending to AI
      const currentLang = i18n.language?.slice(0, 2) || 'en';
      const descriptionInEnglish = await translateToEnglish(description, currentLang);

      // Step 2: Initial classify with repeatCount=0 to discover the department
      const initialResult = await grievanceService.classify(descriptionInEnglish, 0);
      const detectedDepartment = initialResult.department;

      // Step 3: Fetch the REAL count of existing grievances in that department
      //         This is what feeds the AI's crowd-sourced priority boost
      const repeatCount = await grievanceService.getCountByDepartment(detectedDepartment);

      // Step 4: Re-classify with the real repeatCount for accurate priority score
      const aiResult = await grievanceService.classify(descriptionInEnglish, repeatCount);

      // Step 2: Attach AI results and submit grievance
      await grievanceService.create({
        ...grievancePayload,
        department: aiResult.department,
        priorityScore: aiResult.priority,
        priority: aiResult.priorityScore,
        category: aiResult.category,
      });

      setSuccess(true);
      setTimeout(() => navigate('/citizen/my-grievances'), 2000);
    } catch (err) {
      console.error('Submission Error (AI/Primary):', err);
      // Fallback: Submit without AI classification if AI service is down
      try {
        await grievanceService.create(grievancePayload);
        setSuccess(true);
        setTimeout(() => navigate('/citizen/my-grievances'), 2000);
      } catch (fallbackErr) {
        setError(
          fallbackErr.response?.data?.message ||
            fallbackErr.message ||
            'Failed to submit grievance. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto  transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900  tracking-tight">{t('submit.title')}</h1>
        <p className="text-gray-500  mt-1">{t('submit.subtitle')}</p>
      </div>

      <div className="bg-white  rounded-2xl shadow-sm border border-gray-100 :border-gray-700 p-6 md:p-8 transition-colors duration-300">
        {/* Duplicate Warning */}
        {duplicateWarning && !success && (
          <div className="mb-6 bg-amber-50 :bg-amber-900/20 border border-amber-200 :border-amber-800/50 text-amber-800 :text-amber-200 p-4 rounded-xl flex items-start gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Potential Duplicate Detected ({duplicateWarning.similarity}%)</p>
              <p className="text-xs mt-1">
                A similar issue "{duplicateWarning.title}" has already been reported. 
                Reporting the same issue again may not speed up the process. Are you sure you want to continue?
              </p>
            </div>
          </div>
        )}
        {/* Success Banner */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <span className="font-medium">{t('submit.successMsg')}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------- Title ---------- */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 :text-gray-300 mb-1.5">
              {t('submit.fieldTitle')}
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-4 py-3 bg-gray-50 :bg-gray-900 border border-gray-200 :border-gray-700 rounded-xl focus:bg-white :focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 :text-gray-100 outline-none transition-all placeholder-gray-400 :placeholder-gray-600"
              placeholder={t('submit.fieldTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ---------- Description ---------- */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 :text-gray-300 mb-1.5">
              {t('submit.fieldDescription')}
            </label>
            <textarea
              id="description"
              required
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 :bg-gray-900 border border-gray-200 :border-gray-700 rounded-xl focus:bg-white :focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 :text-gray-100 outline-none transition-all resize-y placeholder-gray-400 :placeholder-gray-600"
              placeholder={t('submit.fieldDescriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-gray-400 :text-gray-500 mt-1">💡 You can type in Hindi or any local language — our AI will understand it.</p>
          </div>

          {/* ---------- Address + GPS ---------- */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 :text-gray-300 mb-1.5">
              <MapPin className="inline w-4 h-4 mr-1 text-blue-500" />
              {t('submit.fieldAddress')}
            </label>
            <input
              type="text"
              id="address"
              className="w-full px-4 py-3 bg-gray-50 :bg-gray-900 border border-gray-200 :border-gray-700 rounded-xl focus:bg-white :focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 :text-gray-100 outline-none transition-all placeholder-gray-400 :placeholder-gray-600"
              placeholder={t('submit.fieldAddressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {/* GPS Detect Button */}
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locationStatus === 'detecting' || locationStatus === 'detected'}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                  locationStatus === 'detected'
                    ? 'bg-green-50 text-green-700 border-green-300 cursor-default'
                    : locationStatus === 'error'
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {locationStatus === 'detecting' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {locationStatus === 'detected'
                  ? t('submit.fieldLocationDetected')
                  : locationStatus === 'detecting'
                  ? t('submit.fieldDetecting')
                  : t('submit.fieldDetectLocation')}
              </button>
              {locationStatus === 'detected' && location && (
                <span className="text-xs text-green-600 font-medium">
                  📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
              )}
              {locationStatus === 'error' && (
                <span className="text-xs text-red-600">{t('submit.locationError')}</span>
              )}
            </div>
          </div>

          {/* ---------- Contact Number ---------- */}
          <div>
            <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 :text-gray-300 mb-1.5">
              <Phone className="inline w-4 h-4 mr-1 text-blue-500" />
              {t('submit.fieldContact')}
            </label>
            <input
              type="tel"
              id="contact"
              pattern="[0-9]{10}"
              maxLength={10}
              className="w-full px-4 py-3 bg-gray-50 :bg-gray-900 border border-gray-200 :border-gray-700 rounded-xl focus:bg-white :focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 :text-gray-100 outline-none transition-all placeholder-gray-400 :placeholder-gray-600"
              placeholder={t('submit.fieldContactPlaceholder')}
              value={contact}
              onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {/* ---------- Photo Upload ---------- */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 :text-gray-300 mb-1.5">
              <ImageIcon className="inline w-4 h-4 mr-1 text-blue-500" />
              {t('submit.fieldPhoto')}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-gray-200 :border-gray-700 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 :hover:border-blue-500 hover:bg-blue-50 :hover:bg-blue-900/20 transition-all group"
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-56 object-contain rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={(ev) => { ev.stopPropagation(); setImageBase64(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-white :bg-gray-800 rounded-full p-1 shadow hover:bg-red-50 :hover:bg-red-900/30"
                  >
                    <XCircle className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-gray-300 :text-gray-600 group-hover:text-blue-400 mb-2 transition-colors" />
                  <p className="text-sm text-gray-500 :text-gray-400 group-hover:text-blue-600 :group-hover:text-blue-400 transition-colors">{t('submit.fieldPhotoHint')}</p>
                  <p className="text-xs text-gray-400 :text-gray-500 mt-1">Click to browse files</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* ---------- Submit Buttons ---------- */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 :border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 :text-gray-300 bg-white :bg-gray-800 border border-gray-300 :border-gray-600 rounded-xl hover:bg-gray-50 :hover:bg-gray-700 transition-colors"
            >
              {t('submit.btnCancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 :bg-blue-700 rounded-xl hover:bg-blue-700 :hover:bg-blue-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 active:scale-95"
            >
              {loading ? t('submit.btnSubmitting') : t('submit.btnSubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitGrievance;
