import { useEffect, useState } from "react";

const isDark = () => document.documentElement.classList.contains("dark");

// The initial class is set by the inline script in index.html.
export function useTheme() {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const sync = () => setDark(isDark());
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const toggle = () => {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage blocked: the theme still applies for this visit
    }
    window.dispatchEvent(new Event("themechange"));
  };

  return { dark, toggle };
}
