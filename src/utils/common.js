export function formatDateTime(isoString) {
    const date = new Date(isoString);
  
    // Example: 16 Aug 2025, 10:07 AM
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  