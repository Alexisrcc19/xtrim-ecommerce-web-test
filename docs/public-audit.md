# Auditoría final del frontend público

20 de octubre de 2026. Alcance: inicio, catálogo, modales, captación, responsive, accesibilidad, SEO y rendimiento local. Sin CRM, cambios de backend, dependencias nuevas, modificaciones de `.env` ni commits.

## Problemas encontrados y corregidos

- Los metadatos eran genéricos. El inicio ahora utiliza exactamente el título y descripción solicitados. El catálogo dispone de título y descripción específicos; conserva su canonical `/planes`.
- El catálogo y el formulario modal compartían `id="solicitud"`. Se retiró el ID innecesario del formulario y de la confirmación. La prueba sobre el DOM con el modal abierto no encontró IDs duplicados.
- Los campos móviles utilizaban 13 px. Se ajustaron a 16 px para mejorar legibilidad y evitar el autozoom habitual de Safari en iOS. No se ejecutó un dispositivo iOS real.
- El botón deshabilitado por ausencia de planes no tenía una apariencia diferenciada. Se añadió el estado visual de botón deshabilitado.
- Se añadió una prueba de coherencia entre robots y sitemap para un dominio configurado distinto de localhost.

## Resultado de verificación

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `git diff --check`: correctos.

Chrome headless sobre el build de producción, consumiendo el catálogo real de Express:

- Navegación de menú inicio → catálogo, y enlaces públicos limitados a rutas existentes.
- Un título, descripción y canonical por página; H1 único y coherencia de dominio entre canonical, sitemap y robots.
- Sitemap con únicamente `/` y `/planes`; robots excluye administración y API.
- Ruta antigua de plan y página inexistente: HTTP 404 y `noindex`.
- Tarjetas visibles en ambas páginas con JavaScript deshabilitado.
- «Contáctanos» en ambas páginas y móvil: formulario sin plan preseleccionado, plan obligatorio, URL sin cambios.
- Tarjetas: detalles → formulario, con plan correcto preseleccionado.
- Diálogo único, Tab y Shift+Tab contenidos, Escape, retorno del foco, scroll del fondo restaurado y movimiento reducido.
- Durante el POST, cierre bloqueado y una sola solicitud. Error de envío conserva los datos. Confirmación y retorno al inicio funcionan.
- Carga de planes con error y reintento funcional.
- Sin desbordamiento horizontal a 320, 375, 768 y 1440 px; controles móviles con fuente de 16 px.
- Banner cargado mediante `next/image`, sin imágenes sin texto alternativo ni errores JavaScript capturados.

Los POST se interceptaron **solo en el navegador de prueba** para comprobar carga, error y éxito sin crear leads reales. No se presenta esta revisión como una nueva prueba de persistencia en PostgreSQL. La integración con Express permanece intacta.

## Rendimiento observado

Una ejecución local, sin limitación de red ni CPU, con API real. No es Lighthouse, una comparativa antes/después ni una evaluación de tráfico real.

| Ruta | TTFB | FCP | LCP | CLS | JS codificado observado | Imagen codificada observada |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 1573 ms | 1840 ms | 1844 ms | 0 | 149311 bytes | 27566 bytes |
| `/planes` | 258 ms | 328 ms | 328 ms | 0 | 143854 bytes | 0 bytes |

Los tamaños son `encodedBodySize` de Resource Timing, no el tamaño instalado ni necesariamente los bytes transferidos desde red en cada carga. El banner se sirvió optimizado con tamaño reservado y carga prioritaria; no se añadieron fuentes externas ni bibliotecas.

Mediciones y comprobaciones estructuradas: [public-audit-results.json](public-audit-results.json).

## Pendientes y límites

1. Repetir Lighthouse móvil y mediciones con red/CPU limitadas desde el despliegue público; añadir Web Vitals de usuarios reales para evaluar también INP. No se atribuye una puntuación no medida.
2. El TTFB inicial local de 1,57 s merece seguimiento. Separar tiempos del servidor Next, red y API con trazas antes de introducir caché o atribuir una causa; esta auditoría no diagnosticó su origen.
3. Configurar `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_API_URL` con los dominios reales al desplegar y volver a verificar canonical, sitemap, robots, CORS y captación persistente. Las URLs localhost comprobadas corresponden al entorno local.
4. Prueba manual con lector de pantalla y dispositivo iOS real: no ejecutadas. La revisión de accesibilidad realizada cubre estructura DOM, etiquetas, teclado, foco, estados y responsive; no es una certificación completa WCAG.
