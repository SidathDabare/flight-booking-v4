"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminTheme } from "./admin-theme-context";

export function AdminThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 transition-colors"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return <AdminThemeToggleClient />;
}

function AdminThemeToggleClient() {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 transition-colors"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}