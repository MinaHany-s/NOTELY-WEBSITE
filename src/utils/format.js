export function formatDate(date, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const locale = document.documentElement.lang === "ar" ? "ar-EG" : undefined;
  return new Intl.DateTimeFormat(locale, options).format(parsed);
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const locale = document.documentElement.lang === "ar" ? "ar-EG" : undefined;
  return new Intl.NumberFormat(locale).format(number);
}

export function getInitials(user) {
  return [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
