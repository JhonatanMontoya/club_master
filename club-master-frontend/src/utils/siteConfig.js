const STORAGE_KEY = 'club_master_site_config';

export const DEFAULT_SITE_CONFIG = {
  negocio: 'CLUB MASTER',
  slogan: 'Gestiona, vende y brilla',
  logo_url: '/logo-club-master.png',
  moneda: 'COP',
  timezone: 'America/Bogota',
  iva: 0,
  colores: { primario: '#D4AF37', secundario: '#111111', fondo: '#000000', texto: '#FFFFFF' },
  fuente: 'Inter',
  telefono: '',
  direccion: '',
  horario: '',
};

export function loadSiteConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function saveSiteConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function applySiteTheme(config) {
  if (!config) return;
  if (config.colores?.primario) {
    document.documentElement.style.setProperty('--color-gold', config.colores.primario);
  }
  if (config.fuente) {
    document.body.style.fontFamily = `"${config.fuente}", sans-serif`;
  }
}

export const MAX_LOGO_SIZE = 2 * 1024 * 1024;
export const LOGO_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Solo se permiten archivos de imagen (PNG, JPG, WEBP, SVG).'));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      reject(new Error('La imagen no puede superar 2 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
