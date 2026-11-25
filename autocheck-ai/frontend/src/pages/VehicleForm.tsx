import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Car, Tag, Calendar, AlertTriangle, CheckCircle2, User, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { ThemeToggle } from '../components/ThemeToggle';

interface VehicleFormProps {
  vehiculo?: any;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

interface PropietarioOption {
  id: number;
  nombre_completo: string;
  email: string;
}

const CATALOGO_VEHICULOS: Record<string, string[]> = {
  Chevrolet: ['Vivant', 'Aveo', 'Sail', 'D-Max', 'Tracker', 'Captiva', 'Onix', 'Spark', 'Groove', 'Colorado', 'Trailblazer', 'Cruze'],
  Toyota: ['Corolla', 'Yaris', 'Hilux', 'RAV4', 'Fortuner', 'Land Cruiser', 'Prius', 'Agya', 'Rush', 'Prado', '4Runner'],
  Kia: ['Sportage', 'Rio', 'Picanto', 'Seltos', 'Cerato', 'Soluto', 'Sonet', 'Carnival', 'Stonic', 'Niro', 'K3'],
  Hyundai: ['Tucson', 'Accent', 'Elantra', 'Creta', 'Santa Fe', 'Grand i10', 'Kona', 'Venue', 'H-1', 'Sonata', 'Palisade'],
  Nissan: ['Versa', 'Sentra', 'Frontier', 'Kicks', 'Qashqai', 'X-Trail', 'Navara', 'March', 'Tiida', 'Pathfinder'],
  Renault: ['Duster', 'Sandero', 'Logan', 'Stepway', 'Kwid', 'Koleos', 'Captur', 'Oroch'],
  Ford: ['F-150', 'Ranger', 'Explorer', 'Escape', 'EcoSport', 'Bronco', 'Edge', 'Expedition'],
  Volkswagen: ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Taos', 'Tiguan', 'Amarok', 'Jetta', 'Golf'],
  Mazda: ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'BT-50'],
  Suzuki: ['Swift', 'Jimny', 'Vitara', 'S-Cross', 'Grand Vitara', 'Celerio', 'Baleno', 'Fronx'],
  Chery: ['Tiggo 2', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 5', 'EQ1'],
  Haval: ['H6', 'Jolion', 'H9', 'Dargo'],
  'Great Wall': ['Wingle 5', 'Wingle 7', 'Poer'],
  BYD: ['Dolphin', 'Yuan Plus', 'Song Plus', 'Han', 'Tang', 'Seagull', 'Seal'],
  JAC: ['JS2', 'JS3', 'JS4', 'JS8', 'T6', 'T8 Pro'],
  Geely: ['Coolray', 'Azkarra', 'Okavango', 'Emgrand', 'GX3 Pro'],
  Honda: ['Civic', 'CR-V', 'HR-V', 'Accord', 'Fit', 'Pilot', 'WR-V'],
  Mitsubishi: ['L200', 'Outlander', 'Montero Sport', 'Eclipse Cross', 'ASX'],
  Jeep: ['Compass', 'Renegade', 'Grand Cherokee', 'Wrangler'],
  'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLC', 'GLE'],
  BMW: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  Peugeot: ['208', '2008', '3008', '5008', 'Landtrek'],
  Citroën: ['C3', 'C4 Cactus', 'C5 Aircross'],
  Subaru: ['XV', 'Forester', 'Outback', 'Impreza'],
};

export const VehicleForm: React.FC<VehicleFormProps> = ({ vehiculo, onNavigate, onBack }) => {
  const isEditing = Boolean(vehiculo && vehiculo.id);
  const { user, isAdmin, isOperador } = useAuth();
  const [placa, setPlaca] = useState(vehiculo?.placa || '');
  const [marca, setMarca] = useState(vehiculo?.marca || '');
  const [modelo, setModelo] = useState(vehiculo?.modelo || '');
  const [anio, setAnio] = useState(vehiculo?.anio ? vehiculo.anio.toString() : new Date().getFullYear().toString());
  const [propietarioId, setPropietarioId] = useState(vehiculo?.propietario ? vehiculo.propietario.toString() : '');
  const [propietarios, setPropietarios] = useState<PropietarioOption[]>([]);
  const [cargandoPropietarios, setCargandoPropietarios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [totalInspecciones, setTotalInspecciones] = useState<number>(vehiculo?.total_inspecciones ?? 0);

  const esAdminUOperador = isAdmin || isOperador || user?.rol === 'ADMINISTRADOR' || user?.rol === 'OPERADOR';
  const propietarioSeleccionado = esAdminUOperador
    ? propietarios.find((p) => p.id.toString() === propietarioId)
    : user;

  useEffect(() => {
    if (vehiculo?.id) {
      api.get(`/historial/${vehiculo.id}/`)
        .then((res) => {
          if (res.data && typeof res.data.total_inspecciones === 'number') {
            setTotalInspecciones(res.data.total_inspecciones);
          }
        })
        .catch(() => {});
    }
  }, [vehiculo]);

  useEffect(() => {
    if (vehiculo) {
      setPlaca(vehiculo.placa || '');
      setMarca(vehiculo.marca || '');
      setModelo(vehiculo.modelo || '');
      setAnio(vehiculo.anio ? vehiculo.anio.toString() : new Date().getFullYear().toString());
      if (vehiculo.propietario) {
        setPropietarioId(vehiculo.propietario.toString());
      }
    }
  }, [vehiculo]);

  useEffect(() => {
    if (esAdminUOperador) {
      setCargandoPropietarios(true);
      api.get(`/auth/usuarios/propietarios/?_t=${Date.now()}`)
        .then((res) => {
          setPropietarios(res.data);
          if (vehiculo?.propietario) {
            setPropietarioId(vehiculo.propietario.toString());
          } else if (!vehiculo && res.data.length === 1) {
            setPropietarioId(res.data[0].id.toString());
          }
        })
        .catch((err) => {
          console.error('Error al cargar lista de propietarios:', err);
        })
        .finally(() => {
          setCargandoPropietarios(false);
        });
    }
  }, [esAdminUOperador, vehiculo]);

  const marcasDisponibles = Object.keys(CATALOGO_VEHICULOS).sort();

  const marcaKeyEncontrada = marcasDisponibles.find(
    (m) => m.toLowerCase() === marca.trim().toLowerCase()
  );
  const modelosDisponibles = marcaKeyEncontrada
    ? CATALOGO_VEHICULOS[marcaKeyEncontrada]
    : [];

  const toTitleCase = (str: string) => {
    return str.replace(new RegExp('\\w\\S*', 'g'), (txt) => {
      if (txt.includes('-')) {
        return txt
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.substring(1))
          .join('-');
      }
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  };

  const handleVolver = () => {
    if (onBack) {
      onBack();
    } else {
      onNavigate('vehicles');
    }
  };

  const handlePlacaChange = (val: string) => {
    let clean = val.toUpperCase().replace(/\s+/g, '');
    clean = clean.replace(/[^A-Z0-9-]/g, '');

    if (/^[A-Z]{3}[0-9]/.test(clean)) {
      clean = clean.slice(0, 3) + '-' + clean.slice(3);
    }

    if (clean.length > 8) {
      clean = clean.slice(0, 8);
    }

    setPlaca(clean);
    if (error) setError('');
  };

  const handleMarcaChange = (val: string) => {
    setMarca(val);
    if (error) setError('');
    const match = marcasDisponibles.find((m) => m.toLowerCase() === val.trim().toLowerCase());
    if (match && val.toLowerCase() === match.toLowerCase()) {
      setMarca(match);
    }
  };

  const handleMarcaBlur = () => {
    if (marca.trim()) {
      const match = marcasDisponibles.find((m) => m.toLowerCase() === marca.trim().toLowerCase());
      setMarca(match ? match : toTitleCase(marca.trim()));
    }
  };

  const handleModeloChange = (val: string) => {
    setModelo(val);
    if (error) setError('');
  };

  const handleModeloBlur = () => {
    if (modelo.trim()) {
      const match = modelosDisponibles.find((mod) => mod.toLowerCase() === modelo.trim().toLowerCase());
      setModelo(match ? match : toTitleCase(modelo.trim()));
    }
  };

  const handleEliminarVehiculo = async () => {
    if (!isEditing || !vehiculo?.id) return;
    setEliminando(true);
    try {
      await api.delete(`/vehiculos/${vehiculo.id}/`);
      onNavigate('vehicles');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar el vehículo.');
      setMostrarModalEliminar(false);
    } finally {
      setEliminando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (esAdminUOperador && !propietarioId) {
      setError('Por favor selecciona el propietario al que se asignará el vehículo.');
      return;
    }

    const placaLimpia = placa.trim().toUpperCase();
    const placaRegex = /^[A-Z]{2,3}-\d{3,4}$/;
    if (!placaRegex.test(placaLimpia)) {
      setError('Formato de placa inválido. Debe contener 3 letras, guion y 3 o 4 números (ejemplo: ABC-1234).');
      return;
    }

    const cleanMarca = toTitleCase(marca.trim());
    if (cleanMarca.length < 2) {
      setError('La marca del vehículo debe tener al menos 2 caracteres.');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/.test(cleanMarca)) {
      setError('La marca debe contener un nombre vehicular válido (ejemplo: Toyota, Kia, Chevrolet).');
      return;
    }

    const cleanModelo = toTitleCase(modelo.trim());
    if (cleanModelo.length < 2) {
      setError('El modelo del vehículo debe tener al menos 2 caracteres.');
      return;
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.-]+$/.test(cleanModelo)) {
      setError('El modelo contiene caracteres no válidos (ejemplo: Corolla, Sportage, D-Max).');
      return;
    }

    const anioNum = parseInt(anio, 10);
    const maxAnio = new Date().getFullYear() + 1;
    if (isNaN(anioNum) || anioNum < 1960 || anioNum > maxAnio) {
      setError(`El año de fabricación debe estar comprendido entre 1960 y ${maxAnio}.`);
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        placa: placaLimpia,
        marca: cleanMarca,
        modelo: cleanModelo,
        anio: anioNum,
      };

      if (esAdminUOperador && propietarioId) {
        payload.propietario = parseInt(propietarioId, 10);
      }

      if (isEditing) {
        await api.patch(`/vehiculos/${vehiculo.id}/`, payload);
      } else {
        await api.post('/vehiculos/', payload);
      }

      setExito(true);
      setTimeout(() => onNavigate('vehicles'), 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.placa?.[0] ||
        err.response?.data?.marca?.[0] ||
        err.response?.data?.modelo?.[0] ||
        err.response?.data?.anio?.[0] ||
        err.response?.data?.propietario?.[0] ||
        err.response?.data?.detail ||
        'Error al guardar el vehículo. Verifica los datos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60 p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-6">
          <button
            onClick={handleVolver}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Editar vehículo' : 'Registrar vehículo'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isEditing
              ? 'Modifica la información de la unidad vehicular en el catálogo.'
              : 'Ingresa la información básica de la unidad para el catálogo.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {exito && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>
              {isEditing ? '¡Vehículo actualizado correctamente!' : '¡Vehículo guardado exitosamente!'}
              {esAdminUOperador && propietarioSeleccionado && (
                <> Asignado a: <strong>{propietarioSeleccionado.nombre_completo}</strong></>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {esAdminUOperador && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Asignar Propietario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={propietarioId}
                  onChange={(e) => setPropietarioId(e.target.value)}
                  disabled={cargandoPropietarios}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all font-medium text-sm cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-850 disabled:text-slate-400"
                >
                  <option value="">
                    {cargandoPropietarios ? 'Cargando lista de propietarios...' : 'Selecciona el propietario...'}
                  </option>
                  {propietarios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo} ({p.email})
                    </option>
                  ))}
                </select>
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                El vehículo quedará vinculado a la cuenta del cliente para que pueda consultar sus inspecciones y reportes.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Placa / Patente
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={8}
                value={placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
                placeholder="ABC-1234"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all uppercase"
              />
              <Tag className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/50 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              Formato oficial: 3 letras, guión y 3 o 4 números (ejemplo: ABC-1234).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Marca
            </label>
            <div className="relative">
              <input
                type="text"
                required
                list="lista-marcas"
                value={marca}
                onChange={(e) => handleMarcaChange(e.target.value)}
                onBlur={handleMarcaBlur}
                placeholder="Ej: Chevrolet, Toyota, Kia..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-sm"
              />
              <Car className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <datalist id="lista-marcas">
                {marcasDisponibles.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            {marcaKeyEncontrada && (
              <p className="mt-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium">
                Marca identificada: {marcaKeyEncontrada}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Modelo
            </label>
            <input
              type="text"
              required
              list="lista-modelos"
              value={modelo}
              onChange={(e) => handleModeloChange(e.target.value)}
              onBlur={handleModeloBlur}
              placeholder={
                marcaKeyEncontrada
                  ? `Ej: ${modelosDisponibles.slice(0, 3).join(', ')}...`
                  : 'Ej: Corolla, Sportage, D-Max...'
              }
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-sm"
            />
            <datalist id="lista-modelos">
              {modelosDisponibles.map((mod) => (
                <option key={mod} value={mod} />
              ))}
            </datalist>
            {marcaKeyEncontrada && modelosDisponibles.length > 0 && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Sugerencias de modelos oficiales para {marcaKeyEncontrada} disponibles al escribir.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Año
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1960"
                max={new Date().getFullYear() + 1}
                value={anio}
                onChange={(e) => {
                  setAnio(e.target.value);
                  if (error) setError('');
                }}
                placeholder="2020"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all font-medium"
              />
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-60 cursor-pointer mt-4"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Guardar vehículo')}
          </button>

          {isEditing && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setMostrarModalEliminar(true)}
                className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar unidad vehicular
              </button>
            </div>
          )}
        </form>

        <ConfirmModal
          isOpen={mostrarModalEliminar}
          title="¿Eliminar vehículo?"
          description={
            <>
              ¿Estás seguro de que deseas eliminar el vehículo <strong className="text-slate-800 dark:text-white">{vehiculo?.marca} {vehiculo?.modelo} ({vehiculo?.placa})</strong>?
            </>
          }
          isLoading={eliminando}
          onCancel={() => setMostrarModalEliminar(false)}
          onConfirm={handleEliminarVehiculo}
        >
          {totalInspecciones > 0 ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-left flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-800 dark:text-amber-300">Historial técnico asociado:</p>
                <p className="text-amber-700 dark:text-amber-200">
                  Este vehículo tiene <strong className="font-bold text-amber-900 dark:text-white">{totalInspecciones} inspección{totalInspecciones > 1 ? 'es' : ''}</strong> registrada{totalInspecciones > 1 ? 's' : ''} que también se eliminarán de forma permanente.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Esta unidad no cuenta con inspecciones previas. Esta acción no se puede deshacer.
            </p>
          )}
        </ConfirmModal>
      </div>
    </div>
  );
};
