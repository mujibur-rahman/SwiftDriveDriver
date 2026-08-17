import React from "react";
import Svg, { Path } from "react-native-svg";

const icons = {
  home: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z",
  search: "M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z",
  heart: "M12 21s-7-4.35-10-9a5 5 0 0 1 10-1 5 5 0 0 1 10 1c-3 4.65-10 9-10 9z",
  close: "M18 6L6 18M6 6l12 12",
  uploadTruck:
    "M5 14l1-4h12l1 4M4 14h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm3 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M12 3v5M9.5 5.5 12 3l2.5 2.5",
  delivery:
    "M3 7h11v8H3zM14 10h3l4 3v2h-7zm-7 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
  food: "M8 3v8M5 3v5a3 3 0 0 0 6 0V3M16 3v18M19 3c-2 2-3 5-3 8",
  shield: "M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6zM9 12l2 2 4-4",
  gig: "M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 7V5h6v2",
  ride: "M5 10h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zm2 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
  shoppingCart:
    "M6 6h15l-1.5 8h-11zM6 6 5 3H3zm4 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  card: "M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM15 12h6",
  store: "M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21c1.5-4 14.5-4 16 0",
  history: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 8v5l3 2",

  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronUp: "M18 15l-6-6-6 6",
  chevronDown: "M6 9l6 6 6-6",

  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6",

  eyeOff:
    "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.2 17.2 0 0 1-4.2 4.9M6.2 6.2C3.8 7.7 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.9",

  mail: "M3 6h18v12H3zM3 7l9 7 9-7",

  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a16 16 0 0 0 6.6 6.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9z",

  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0",

  users:
    "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.9M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",

  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",

  unlock: "M17 11V8a5 5 0 0 0-9.8-1M5 11h14v10H5z",

  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10.7 21a2 2 0 0 0 2.6 0",
};

export default function SvgIcon({
  name,
  size = 24,
  color = "#000",
  className,
  style,
  onPress
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      onPress={onPress}
    >
      <Path
        d={icons[name]}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
