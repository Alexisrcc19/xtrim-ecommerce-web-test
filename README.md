# XTRIM · Ecommerce público

Frontend de demostración independiente, construido con Next.js 16 App Router, React, TypeScript estricto y Tailwind CSS 4. No es el sitio oficial de XTRIM. Los planes y precios provienen de la API Express; no hay un catálogo de respaldo hardcodeado.

## Ejecutar

Requiere Node.js 24 y pnpm. Instala con `pnpm install`. Usa `.env.example` como referencia para configurar tu entorno local; no contiene secretos:

- `NEXT_PUBLIC_API_URL`: base pública de Express, incluyendo `/api/v1`. Por defecto `http://localhost:4000/api/v1`.
- `NEXT_PUBLIC_SITE_URL`: URL del frontend para canonical, robots y sitemap. Por defecto `http://localhost:3000`; debe ser el dominio público al desplegar.

Inicia Express por separado según su README y ejecuta `pnpm dev`. Abre http://localhost:3000. El backend debe permitir este origen en `FRONTEND_URL`; el POST se realiza directamente desde el navegador. Para producción: `pnpm build` y `pnpm start`. Las variables públicas deben estar configuradas antes del build.

No configurar `ADMIN_API_TOKEN` ni `DATABASE_URL` en este frontend. No se implementan persistencia, API paralela ni CRM.

## Rutas y contrato

- `/`: inicio con planes destacados obtenidos desde Express.
- `/planes`: catálogo completo de planes activos; detalles y solicitud en un diálogo accesible.
- `/sitemap.xml`: incluye únicamente inicio y catálogo.
- `/robots.txt`: excluye `/admin` y `/api/`.

Se consume `GET /api/v1/plans`, con respuesta `{ data: ... }`. El detalle modal utiliza el mismo objeto completo recibido en el catálogo. Los planes usan `id`, `name`, `slug`, `description`, `speed_mbps`, `monthly_price` (decimal como cadena) e `is_active`.

El formulario envía exclusivamente `{ full_name, phone, province, plan_id }` a `POST /api/v1/leads`, sin autenticación. Solo muestra éxito con HTTP 201 y `{ data: { id, status: "NEW", created_at } }`. Muestra el UUID real de la solicitud. Se manejan validación (400), plan no disponible (422), límite de intentos (429 y `Retry-After`), fallo de servidor y error de conexión. No se reintenta automáticamente un POST: tras un fallo de red no se puede asegurar que la API no haya persistido el lead.

La validación cliente proporciona feedback; el backend sigue siendo la autoridad. Las provincias y formatos de teléfono se contrastaron con `leads.validation.ts` del backend. Cambios en ese contrato deben reflejarse aquí.

## Diseño y accesibilidad

La referencia principal son las capturas de Figma: morado intenso, azul oscuro, fondos lavanda, tarjetas y formulario responsive. El hero utiliza `public/Vida conectada.png`, proporcionada por el usuario, mediante `next/image`, con tamaños responsive y carga prioritaria. El logo sigue siendo una marca tipográfica provisional. No se afirman prestaciones como Wi-Fi incluido, IVA incluido o soporte 24/7 porque no forman parte del contrato disponible. Tampoco se añaden enlaces decorativos de CRM, redes o cobertura.

Las páginas y el contenido esencial de las tarjetas se renderizan en servidor. Las tarjetas se hidratan para abrir los modales; el formulario conserva su componente y lógica de envío existentes. No se añaden librerías. Tipografía del sistema para evitar peticiones y saltos de fuente. La imagen del hero se optimiza con Next y reserva su espacio para evitar saltos de diseño. El menú móvil conserva enlaces visibles sin JavaScript adicional.

Se incluyen etiquetas, foco visible, errores asociados, confirmación con foco, aviso de carga, prevención de doble envío, salto al contenido y soporte para movimiento reducido. La composición se adapta a móvil con formulario y tarjetas en una columna.

## Verificación

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Las pruebas usan el runner integrado de Node sin dependencias adicionales. Comprueban teléfonos del contrato, nombres Unicode, provincias, selección del plan y respuestas de envío (éxito, validación, rate limit, indisponibilidad y red). Los mocks solo existen en pruebas, nunca en las páginas ni en el flujo final.

Recorrido manual con Express y PostgreSQL activos:

1. Abrir inicio y catálogo; contrastar planes/precios con `GET /plans` y comprobar el HTML renderizado.
2. Comprobar título, descripción y canonical de inicio y catálogo. Abrir detalles, pasar al formulario y comprobar que la URL no cambia. Las antiguas rutas `/planes/[slug]` deben devolver 404.
3. Enviar campos inválidos: verificar errores y foco. Con datos ficticios válidos, enviar una sola solicitud y comprobar UUID real y persistencia usando las herramientas del backend.
4. Probar un error de red: conservar datos y permitir reintento, sin prometer deduplicación.
5. Revisar foco contenido en el diálogo, cierre con Escape y botón, retorno al disparador y vistas móviles de 320, 375 y 768 px, sin desplazamiento horizontal. Durante un envío se bloquea el cierre para no perder una confirmación pendiente.
6. Consultar sitemap y robots con el dominio definitivo. El sitemap contiene solo las dos páginas públicas y no depende de la disponibilidad de la API.

Las comprobaciones de código no sustituyen una prueba E2E contra PostgreSQL ni una medición de Lighthouse. Esta etapa no despliega servicios ni modifica el backend o archivos `.env` reales.

Resultados concretos de esta implementación: [verificación local](docs/frontend-verification.md).

La estructura actual prioriza el catálogo y los modales por indicación del usuario: se eliminó `/planes/[slug]` y la metadata por plan. Cada página pública mantiene título, descripción y canonical propios; los modales no crean URLs indexables independientes. El diálogo nativo aporta contención del foco e inactividad del fondo. CSS añade entrada sutil, scroll interno y soporte para movimiento reducido.

## Contacto desde el menú

«Contáctanos» abre el único modal compartido del layout sin navegación, también en móvil. Consulta los planes públicos al abrir, muestra carga/error con reintento y presenta el selector obligatorio con «Selecciona un plan», sin preselección. Las tarjetas reutilizan el mismo diálogo y formulario con el plan correspondiente preseleccionado y los planes ya obtenidos en servidor. Cerrar con Escape o el botón restaura el foco; durante un envío se conserva el bloqueo de cierre. Volver al inicio desde la confirmación cierra el modal. No se cambian el endpoint ni el contrato de captación.

Auditoría final previa al CRM: [navegación, accesibilidad, SEO y rendimiento local](docs/public-audit.md).
