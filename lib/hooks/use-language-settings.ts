import { useState, useEffect } from 'react';

interface LanguageSettings {
  enabledLocales: string[];
  defaultLocale: string;
  localeNames: Record<string, string>;
}

export function useLanguageSettings() {
  const [settings, setSettings] = useState<LanguageSettings>({
    enabledLocales: ['en', 'it', 'si'],
    defaultLocale: 'en',
    localeNames: {
      en: 'English',
      it: 'Italiano',
      si: 'සිංහල',
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/languages');

      if (!response.ok) {
        throw new Error('Failed to fetch language settings');
      }

      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching language settings:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen for updates from admin panel
    const handleUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('languageSettingsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('languageSettingsUpdated', handleUpdate);
    };
  }, []);

  return {
    ...settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}
