export const adminTabs = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "subjects", label: "Fanlar", icon: "subjects" },
  { id: "teachers", label: "O'qituvchilar", icon: "teachers" },
  { id: "students", label: "O'quvchilar", icon: "students" },
  { id: "groups", label: "Guruhlar", icon: "groups" },
  { id: "payments", label: "To'lovlar", icon: "payments" },
  { id: "debtors", label: "Qarzdorlar", icon: "debtors" },
  { id: "reports", label: "Hisobotlar", icon: "reports" },
];

export const receptionTabs = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "students", label: "O'quvchilar", icon: "students" },
  { id: "groups", label: "Guruhlar", icon: "groups" },
  { id: "enrollment", label: "Biriktirish", icon: "enrollment" },
  { id: "payments", label: "To'lovlar", icon: "payments" },
  { id: "expenses", label: "Xarajatlar", icon: "expenses" },
  { id: "reports", label: "Hisobotlar", icon: "reports" },
];

export function getActiveTab(tabs, tabId) {
  if (!tabs.length) return "";
  return tabs.some((tab) => tab.id === tabId) ? tabId : tabs[0].id;
}
