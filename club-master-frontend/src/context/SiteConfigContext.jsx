import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../services/api';
import {
  DEFAULT_SITE_CONFIG, loadSiteConfig, saveSiteConfig, applySiteTheme,
} from '../utils/siteConfig';

const SiteConfigContext = createContext(null);

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(() => loadSiteConfig() || DEFAULT_SITE_CONFIG);

  useEffect(() => {
    apiGet('/admin/config')
      .then((apiConfig) => {
        const stored = loadSiteConfig();
        const merged = stored ? { ...apiConfig, ...stored, colores: { ...apiConfig.colores, ...stored?.colores } } : apiConfig;
        setConfig(merged);
        applySiteTheme(merged);
      })
      .catch(() => applySiteTheme(config));
  }, []);

  const updateConfig = async (newConfig) => {
    saveSiteConfig(newConfig);
    setConfig(newConfig);
    applySiteTheme(newConfig);
  };

  const logoUrl = config.logo_url || DEFAULT_SITE_CONFIG.logo_url;

  return (
    <SiteConfigContext.Provider value={{ config, logoUrl, updateConfig, setConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export const useSiteConfig = () => useContext(SiteConfigContext);
