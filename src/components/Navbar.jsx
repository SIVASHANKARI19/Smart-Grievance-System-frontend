import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';

const Navbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                S
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                SmartGrievance
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Globe size={15} className="text-blue-500 shrink-0" />
              <select
                onChange={handleLanguageChange}
                defaultValue={i18n.language?.slice(0, 2) || 'en'}
                className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="ml">മലയാളം</option>
              </select>
            </div>

            {token ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <User size={16} className="text-blue-600" />
                  <span className="text-sm font-medium">
                    {user?.name}
                    <span className="text-xs text-gray-400 capitalize bg-white px-2 py-0.5 rounded-full border border-gray-200 ml-1">
                      {user?.role}
                    </span>
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all hover:shadow"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;