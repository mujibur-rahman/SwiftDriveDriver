// src/utils/helpers.js
export const getName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

// pick banner props from document counts
export function getDocumentsBannerProps({ missingCount = 0, pendingCount = 0 }) {
  if (missingCount > 0) {
    return {
      variant: "warning",
      icon: "alert",
      message: `${missingCount} document${missingCount > 1 ? "s" : ""} required to start driving`,
    };
  }
  if (pendingCount > 0) {
    return {
      variant: "info",
      icon: "clock-outline",
      message: `${pendingCount} document${pendingCount > 1 ? "s" : ""} under review`,
    };
  }
  return {
    variant: "success",
    icon: "check-circle",
    message: "All documents approved",
  };
}