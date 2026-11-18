# Viajando soy Feliz — alta de proveedor e integración inicial

## 1. Travelpayouts / Aviasales (vuelos)

La primera integración preparada es la **Aviasales Data API** a través de Travelpayouts. La API de datos devuelve precios almacenados en caché, basados en búsquedas anteriores; no es una búsqueda de inventario en tiempo real ni una garantía de que el precio siga disponible.

1. Regístrate en [Travelpayouts](https://www.travelpayouts.com/).
2. Crea el proyecto de la aplicación **Viajando soy Feliz** y sigue el proceso de alta que muestre el panel.
3. Localiza el token de API de datos en tu perfil, en la sección API token.
4. Introduce el token como variable secreta `TRAVELPAYOUTS_TOKEN` en el alojamiento.
5. Mantén `TRAVELPAYOUTS_ORIGIN=ES`, `TRAVELPAYOUTS_MARKET=es` y `TRAVELPAYOUTS_LIMIT=100` al principio.
6. Ejecuta el endpoint manual de escaneo y revisa las fechas, precios y rutas devueltas.

No pegues el token en esta conversación ni lo incluyas en archivos públicos o repositorios.

## 2. Alcance y limitaciones

- Esta integración solo alimenta la categoría **Vuelos**.
- Los precios son referencias de caché y pueden estar desactualizados. La aplicación debe identificarlos como tales y el usuario debe confirmar el precio final antes de reservar.
- El filtro `actual` de la API se utiliza para descartar registros que la fuente no marca como actuales, pero eso no equivale a disponibilidad en tiempo real.
- El parámetro de origen `ES` no garantiza la cobertura de cada aeropuerto español.
- No se ha conectado todavía ninguna API de hoteles, apartamentos, cruceros, paquetes ni circuitos.
- La evaluación de riesgo del código es heurística; no acredita la legitimidad de un vendedor.

## 3. Documentación oficial

- [Requisitos de acceso a Aviasales Data API](https://support.travelpayouts.com/hc/en-us/articles/203956083-Requirements-for-Aviasales-data-API-access)
- [Documentación Aviasales Data API](https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API)
- [Límites de peticiones API](https://support.travelpayouts.com/hc/en-us/articles/4402565416594-API-rate-limits)

## 4. Próximas integraciones

Después de validar vuelos, se debe solicitar acceso a proveedores de hoteles y actividades por separado. El acceso a cada API puede exigir revisión, contrato o aprobación. No hay una API única que proporcione automáticamente todas las categorías.
