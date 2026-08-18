import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VariableContextProvider } from "nativewind";
import { darkColors, lightColors, themeHex } from "@/theme/colors";
import { store } from "@/store";
import { driverApi } from "@/features/driver/driverApi";

const THEME_STORAGE_KEY = "@swiftdrive_theme_preference";

/** @typedef {"system" | "light" | "dark"} ThemePreference */

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [preference, setPreference] = useState(
    /** @type {ThemePreference} */ ("system"),
  );
  const [isReady, setIsReady] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          mounted &&
          (saved === "system" || saved === "light" || saved === "dark")
        ) {
          setPreference(saved);
        }
      } catch (_) {
        // keep default
      } finally {
        if (mounted) setIsReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Resolve effective scheme
  const colorScheme = useMemo(() => {
    if (preference === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return preference;
  }, [preference, systemScheme]);

  // Sync React Native Appearance so dark: variants & system UI stay in sync
  useEffect(() => {
    if (!isReady) return;
    if (preference === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(preference);
    }
  }, [preference, isReady]);

  const setTheme = useCallback(async (next) => {
    if (next !== "system" && next !== "light" && next !== "dark") return;

    // 1. Update UI immediately
    setPreference(next);

    // 2. Persist locally
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (_) {}

    // 3. Save to database via API (only if logged in)
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        store.dispatch(
          driverApi.endpoints.updateDriverPreference.initiate({
            themePreference: next,
          }),
        );
      }
    } catch (_) {
      // Network/API error — local theme already applied, ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = colorScheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [colorScheme, setTheme]);

  const cssVars = colorScheme === "dark" ? darkColors : lightColors;
  const hex = themeHex[colorScheme];

  const value = useMemo(
    () => ({
      preference, // "system" | "light" | "dark"
      colorScheme, // resolved "light" | "dark"
      isDark: colorScheme === "dark",
      isReady,
      setTheme,
      toggleTheme,
      colors: hex,
    }),
    [preference, colorScheme, isReady, setTheme, toggleTheme, hex],
  );

  return (
    <ThemeContext.Provider value={value}>
      <VariableContextProvider value={cssVars}>
        {children}
      </VariableContextProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
