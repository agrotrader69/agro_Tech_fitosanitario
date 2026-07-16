from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
from bs4 import BeautifulSoup

app = FastAPI(
    title="AgroTech Fitosanitario API",
    description="Backend en Python para identificación de plagas y consulta de REGFIWEB/REDAREX"
)

# Configuración de CORS obligatoria para conectar con el frontend móvil
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LocationQuery(BaseModel):
    latitud: float
    longitud: float
    comunidad: str
    fecha_hora: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "online", "message": "Servidor AgroTech Fitosanitario Activo"}

@app.post("/api/analizar-cultivo")
async def analizar_cultivo(comunidad: str, file: UploadFile = File(...)):
    resultado_ia = {
        "cultivo": "Olivar",
        "problema_detectado": "Prays oleae (Polilla del olivo)",
        "tipo": "Plaga"
    }
    clima_datos = {}
    if comunidad.lower() == "extremadura":
        clima_datos = await consultar_redarex()
    return {
        "analisis": resultado_ia,
        "clima_local": clima_datos,
        "fuente_clima": "REDAREX (Extremadura)" if comunidad.lower() == "extremadura" else "API Genérica"
    }

async def consultar_redarex():
    url_redarex = "https://juntaex.es"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            response = await client.get(url_redarex, headers=headers)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                return {"temperatura": "24°C", "humedad": "65%", "estado": "Conectado a estación REDAREX"}
    except Exception as e:
        return {"error": f"No se pudo conectar a REDAREX: {str(e)}"}
    return {"estado": "Sin datos de la estación"}
