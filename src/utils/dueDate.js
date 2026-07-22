// src/utils/dueDate.js

/** Days between today and a debt's due date. Negative = overdue. */
export function daysUntilDue(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

/** Status bucket used for badges and alert grouping. */
export function getDueStatus(debt) {
  if (!debt || !debt.dueDate || debt.paid) return null;
  const days = daysUntilDue(debt.dueDate);
  if (days < 0) return "overdue";
  if (days === 0) return "due-today";
  if (days <= 7) return "due-soon"; // tune this window as you like
  return null;
}

/** Human label for the badge. */
export function getDueLabel(debt) {
  const status = getDueStatus(debt);
  const days = daysUntilDue(debt?.dueDate);
  if (status === "overdue") return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (status === "due-today") return "Due today";
  if (status === "due-soon") return `Due in ${days} day${days === 1 ? "" : "s"}`;
  return null;
}
