# Conectar proveedores reales

El motor de fase 2 admite un adaptador HTTP autorizado. Configura `TRAVEL_PROVIDER_URL` y, si procede, `TRAVEL_PROVIDER_TOKEN` en el servidor. El endpoint debe responder:

```json
{
  "offers": [
    {
      "id": "identificador-del-proveedor",
      "title": "Vuelo ida y vuelta",
      "category": "Vuelos",
      "origin": "Málaga (AGP)",
      "destination": "Roma (FCO)",
      "price": 119.5,
      "currency": "EUR",
      "per_person": true,
      "source": "Nombre del proveedor",
      "seller_name": "Vendedor que cobra",
      "seller_domain": "ejemplo.com",
      "booking_url": "https://ejemplo.com/oferta",
      "departure_date": "2027-02-12",
      "return_date": "2027-02-15"
    }
  ]
}
```

## Proveedores candidatos (requieren aprobación/credenciales)
- Booking.com Demand API: https://developers.booking.com/demand/docs/open-api/3.2/demand-api
- KAYAK Affiliate Network: https://affiliates.kayak.com/
- Amadeus for Developers: https://developers.amadeus.com/api-catalog

No se han incluido credenciales ni se simulan respuestas. Las APIs pueden tener restricciones de mercado, inventario, afiliación y uso comercial.

## Verificación antifraude
El módulo actual es un filtro heurístico preliminar, NO una certificación de seguridad. La fase siguiente debe añadir consulta de registros mercantiles/identidad fiscal cuando proceda, reputación y reclamaciones en fuentes fiables, antigüedad y titularidad del dominio cuando los datos estén disponibles, comprobación de precio final en el proveedor y revisión de términos de cancelación. El riesgo bajo no equivale a garantía de que el vendedor sea legítimo.

## Escaneo diario
El servidor ejecuta el trabajo a las 05:00 (Europe/Madrid). Para que ocurra todos los días debe estar desplegado en un servidor/hosting que permanezca encendido. No depende de que la app móvil esté abierta.
