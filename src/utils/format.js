export function formatDate(date, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, options).format(parsed);
}

export function getInitials(user) {
  return [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
