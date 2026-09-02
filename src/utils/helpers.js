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

// convert points to path for svg
export function pointsToPath(points) {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return (
    `M${first.x.toFixed(1)},${first.y.toFixed(1)} ` +
    rest.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  );
}

// encode code 128b
export function encodeCode128B(value) {
  if (!value) {
    return '';
  }

  const normalizedValue = String(value);

  for (const char of normalizedValue) {
    const charCode = char.charCodeAt(0);

    if (charCode < 32 || charCode > 126) {
      throw new Error(
        `Unsupported CODE128-B character: "${char}". Only ASCII 32-126 is supported.`
      );
    }
  }

  const START_CODE_B = 104;
  const STOP_CODE = 106;

  const values = [START_CODE_B];

  for (const char of normalizedValue) {
    values.push(char.charCodeAt(0) - 32);
  }

  let checksum = START_CODE_B;

  for (let index = 1; index < values.length; index += 1) {
    checksum += values[index] * index;
  }

  checksum %= 103;

  values.push(checksum);
  values.push(STOP_CODE);

  return values.map((code) => CODE128_PATTERNS[code]).join('');
}