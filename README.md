# Viajando soy Feliz — paquete de despliegue

Aplicación web adaptable (PWA) con backend Node/Express, SQLite y primera integración preparada con Travelpayouts / Aviasales Data API.

## Qué funciona en este paquete
- Interfaz pública adaptable a móvil y ordenador.
- Filtros y presupuesto máximo de 300 € por persona.
- Backend para almacenar ofertas e historial de precios.
- Escaneo manual mediante `POST /api/scan/run`.
- Programador diario a las 05:00, hora `Europe/Madrid`, mientras el proceso Node permanezca activo.
- Adaptador inicial de vuelos Aviasales Data API; también conserva un adaptador genérico para otros proveedores.
- Evaluación heurística de señales de riesgo: es orientativa y no certifica que un vendedor sea legítimo.

## Limitaciones importantes
- Aviasales Data API devuelve precios observados y guardados en caché; no garantiza disponibilidad ni precio final. Hay que confirmar el importe y las condiciones en la web de reserva.
- La integración inicial cubre vuelos. Hoteles, apartamentos, paquetes, cruceros y viajes organizados requieren proveedores y permisos adicionales.
- El origen `ES` intenta recuperar precios asociados a España, pero la API no garantiza cubrir todos los aeropuertos españoles ni todos los destinos.
- No se procesan reservas ni pagos.
- Un alojamiento gratuito con suspensión automática no garantiza el escaneo diario. SQLite necesita almacenamiento persistente; si el proveedor borra el disco al reiniciar, se perderán los datos.

## Arranque local
Requiere Node.js 20 o superior.

```bash
npm install
cp .env.example .env
# Añade TRAVELPAYOUTS_TOKEN en .env cuando tengas tu token
npm start
```

Abre `http://localhost:3000`. Para probar el backend sin proveedor, consulta `GET /api/health`. El escaneo no encontrará vuelos reales hasta introducir un token válido.

## Variables de entorno
- `TRAVELPAYOUTS_TOKEN`: token de API de Travelpayouts (secreto; solo en variables del servidor).
- `TRAVELPAYOUTS_ORIGIN=ES`: país de origen para la consulta de vuelos.
- `TRAVELPAYOUTS_MARKET=es`: mercado solicitado.
- `TRAVELPAYOUTS_LIMIT=100`: máximo solicitado (1–100).
- `ADMIN_SCAN_TOKEN`: protege el endpoint manual de escaneo; configura una cadena larga y aleatoria.
- `DB_PATH`: ruta de la base SQLite. Debe estar en un disco persistente en producción.
- `DISABLE_SCHEDULER=1`: desactiva el programador local.

## Despliegue público
El proyecto incluye `Dockerfile` y `render.yaml` como punto de partida para un servicio web. La URL gratuita tipo `*.onrender.com` puede servir como dirección temporal pública, pero el plan gratuito puede suspender el servicio y no ofrece persistencia de disco. Por tanto, úsalo para enseñar/probar la web, no como solución fiable para escaneos diarios ni para conservar histórico. Para producción hace falta un proceso siempre activo y almacenamiento persistente (o separar base de datos y tareas programadas).

1. Sube este proyecto a un repositorio privado o público de GitHub.
2. Crea un servicio web desde ese repositorio en Render usando el `render.yaml`.
3. Configura `TRAVELPAYOUTS_TOKEN` y `ADMIN_SCAN_TOKEN` como secretos/variables del servicio; no los guardes en GitHub ni los envíes por chat.
4. Cuando el servicio indique que está desplegado, abre su URL `https://...onrender.com`.
5. Comprueba `GET /api/health` y ejecuta un escaneo manual desde un cliente autorizado con el encabezado `x-admin-token`.
6. Antes de anunciarlo como servicio operativo, configura almacenamiento persistente y un plan/proceso que no se suspenda; después verifica que se ejecuta el escaneo diario.

## Endpoints
- `GET /api/health`
- `GET /api/offers`
- `GET /api/scan/status`
- `POST /api/scan/run` (si se define `ADMIN_SCAN_TOKEN`, requiere `x-admin-token`).

Consulta `ALTA_PROVEEDORES_ES.md` para el alta de Travelpayouts y las condiciones de uso.
