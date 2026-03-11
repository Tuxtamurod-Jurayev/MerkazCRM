export function formatMoney(amount) {
  return new Intl.NumberFormat("uz-UZ").format(Number(amount || 0));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("uz-UZ");
}
