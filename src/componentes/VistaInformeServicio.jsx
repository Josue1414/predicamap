// src/componentes/VistaInformeServicio.jsx
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { X, Save, FileSpreadsheet, FileText, Trash2, Edit2, AlertTriangle, ArrowUp, ArrowDown, Clock, Upload, Download, RefreshCcw, CheckCircle2, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { useGestorInformes } from '../hooks/informes/useGestorInformes';
import { useExportarInformes } from '../hooks/informes/useExportarInformes';
import { useFormularioInforme } from '../hooks/informes/useFormularioInforme';
import { useAlertas } from '../context/ContextoAlertas';

// --- SUBCOMPONENTE: Formulario de Informe (Reutilizable para Nuevo y Edición) ---
const FormularioInforme = ({ informeInicial = null, alGuardar, alCancelar, informesExistentes, esEdicion }) => {
  const { mostrarAlerta } = useAlertas();
  const form = useFormularioInforme(informeInicial);
  const inputNumeroClases = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const claseOro = 'efecto-metalico bg-gradient-to-b from-[#e4c580] via-[#fff4cc] to-[#c2963e] text-[#4a3600] border border-[#a87b22] font-bold tracking-wide rounded-sm';
  const clasePlata = 'efecto-metalico bg-gradient-to-b from-[#c0c5cb] via-[#fdfdfd] to-[#949a9f] text-[#1e293b] border border-[#7a828a] font-bold tracking-wide rounded-sm';

  const intentarGuardar = () => {
    if (!form.nombre.trim()) {
      mostrarAlerta("Atención", "El nombre del publicador es obligatorio.", "warning");
      return;
    }

    const nombreNormalizado = form.nombre.trim().toLowerCase();
    const esRepetido = informesExistentes.some(inf => 
      inf.nombre.trim().toLowerCase() === nombreNormalizado && inf.id !== informeInicial?.id
    );

    if (esRepetido) {
      mostrarAlerta("Nombre Repetido", `Ya existe alguien en la lista con el nombre "${form.nombre.trim()}".`, "warning");
      return;
    }

    if (form.celular && form.celular.length !== 10) {
      mostrarAlerta("Celular Inválido", "El número de celular debe tener exactamente 10 dígitos.", "warning");
      return;
    }

    const datosCompilados = form.compilarDatos();
    alGuardar(datosCompilados, form.limpiarFormulario, informeInicial?.id);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Publicador *</label>
          <input type="text" value={form.nombre} onChange={e => form.setNombre(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Celular (WhatsApp, Opcional)</label>
          <input type="tel" maxLength="10" onKeyDown={form.bloquearTeclasInvalidas} value={form.celular} onChange={e => form.setCelular(form.validarNumero(e.target.value))} placeholder="Ej. 3312345678" className={`w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm ${inputNumeroClases}`} />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Privilegio de Servicio</label>
        <div className="flex flex-wrap gap-2">
          {['Publicador', 'Precursor Auxiliar', 'Precursor Regular'].map(t => {
            const seleccionado = form.tipo === t;
            let clasesBtn = 'px-4 py-2.5 text-xs transition-all border shadow-sm ';
            if (seleccionado) {
              if (t === 'Precursor Regular') clasesBtn += claseOro;
              else if (t === 'Precursor Auxiliar') clasesBtn += clasePlata;
              else clasesBtn += 'bg-indigo-600 border-indigo-600 text-white font-bold rounded-sm';
            } else {
              clasesBtn += 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300 font-bold rounded-sm';
            }
            return (
              <button key={t} onClick={() => form.setTipo(t)} className={clasesBtn}>
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {form.tipo === 'Precursor Auxiliar' && (
        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Meta de Horas</label>
          <div className="flex gap-2">
            {['15', '30', 'Manual'].map(m => (
              <button key={m} onClick={() => form.setMetaAuxiliar(m)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all border shadow-sm ${form.metaAuxiliar === m ? 'bg-slate-700 border-slate-700 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                {m}
              </button>
            ))}
          </div>
          {form.metaAuxiliar === 'Manual' && (
            <input type="number" min="0" onKeyDown={form.bloquearTeclasInvalidas} value={form.metaManual} onChange={e => form.setMetaManual(form.validarNumero(e.target.value))} placeholder="Escribe la meta..." className={`mt-3 w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none shadow-sm ${inputNumeroClases}`} />
          )}
        </div>
      )}

      {form.tipo === 'Precursor Regular' && (
        <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30">
          <label className="block text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-widest mb-2">Meta de Horas</label>
          <div className="flex gap-2">
            {['50', 'Manual'].map(m => (
              <button key={m} onClick={() => form.setMetaRegular(m)} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all border shadow-sm ${form.metaRegular === m ? 'bg-yellow-600 border-yellow-600 text-white' : 'bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-600'}`}>
                {m}
              </button>
            ))}
          </div>
          {form.metaRegular === 'Manual' && (
            <input type="number" min="0" onKeyDown={form.bloquearTeclasInvalidas} value={form.metaManual} onChange={e => form.setMetaManual(form.validarNumero(e.target.value))} placeholder="Escribe la meta..." className={`mt-3 w-full bg-white dark:bg-slate-950 border border-yellow-300 dark:border-yellow-700 rounded-md p-3 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none shadow-sm ${inputNumeroClases}`} />
          )}
        </div>
      )}

      {form.tipo === 'Publicador' ? (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <input type="checkbox" id="chkParticipo" checked={form.participo} onChange={e => form.setParticipo(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
          <label htmlFor="chkParticipo" className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">Participó en el ministerio</label>
        </div>
      ) : (
        <div>
          <label className="block text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-widest mb-1.5">Horas realizadas</label>
          <input type="number" min="0" onKeyDown={form.bloquearTeclasInvalidas} value={form.horas} onChange={e => form.setHoras(form.validarNumero(e.target.value))} placeholder="Ej. 50" className={`w-full bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-800/50 rounded-md p-3.5 text-lg font-black text-purple-600 dark:text-purple-400 focus:outline-none focus:border-purple-500 transition-all shadow-sm ${inputNumeroClases}`} />
        </div>
      )}

      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
        <div className="flex items-center gap-3">
          <input type="checkbox" id="chkEstudios" checked={form.tieneEstudios} onChange={e => form.setTieneEstudios(e.target.checked)} className="w-5 h-5 accent-emerald-600 rounded" />
          <label htmlFor="chkEstudios" className="text-sm font-bold text-emerald-800 dark:text-emerald-400 select-none cursor-pointer">Condujo Estudios Bíblicos</label>
        </div>
        {form.tieneEstudios && (
          <input type="number" min="0" onKeyDown={form.bloquearTeclasInvalidas} value={form.cantidadEstudios} onChange={e => form.setCantidadEstudios(form.validarNumero(e.target.value))} placeholder="Cantidad de estudios" className={`mt-4 w-full bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-700 rounded-md p-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none shadow-sm focus:border-emerald-500 ${inputNumeroClases}`} />
        )}
      </div>

      <div className="flex gap-3 pt-3">
        <button onClick={intentarGuardar} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:translate-y-0.5 transition-all">
          <Save size={18} /> {esEdicion ? 'Actualizar' : 'Guardar'}
        </button>
        {esEdicion && (
          <button onClick={alCancelar} className="px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl active:scale-95 transition-all shadow-sm">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function VistaInformeServicio({ alCerrar }) {
  const {
    informes, tituloMes, alertaEliminar, alertaHoras, horasTemporales,
    alertaReiniciar, alertaExitoGuardado, datosPendientesGuardar,
    setAlertaEliminar, setAlertaHoras, setHorasTemporales, setAlertaReiniciar, setDatosPendientesGuardar,
    manejarCambioTitulo, confirmarEliminarDefinitivo, moverArriba, moverAbajo,
    prepararNuevoMes, exportarBackup, importarBackup, procesarDatos, realizarGuardado
  } = useGestorInformes();

  const { exportarExcel, exportarPDF } = useExportarInformes();

  const fileInputRef = useRef(null);
  const [acordeonNuevoAbierto, setAcordeonNuevoAbierto] = useState(true);
  
  useEffect(() => {
    if (informes.length >= 3) {
      setAcordeonNuevoAbierto(false);
    } else {
      setAcordeonNuevoAbierto(true);
    }
  }, [informes.length]);

  const [editandoIdLista, setEditandoIdLista] = useState(null);
  const itemEdicionRef = useRef(null);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  
  const informesFiltrados = useMemo(() => {
    if (!textoBusqueda.trim()) return informes;
    const q = textoBusqueda.toLowerCase();
    return informes.filter(i => i.nombre.toLowerCase().includes(q));
  }, [informes, textoBusqueda]);

  const claseOro = 'efecto-metalico bg-gradient-to-b from-[#e4c580] via-[#fff4cc] to-[#c2963e] text-[#4a3600] border border-[#a87b22] font-bold tracking-wide rounded-sm';
  const clasePlata = 'efecto-metalico bg-gradient-to-b from-[#c0c5cb] via-[#fdfdfd] to-[#949a9f] text-[#1e293b] border border-[#7a828a] font-bold tracking-wide rounded-sm';

  const obtenerColorTipo = (tipo) => {
    if (tipo === 'Precursor Regular') return claseOro;
    if (tipo === 'Precursor Auxiliar') return clasePlata;
    return 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700 font-bold rounded-sm';
  };

  const obtenerColorHoras = () => 'bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/50 font-bold rounded-sm';
  const obtenerColorEstudios = () => 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/50 font-bold rounded-sm';
  
  const obtenerColorMetaLograda = (horasRealizadas, meta) => {
    const h = parseInt(horasRealizadas) || 0;
    const m = parseInt(meta) || 0;
    if (h >= m && m > 0) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50 font-bold rounded-sm';
    return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/50 font-bold rounded-sm';
  };

  const orquestarGuardado = (datosCompilados, limpiarFn, editId) => {
    const horasNum = parseInt(datosCompilados.horas) || 0;
    
    if (datosCompilados.tipo !== 'Publicador' && (!datosCompilados.horas || horasNum === 0)) {
      setHorasTemporales(datosCompilados.horas);
      setDatosPendientesGuardar({ datos: datosCompilados, limpiar: limpiarFn, id: editId });
      setAlertaHoras(true);
      return;
    }

    realizarGuardado(datosCompilados, editId).then(() => {
      if (limpiarFn) limpiarFn();
      if (editId) setEditandoIdLista(null);
    });
  };

  const confirmarGuardadoAlertaHoras = () => {
    if (!datosPendientesGuardar) return;
    const datosFinales = { ...datosPendientesGuardar.datos, horas: horasTemporales };
    realizarGuardado(datosFinales, datosPendientesGuardar.id).then(() => {
      if (datosPendientesGuardar.limpiar) datosPendientesGuardar.limpiar();
      if (datosPendientesGuardar.id) setEditandoIdLista(null);
      setAlertaHoras(false);
      setDatosPendientesGuardar(null);
    });
  };

  const irAWhatsapp = (celular) => {
    if (celular && celular.length === 10) {
      window.open(`https://wa.me/52${celular}`, '_blank');
    }
  };

  const iniciarEdicion = (id) => {
    if (editandoIdLista === id) {
        setEditandoIdLista(null);
    } else {
        setEditandoIdLista(id);
        setTimeout(() => {
             if (itemEdicionRef.current) {
                 itemEdicionRef.current.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start'
                 });
             }
         }, 100);
    }
  };

  const inputNumeroClases = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
      
      {/* Alerta: Confirmar Eliminar */}
      {alertaEliminar && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-rose-200 dark:border-rose-900/50 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-500">
              <AlertTriangle size={24} />
              <h4 className="text-lg font-black uppercase tracking-wider">Eliminar registro</h4>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar permanentemente a este publicador? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAlertaEliminar(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={() => { confirmarEliminarDefinitivo(); setEditandoIdLista(null); }} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta: Preparar Nuevo Mes */}
      {alertaReiniciar && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-indigo-200 dark:border-indigo-900/50 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-indigo-600 dark:text-indigo-500">
              <RefreshCcw size={24} />
              <h4 className="text-lg font-black uppercase tracking-wider">Nuevo Mes</h4>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              Se pondrán las horas, estudios y participación en cero para iniciar el registro del siguiente mes. Todos los publicadores y su estatus se mantendrán. ¿Deseas continuar?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAlertaReiniciar(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={prepararNuevoMes} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors">
                Sí, iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta: Horas en Cero */}
      {alertaHoras && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-amber-200 dark:border-amber-900/50 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-amber-500">
              <Clock size={24} />
              <h4 className="text-lg font-black uppercase tracking-wider">¿Faltan horas?</h4>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
              ¿El publicador no informará horas? Si se te olvidó poner ese dato, puedes ponerlo aquí:
            </p>
            <input 
              type="number" 
              min="0"
              value={horasTemporales} 
              onChange={e => setHorasTemporales(e.target.value.replace(/[^0-9]/g, ''))} 
              placeholder="Escribe las horas..." 
              className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-xl font-black text-center text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 ${inputNumeroClases}`}
            />
            <div className="flex gap-3">
              <button onClick={() => { setAlertaHoras(false); setDatosPendientesGuardar(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button 
                onClick={confirmarGuardadoAlertaHoras} 
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors"
              >
                Sí, seguir con {horasTemporales || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Principal */}
      <div className="relative z-20 bg-indigo-600/90 dark:bg-indigo-900/90 backdrop-blur-xl px-5 py-4 border-b border-indigo-500/30 shadow-md flex items-center justify-between shrink-0">
        <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2 drop-shadow-sm">
          <FileText size={18} /> Control de Informes
        </h2>
        <button onClick={alCerrar} className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white backdrop-blur-md active:scale-95 transition-all border border-white/20">
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-amber-100/80 dark:bg-amber-900/50 backdrop-blur-md border-b border-amber-200/50 dark:border-amber-800/50 px-5 py-3 flex items-center justify-center gap-3 shrink-0">
        <AlertTriangle size={18} className="text-amber-700 dark:text-amber-400" />
        <span className="text-[11px] sm:text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest text-center">
          Privacidad local: Esta información solo vive en tu dispositivo.
        </span>
      </div>

      {/* CONTENEDOR PRINCIPAL: DIVIDIDO EN ESCRITORIOS ANCHOS (lg) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:flex lg:flex-row lg:gap-8 lg:max-w-7xl lg:mx-auto w-full">
        
        {/* COLUMNA IZQUIERDA: Controles, Botones y Formulario de Agregar */}
        <div className="flex flex-col gap-5 lg:w-[40%] shrink-0 mb-6 lg:mb-0">
          
          <div className="shrink-0">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título del Mes / Congregación</label>
            <input 
              type="text" 
              value={tituloMes} 
              onChange={manejarCambioTitulo} 
              placeholder="Ej. Informe de Agosto 2026" 
              className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-base font-black text-indigo-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" 
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
            <button onClick={() => exportarExcel(procesarDatos(), tituloMes)} disabled={informes.length === 0} className="flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase tracking-widest font-bold py-3 rounded-xl shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all border border-emerald-500">
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button onClick={() => exportarPDF(procesarDatos(), tituloMes)} disabled={informes.length === 0} className="flex flex-col items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] uppercase tracking-widest font-bold py-3 rounded-xl shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all border border-rose-500">
              <FileText size={16} /> PDF
            </button>
            <button onClick={exportarBackup} disabled={informes.length === 0} className="flex flex-col items-center justify-center gap-1 bg-slate-600 hover:bg-slate-500 text-white text-[10px] uppercase tracking-widest font-bold py-3 rounded-xl shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all border border-slate-500">
              <Download size={16} /> Backup
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase tracking-widest font-bold py-3 rounded-xl shadow-md active:translate-y-0.5 transition-all border border-indigo-500">
              <Upload size={16} /> Importar
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={importarBackup} className="hidden" />
          </div>

          <div className="shrink-0">
            <button onClick={() => setAlertaReiniciar(true)} disabled={informes.length === 0} className="w-full flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-700 dark:text-amber-400 text-xs uppercase tracking-widest font-bold py-3 rounded-xl shadow-sm active:translate-y-0.5 disabled:opacity-50 transition-all border border-amber-300 dark:border-amber-700/50">
              <RefreshCcw size={14} className="text-amber-600 dark:text-amber-500" /> Preparar siguiente mes
            </button>
          </div>

          {/* Acordeón de Creación */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300 shrink-0">
            <button 
              onClick={() => setAcordeonNuevoAbierto(!acordeonNuevoAbierto)} 
              className="w-full p-4 md:p-6 flex justify-between items-center bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">
                  Añadir Publicador
                </h3>
                {alertaExitoGuardado && (
                  <div className="flex items-center gap-1 text-emerald-500 animate-in zoom-in slide-in-from-left-2">
                    <CheckCircle2 size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">¡Añadido!</span>
                  </div>
                )}
              </div>
              {acordeonNuevoAbierto ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {acordeonNuevoAbierto && (
              <div className="p-4 md:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/50">
                <FormularioInforme 
                  alGuardar={orquestarGuardado}
                  informesExistentes={informes}
                  esEdicion={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Buscador y Lista de Registros */}
        <div className="flex flex-col gap-4 lg:w-[60%] flex-1 h-full">
          
          {/* BUSCADOR */}
          <div className="relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              value={textoBusqueda}
              onChange={e => setTextoBusqueda(e.target.value)}
              placeholder="Buscar publicador por nombre..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm transition-colors"
            />
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-md flex-1 flex flex-col min-h-[400px]">
            <h3 className="font-black text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-widest text-sm drop-shadow-sm flex items-center gap-2 shrink-0">
              Lista de Registros <span className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">{informesFiltrados.length}</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto scroll-limpio pr-2 space-y-3 pb-6">
              {informes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400/80 text-sm font-bold uppercase tracking-widest">No hay registros aún.</div>
              ) : informesFiltrados.length === 0 ? (
                <div className="py-8 text-center text-slate-400/80 text-sm font-bold uppercase tracking-widest">No se encontraron resultados.</div>
              ) : (
                informesFiltrados.map((inf, index) => {
                  const horasNum = parseInt(inf.horas) || 0;
                  const participoReal = inf.tipo === 'Publicador' ? inf.participo : (horasNum > 0);
                  const estaEditando = editandoIdLista === inf.id;
                  const tieneWhatsappValid = inf.celular && inf.celular.length === 10;

                  return (
                    <div 
                      key={inf.id} 
                      ref={estaEditando ? itemEdicionRef : null}
                      className={`flex flex-col rounded-xl border shadow-sm transition-all overflow-hidden ${participoReal ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'}`}
                    >
                      
                      <div className="flex items-stretch">
                        <div className={`flex flex-col border-r shrink-0 ${participoReal ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-red-100/50 dark:bg-red-900/40 border-red-200 dark:border-red-800/30'}`}>
                          <button onClick={() => moverArriba(index)} disabled={index === 0 || textoBusqueda.length > 0} className="flex-1 px-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-20 transition-colors">
                            <ArrowUp size={16} strokeWidth={2.5} />
                          </button>
                          <div className={`h-[1px] w-full ${participoReal ? 'bg-slate-200 dark:bg-slate-800' : 'bg-red-200 dark:bg-red-800/30'}`}></div>
                          <button onClick={() => moverAbajo(index)} disabled={index === informes.length - 1 || textoBusqueda.length > 0} className="flex-1 px-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-20 transition-colors">
                            <ArrowDown size={16} strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="flex-1 p-4 flex justify-between items-center gap-2">
                          <div className="flex-1">
                            <div className="font-black text-slate-800 dark:text-slate-100 text-base mb-2.5 flex items-center justify-between">
                              <span>{inf.nombre}</span>
                              <button 
                                onClick={() => irAWhatsapp(inf.celular)}
                                disabled={!tieneWhatsappValid}
                                className={`p-1.5 rounded-full border transition-all shrink-0 ${tieneWhatsappValid ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'}`}
                                title={tieneWhatsappValid ? 'Enviar WhatsApp' : 'No tiene celular válido'}
                              >
                                <MessageCircle size={16} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                              <span className={`px-2.5 py-1 ${obtenerColorTipo(inf.tipo)}`}>
                                {inf.tipo === 'Precursor Regular' ? 'REGULAR' : inf.tipo === 'Precursor Auxiliar' ? 'AUXILIAR' : inf.tipo}
                              </span>
                              
                              {(inf.tipo === 'Precursor Auxiliar' || inf.tipo === 'Precursor Regular') && (
                                <span className={`px-2.5 py-1 ${obtenerColorMetaLograda(inf.horas, inf.meta)}`}>
                                  Meta: {inf.meta}h
                                </span>
                              )}
                              
                              {inf.tipo !== 'Publicador' && (
                                <span className={`px-2.5 py-1 ${obtenerColorHoras()}`}>
                                  Horas: {(!inf.horas || inf.horas === 'N/A') ? '0' : inf.horas}
                                </span>
                              )}
                              
                              {inf.tipo === 'Publicador' && (
                                <span className={`px-2.5 py-1 rounded-sm shadow-sm border ${inf.participo ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700/50' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800/50'}`}>
                                  {inf.participo ? 'Participó' : 'No participó'}
                                </span>
                              )}
                              
                              {inf.estudios > 0 && (
                                <span className={`px-2.5 py-1 ${obtenerColorEstudios()}`}>
                                  Estudios: {inf.estudios}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => iniciarEdicion(inf.id)} 
                            className={`ml-2 p-3 rounded-xl transition-all shadow-sm active:scale-95 border shrink-0 ${estaEditando ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'}`}
                            title="Editar registro"
                          >
                            {estaEditando ? <ChevronUp size={20} strokeWidth={2.5} /> : <Edit2 size={20} strokeWidth={2.5} />}
                          </button>
                        </div>
                      </div>

                      {estaEditando && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                          <FormularioInforme 
                            informeInicial={inf}
                            informesExistentes={informes}
                            alGuardar={orquestarGuardado}
                            alCancelar={() => setEditandoIdLista(null)}
                            esEdicion={true}
                          />
                          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-start">
                            <button 
                              onClick={() => { setAlertaEliminar(inf.id); }} 
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <Trash2 size={14} /> Eliminar permanentemente
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }
        .efecto-metalico {
          position: relative;
          overflow: hidden;
          background-size: 100% 100%;
        }
        .efecto-metalico::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer-slide 2.5s infinite;
          pointer-events: none;
        }
      `}</style>

    </div>
  );
}