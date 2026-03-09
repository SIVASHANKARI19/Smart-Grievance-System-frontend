/**
 * Calculates the SLA due date and status for a grievance.
 * Business rules:
 *  Critical → 1 day
 *  High     → 3 days
 *  Medium   → 7 days
 *  Low      → 14 days
 */
const SLA_DAYS = { Critical: 1, High: 3, Medium: 7, Low: 14 };

export const getSLA = (createdAt, priority = 'Low') => {
  const created = new Date(createdAt || Date.now());
  const daysAllowed = SLA_DAYS[priority] ?? 14;
  const due = new Date(created.getTime() + daysAllowed * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msLeft = due - now;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  return {
    due,
    daysLeft,
    isOverdue: daysLeft < 0,
    isDueToday: daysLeft === 0,
    label: daysLeft < 0
      ? `Overdue by ${Math.abs(daysLeft)}d`
      : daysLeft === 0
      ? 'Due today!'
      : `Due in ${daysLeft}d`,
    color: daysLeft < 0
      ? 'bg-red-100 text-red-700 border-red-300'
      : daysLeft <= 1
      ? 'bg-orange-100 text-orange-700 border-orange-300'
      : daysLeft <= 3
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : 'bg-green-100 text-green-700 border-green-300',
  };
};
