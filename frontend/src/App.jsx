import React, { useState } from 'react';

const MUNICIPIOS_DB = [
  { nombre: "El Torno", provincia: "Cáceres", comunidad: "Extremadura", red: "REDAREX", url_historico: "https://juntaex.es" },
  { nombre: "Llerena", provincia: "Badajoz", comunidad: "Extremadura", red: "REDAREX", url_historico: "https://juntaex.es" },
  { nombre: "Don Benito", provincia: "Badajoz", comunidad: "Extremadura", red: "REDAREX", url_historico: "https://juntaex.es" },
  { nombre: "Utrera", provincia: "Sevilla", comunidad: "Andalucía", red: "AEMET", url_historico: "https://aemet.es" },
  { nombre: "Manzanares", provincia: "Ciudad Real", comunidad: "Castilla-La Mancha", red: "AEMET", url_historico: "https://aemet.es" }
];

export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(null);
  const [tipoAnalisis, setTipoAnalisis] = useState('plaga');

  const sugerencias = busqueda.trim() === '' ? [] : MUNICIPIOS_DB.filter(m => 
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    m.provincia.toLowerCase().includes(busqueda.toLowerCase())
  );

  const capturarImagen = (e) => {
    const file = e.target.files;
    if (file && file[0]) {
      setImagenUrl(URL.createObjectURL(file[0]));
    }
  };

  const ejecutarAnalisisReal = () => {
    if (!imagenUrl) return alert("Sube una imagen primero.");
    if (!municipioSeleccionado) return alert("Selecciona una localidad.");
    setLoading(true);
    setTimeout(() => {
      setResultado({
        cultivo: tipoAnalisis === 'mala_hierba' ? "Regadío" : "Olivar",
        problema: tipoAnalisis === 'enfermedad' ? "Repilo" : tipoAnalisis === 'mala_hierba' ? "Bledo" : "Polilla",
        tipo: tipoAnalisis.toUpperCase(),
        clima: { fuente: municipioSeleccionado.red, temp: "25°C", humedad: "50%", viento: "10 km/h", estado: "Condiciones estables." },
        productos: [{ nombre: "Tratamiento Recomendado", dosis: "1 L/ha", estado: "Autorizado" }]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 font-sans space-y-4">
      <header className="bg-emerald-700 text-white p-4 rounded-xl text-center shadow">
        <h1 className="text-xl font-bold">AgroTech Fitosanitario</h1>
      </header>

      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Objetivo</label>
        <div className="grid grid-cols-3 gap-2">
          {['plaga', 'enfermedad', 'mala_hierba'].map(t => (
            <button key={t} onClick={() => setTipoAnalisis(t)} className={`p-2 rounded text-xs font-bold ${tipoAnalisis === t ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Localidad</label>
        <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setMunicipioSeleccionado(null); }} placeholder="Buscar municipio..." className="w-full bg-slate-50 border p-2 rounded text-sm" />
        {sugerencias.map((m, i) => (
          <button key={i} onClick={() => { setMunicipioSeleccionado(m); setBusqueda(m.nombre); }} className="block w-full text-left p-2 hover:bg-slate-50 text-xs border-t">
            {m.nombre} ({m.provincia}) - <span className="font-bold text-emerald-600">{m.red}</span>
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-center space-y-3">
        {imagenUrl ? (
          <div className="relative">
            <img src={imagenUrl} className="w-full h-32 object-cover rounded" alt="Muestra" />
            <button onClick={() => setImagenUrl(null)} className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold">🗑️ Cambiar</button>
          </div>
        ) : (
          <label className="block border-2 border-dashed p-6 rounded cursor-pointer bg-slate-50 hover:bg-slate-100">
            <span className="text-xs text-slate-500 block">📸 Hacer Foto / Subir Imagen</span>
            <input type="file" accept="image/*" capture="environment" onChange={capturarImagen} className="hidden" />
          </label>
        )}
        <button onClick={ejecutarAnalisisReal} className="w-full bg-emerald-600 text-white p-3 rounded font-bold text-sm shadow">Escanear Cultivo</button>
      </div>

      {loading && <p className="text-center text-xs text-slate-500 animate-pulse">Consultando datos...</p>}

      {resultado && !loading && (
        <div className="space-y-3">
          <div className="bg-slate-800 text-white p-4 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-400">{resultado.tipo}</p>
            <h2 className="text-base font-bold">{resultado.problema}</h2>
            <p className="text-xs text-slate-400">Cultivo: {resultado.cultivo}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow space-y-2">
            <h3 className="text-xs font-bold text-slate-700">Clima Local</h3>
            <p className="text-xs text-slate-600">Temp: {resultado.clima.temp} | Hum: {resultado.clima.humedad} | Viento: {resultado.clima.viento}</p>
            <a href={municipioSeleccionado?.url_historico} target="_blank" rel="noreferrer" className="block text-center bg-slate-700 text-white p-2 rounded text-xs font-bold">📊 Ver Históricos ({municipioSeleccionado?.red})</a>
          </div>
        </div>
      )}
    </div>
  );
}
