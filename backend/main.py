from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import math

app = FastAPI(title="AgroTech Global Router")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estaciones físicas oficiales de REDAREX de la Junta de Extremadura con sus posiciones en el mapa
ESTACIONES_REDAREX = [
    {"id": "6_201", "nombre": "Badajoz (Guadajira)", "lat": 38.8786, "lon": -6.8364},
    {"id": "6_205", "nombre": "Don Benito", "lat": 38.9544, "lon": -5.8611},
    {"id": "6_109", "nombre": "Llerena", "lat": 38.2378, "lon": -6.0139},
    {"id": "5_102", "nombre": "Plasencia (Valle del Jerte)", "lat": 40.0294, "lon": -6.0894},
    {"id": "5_104", "nombre": "Trujillo / Logrosán", "lat": 39.4622, "lon": -5.8814},
    {"id": "5_101", "nombre": "Cáceres (La Orden)", "lat": 39.4764, "lon": -6.3722}
]

# Servidor público que aloja el listado oficial de los 8.132 municipios de España con sus coordenadas
URL_MUNICIPIOS_ESPANA = "https://githubusercontent.com"

def calcular_distancia(lat1, lon1, lat2, lon2):
    """Fórmula matemática de Haversine para calcular distancias reales sobre el terreno"""
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 6371 * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

@app.get("/api/buscar-localidad")
async def buscar_localidad(q: str):
    query = q.lower().strip()
    if len(query) < 3:
        return []

    # El servidor descarga en tiempo real el censo geográfico completo de España
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(URL_MUNICIPIOS_ESPANA)
            municipios = response.json()
        except Exception:
            raise HTTPException(status_code=500, detail="Error al cargar la base de datos geográfica nacional")

    resultados = []
    # Buscamos coincidencias de texto en todo el censo de España
    for m in municipios:
        nombre_m = m.get("nombre", "").lower()
        if query in nombre_m:
            lat = float(m.get("latitud", 0))
            lon = float(m.get("longitud", 0))
            provincia = m.get("provincia", "Desconocida")
            comunidad = m.get("comunidad", "España")

            # Si el municipio pertenece a Extremadura (Cáceres o Badajoz), activamos la red REDAREX
            if comunidad.lower() == "extremadura" or provincia.lower() in ["cáceres", "badajoz", "caceres"]:
                # Calculamos automáticamente cuál es la estación física de REDAREX más cercana a este pueblo
                estacion_cercana = None
                distancia_minima = float('inf')
                for est in ESTACIONES_REDAREX:
                    d = calcular_distancia(lat, lon, est["lat"], est["lon"])
                    if d < distancia_minima:
                        distancia_minima = d
                        estacion_cercana = est

                url_redarex = f"https://juntaex.es{estacion_cercana['id']}"
                resultados.append({
                    "nombre": m["nombre"],
                    "provincia": provincia,
                    "red": "REDAREX",
                    "url_historico": url_redarex,
                    "detalle": f"Estación {estacion_cercana['nombre']} a {round(distancia_minima, 1)} km"
                })
            else:
                # Si el municipio es de cualquier otra parte de España, enrutamos automáticamente a la AEMET
                resultados.append({
                    "nombre": m["nombre"],
                    "provincia": provincia,
                    "red": "AEMET",
                    "url_historico": "https://aemet.es",
                    "detalle": "Derivado a Red Nacional (AEMET)"
                })
            
            # Limitamos a 5 sugerencias en pantalla para que la lista del móvil no sea eterna
            if len(resultados) >= 5:
                break

    return resultados
