export function formatTime() {
  return new Date().toLocaleTimeString();
}

export function generateId() {
  return Date.now().toString();
}

export function truncateText(text, length = 100) {
  if (!text) return "";

  return text.length > length
    ? text.slice(0, length) + "..."
    : text;
}

export function capitalize(text) {
  if (!text) return "";

  return text.charAt(0).toUpperCase() +
         text.slice(1);
}