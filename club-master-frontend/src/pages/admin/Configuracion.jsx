import { useEffect, useRef, useState } from 'react';
import { FiUpload, FiLink, FiTrash2, FiImage } from 'react-icons/fi';
import AdminModule from './AdminModule';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { apiGet, apiPut } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { readImageFile, LOGO_ACCEPT } from '../../utils/siteConfig';

const FUENTES = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display'];

export default function Configuracion() {
  const { updateConfig } = useSiteConfig();
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);
  const [logoTab, setLogoTab] = useState('upload');
  const [logoError, setLogoError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    apiGet('/admin/config').then(setConfig);
  }, []);

  if (!config) return <AdminModule title="Configuración" description="Cargando..." />;

  const f = (k, v) => setConfig((s) => ({ ...s, [k]: v }));
  const fc = (k, v) => setConfig((s) => ({ ...s, colores: { ...s.colores, [k]: v } }));

  const handleLogoFile = async (file) => {
    if (!file) return;
    setLogoError('');
    try {
      const dataUrl = await readImageFile(file);
      f('logo_url', dataUrl);
    } catch (err) {
      setLogoError(err.message);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleLogoFile(e.dataTransfer.files?.[0]);
  };

  const resetLogo = () => {
    f('logo_url', '/logo-club-master.png');
    setLogoError('');
  };

  const save = async () => {
    await apiPut('/admin/config', config);
    await updateConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminModule title="Configuración" description="Personaliza tu negocio">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-white font-semibold mb-4">Información del negocio</h3>
          <div className="space-y-4">
            <Input label="Nombre del negocio" value={config.negocio} onChange={(e) => f('negocio', e.target.value)} />
            <Input label="Slogan" value={config.slogan} onChange={(e) => f('slogan', e.target.value)} />
            <Input label="Teléfono" value={config.telefono} onChange={(e) => f('telefono', e.target.value)} />
            <Input label="Dirección" value={config.direccion} onChange={(e) => f('direccion', e.target.value)} />
            <Input label="Horario" value={config.horario} onChange={(e) => f('horario', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-semibold mb-4">Logo del negocio</h3>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setLogoTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                logoTab === 'upload' ? 'gold-gradient text-black font-semibold' : 'border border-gold/20 text-gray-text'
              }`}
            >
              <FiUpload /> Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setLogoTab('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                logoTab === 'url' ? 'gold-gradient text-black font-semibold' : 'border border-gold/20 text-gray-text'
              }`}
            >
              <FiLink /> Enlace URL
            </button>
          </div>

          {logoTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragging ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold/60 hover:bg-white/5'
              }`}
            >
              <FiImage className="text-4xl text-gold mx-auto mb-3" />
              <p className="text-white font-medium">Arrastra tu logo aquí</p>
              <p className="text-gray-text text-sm mt-1">o haz clic para seleccionar</p>
              <p className="text-gray-text text-xs mt-3">PNG, JPG, WEBP o SVG · máx. 2 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept={LOGO_ACCEPT}
                className="hidden"
                onChange={(e) => handleLogoFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <Input
              label="URL del logo"
              value={config.logo_url?.startsWith('data:') ? '' : config.logo_url}
              onChange={(e) => f('logo_url', e.target.value)}
              placeholder="https://... o /logo-club-master.png"
            />
          )}

          {logoError && <p className="text-red-400 text-sm mt-2">{logoError}</p>}

          {config.logo_url && (
            <div className="mt-4 p-4 rounded-xl bg-black border border-gold/20 text-center">
              <p className="text-xs text-gray-text mb-3">Vista previa</p>
              <img src={config.logo_url} alt="Logo preview" className="h-32 object-contain mx-auto" />
              <button
                type="button"
                onClick={resetLogo}
                className="flex items-center gap-1 text-red-400 text-xs mt-3 mx-auto hover:text-red-300"
              >
                <FiTrash2 /> Restaurar logo predeterminado
              </button>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-white font-semibold mb-4">Colores del negocio</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'primario', label: 'Color primario (dorado)' },
              { key: 'secundario', label: 'Color secundario' },
              { key: 'fondo', label: 'Fondo' },
              { key: 'texto', label: 'Texto' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-gray-text text-sm mb-2">{label}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config.colores[key]} onChange={(e) => fc(key, e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <input type="text" value={config.colores[key]} onChange={(e) => fc(key, e.target.value)} className="flex-1 bg-black border border-gold/20 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl border border-gold/20" style={{ background: config.colores.fondo }}>
            <p style={{ color: config.colores.primario, fontWeight: 'bold' }}>{config.negocio}</p>
            <p style={{ color: config.colores.texto, fontSize: 14 }}>{config.slogan}</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-semibold mb-4">Tipografía y regional</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-text text-sm mb-2">Fuente</label>
              <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={config.fuente} onChange={(e) => f('fuente', e.target.value)}>
                {FUENTES.map((font) => <option key={font} value={font}>{font}</option>)}
              </select>
            </div>
            <Input label="Moneda" value={config.moneda} onChange={(e) => f('moneda', e.target.value)} />
            <Input label="Zona horaria" value={config.timezone} onChange={(e) => f('timezone', e.target.value)} />
            <Input label="IVA %" type="number" value={config.iva} onChange={(e) => f('iva', Number(e.target.value))} />
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <Button onClick={save}>Guardar configuración</Button>
        {saved && <span className="text-green-400 text-sm">✓ Configuración guardada — el logo se actualizó en toda la app</span>}
      </div>
    </AdminModule>
  );
}
