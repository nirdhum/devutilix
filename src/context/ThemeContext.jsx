import { useEffect, useState } from "react";
import { ThemeContext } from "./context";

// Only export the component from this file
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [, forceUpdate] = useState({});

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    setTimeout(() => {
      forceUpdate({});
    }, 0);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes from both html and body
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    // Add current theme class to both
    root.classList.add(theme);
    body.classList.add(theme);
    root.setAttribute("data-theme", theme);

    // Force browser repaint
    root.offsetHeight;

    // console.log("Theme applied:", theme, "HTML classes:", root.className);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div key={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};
