/**
 * Semantic color tokens for Light & Dark themes.
 * These map to CSS variables used by NativeWind (bg-background, text-foreground, etc.)
 * Existing classNames stay the same — only the underlying values change.
 */

export const darkColors = {
  "--color-background": "#060E1A",
  "--color-background-secondary": "#0D1E32",
  "--color-background-muted": "#162A44",
  "--color-card": "#0D1E32",
  "--color-badge": "#0D1E32",
  "--color-avatar": "#1B1E27",

  "--color-foreground": "#F0F9FF",
  "--color-foreground-secondary": "#BAE6FD",
  "--color-foreground-muted": "#7DD3FC",
  "--color-card-foreground": "#F0F9FF",

  "--color-primary": "#38BDF8",
  "--color-primary-foreground": "#060E1A",

  "--color-secondary": "#1E3A5F",
  "--color-secondary-foreground": "#BAE6FD",

  "--color-border": "#1E3A5F",
  "--color-input": "#162A44",
  "--color-ring": "#38BDF8",

  "--color-success": "#34D399",
  "--color-warning": "#FBBF24",
  "--color-error": "#F87171",
  "--color-info": "#60A5FA",
  "--color-accent": "#D4AF6A",
};

export const lightColors = {
  "--color-background": "#FFFFFF",
  "--color-background-secondary": "#F0F9FF",
  "--color-background-muted": "#E0F2FE",
  "--color-card": "#FFFFFF",
  "--color-badge": "#FFFFFF",
  "--color-avatar": "#1B1E27",

  "--color-foreground": "#0F172A",
  "--color-foreground-secondary": "#334155",
  "--color-foreground-muted": "#64748B",
  "--color-card-foreground": "#0F172A",

  "--color-primary": "#0EA5E9",
  "--color-primary-foreground": "#FFFFFF",

  "--color-secondary": "#E0F2FE",
  "--color-secondary-foreground": "#0369A1",

  "--color-border": "#BAE6FD",
  "--color-input": "#F0F9FF",
  "--color-ring": "#0EA5E9",

  "--color-success": "#16A34A",
  "--color-warning": "#D97706",
  "--color-error": "#DC2626",
  "--color-info": "#2563EB",
  "--color-accent": "#D4AF6A",
};

/** Hex values for places that still need raw colors (StatusBar, Navigation, Switch, etc.) */
export const themeHex = {
  dark: {
    background: "#060E1A",
    card: "#0D1E32",
    border: "#1E3A5F",
    text: "#BAE6FD",
    primary: "#38BDF8",
    foreground: "#F0F9FF",
    statusBar: "light-content",
  },
  light: {
    background: "#FFFFFF",
    card: "#FFFFFF",
    border: "#BAE6FD",
    text: "#334155",
    primary: "#0EA5E9",
    foreground: "#0F172A",
    statusBar: "dark-content",
  },
};
