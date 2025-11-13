"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminTheme = "light" | "dark";

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme") as AdminTheme;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme classes to document when theme changes
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    html.classList.remove('dark', 'admin-theme-light', 'admin-theme-dark');
    body.classList.remove('admin-theme-light', 'admin-theme-dark');

    // Apply new theme classes
    if (theme === 'dark') {
      html.classList.add('dark', 'admin-theme-dark');
      body.classList.add('admin-theme-dark');
    } else {
      html.classList.add('admin-theme-light');
      body.classList.add('admin-theme-light');
    }
  }, [theme, mounted]);

  // Save theme to localStorage when it changes
  const setTheme = (newTheme: AdminTheme) => {
    console.log(`Setting admin theme to: ${newTheme}`);
    setThemeState(newTheme);
    localStorage.setItem("admin-theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    console.log(`Admin theme toggling from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div
        className={`admin-theme-${theme} ${!mounted ? 'opacity-0' : ''}`}
        data-admin-theme={theme}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}