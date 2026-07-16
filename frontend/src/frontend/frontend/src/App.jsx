import React, { useState } from 'react';

export default function App() {
  const [comunidad, setComunidad] = useState('Extremadura');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const simularAnalisis = () => {
    setLoading(true);
    // Simulamos la respuesta que nos dará el backend de Python
    setTimeout(() => {
      setResultado({
        cultivo: "Olivar",
        problema: "Prays oleae (Polilla del olivo)",
        tipo: "Plaga",
        clima: comunidad === "Extremadura" 
          ? { fuente: "REDAREX (Estación Local)", temp: "26°C", humedad: "55%", viento: "12 km/h", estado: "Condiciones óptimas para tratamiento" }
          : { fuente: "AEMET (API Global)", temp: "28°C", humedad: "40%", viento: "18 km/h", estado: "Precaución por viento alto" },
        productos: [
          { nombre: "Deltametrin 2.5%", dosis: "0.3-0.5 L/ha", estado: "Autorizado MAPA" },
          { nombre: "Bacillus thuringiensis", dosis: "0.5-1 kg/ha", estado: "Autorizado Ecológico" }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col font-sans pb-10 shadow-lg border-x border-slate-200">
      {/* Cabecera de la App */}
      <header className="bg-emerald-700 text-white p-5 rounded-b-3xl shadow-md text-center">
        <h1 className="text-2xl font-bold tracking-tight">AgroTech Fitosanitario</h1>
        <p className="text-emerald-100 text-xs mt-1">Identificación de plagas y control regulatorio</p>
      </header>

      <main className="p-4 flex-1 space-y-5">
        {/* Sección de Selección de Zona */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Comunidad Autónoma</label>
          <select 
            value={comunidad} 
            onChange={(e) => setComunidad(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Extremadura">Extremadura (Conexión REDAREX)</option>
            <option value="Andalucia">Andalucía</option>
            <option value="CastillaLaMancha">Castilla-La Mancha</option>
            <option value="Aragon">Aragón</option>
          </select>
          {comunidad === 'Extremadura' && (
            <p className="text-emerald-600 text-xs font-semibold mt-2 flex items-center gap-1">
              🟢 Modo REDAREX Activo: Se conectará a las estaciones meteorológicas locales de la Junta de Extremadura.
            </p>
          )}
        </div>

        {/* Botón de Captura / Cámara */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-emerald-300">
            <span className="text-3xl">📸</span>
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-sm">Analizar Estado del Cultivo</h3>
            <p className="text-slate-400 text-xs mt-1">Haz una foto o sube una imagen de las hojas o plantas afectadas en el campo.</p>
          </div>
          <button 
            onClick={simularAnalisis}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl transition shadow-md active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? 'Analizando cultivo con IA...' : 'Simular Captura de Foto'}
          </button>
        </div>

        {/* Pantalla de Carga */}
        {loading && (
          <div className="text-center py-8 space-y-2">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            <p className="text-slate-500 text-sm font-medium">Procesando imagen y ejecutando scrapers gubernamentales...</p>
          </div>
        )}

        {/* Resultados del Scraping e IA */}
        {resultado && !loading && (
          <div className="space-y-4 animate-fadeIn">
            {/* Tarjeta Diagnóstico */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-4 rounded-2xl shadow-md">
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">Resultado IA</span>
              <h2 className="text-xl font-bold mt-1">{resultado.problema}</h2>
              <p className="text-emerald-200 text-sm mt-0.5">Detectado en cultivo de: <span className="font-bold">{resultado.cultivo}</span></p>
            </div>

            {/* Tarjeta Clima Especial (REDAREX) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 text-sm">Condiciones Agroclimáticas</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100">{resultado.clima.fuente}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center my-3">
                <div className="bg-slate-50 p-2 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Temp</p><p className="text-sm font-bold text-slate-700">{resultado.clima.temp}</p></div>
                <div className="bg-slate-50 p-2 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Humedad</p><p className="text-sm font-bold text-slate-700">{resultado.clima.humedad}</p></div>
                <div className="bg-slate-50 p-2 rounded-xl"><p className="text-[10px] text-slate-400 font-bold uppercase">Viento</p><p className="text-sm font-bold text-slate-700">{resultado.clima.viento}</p></div>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium text-center">
                📢 {resultado.clima.estado}
              </p>
            </div>

            {/* Tarjeta Fitosanitarios Ministerio */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm">Productos Autorizados (REGFIWEB)</h3>
                <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100">Ministerio Agricultura</span>
              </div>
              <div className="space-y-2.5">
                {resultado.productos.map((prod, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{prod.nombre}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Dosis: {prod.dosis}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-1 rounded-md border border-emerald-100">
                      {prod.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
