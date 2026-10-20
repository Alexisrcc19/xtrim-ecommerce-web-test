# Verificación del ecommerce con modales

Verificación local realizada el 20 de octubre de 2026 sobre el build de producción y la API Express existente. Esta estructura sustituye el detalle por slug por un catálogo con modales, según la última instrucción del usuario.

## Estructura actual

Las páginas públicas son `/` y `/planes`, con título, descripción y canonical por página. `sitemap.xml` incluye únicamente esas dos URLs y ya no depende de la API. `robots.txt` conserva las exclusiones administrativas. La ruta `/planes/[slug]` fue eliminada y devuelve 404.

El catálogo obtiene los planes mediante `GET /api/v1/plans`. Nombre, descripción completa, velocidad y precio se renderizan en el HTML del servidor. La hidratación activa los botones de los modales. Las tarjetas reutilizan sus datos; el contacto general del menú consulta los planes al abrirse. No se sustituye el catálogo por datos hardcodeados.

Se utiliza un único diálogo nativo compartido en el layout público. El formulario es el mismo `LeadForm`, con sus validaciones y llamada a `POST /api/v1/leads`. Durante el envío se bloquea el cierre para conservar la confirmación pendiente.

## Comprobaciones ejecutadas

- `pnpm lint`: correcto.
- `pnpm typecheck`: correcto.
- `pnpm test`: correctos los tres archivos de validación, envío y sitemap.
- `pnpm build`: correcto; solo inicio, catálogo, robots, sitemap y la página de error 404.
- `git diff --check`: correcto.

Se retiraron los tipos generados antiguos de `.next/dev/types` que apuntaban a la ruta eliminada. Son artefactos locales ignorados por Git. No se cambió la configuración de TypeScript para ocultar el error.

## Navegador

Chrome headless mediante una instalación de Playwright disponible en el entorno; no se añadieron dependencias al proyecto.

- Tres tarjetas de planes reales visibles en `/planes` con JavaScript deshabilitado.
- Detalle modal con nombre y datos del plan seleccionado.
- Paso detalle → formulario sin cambio de URL.
- Apertura directa del formulario desde otra tarjeta con el plan correspondiente preseleccionado.
- Navegación Tab contenida dentro del diálogo, cierre con Escape y botón, y retorno del foco al botón original.
- Validación de formulario vacío con tres errores.
- Cierre bloqueado mientras el POST está pendiente.
- Error HTTP 503 simulado en el navegador de prueba: conserva nombre y teléfono.
- HTTP 201 simulado en el navegador de prueba: confirmación visible y payload con el `plan_id` seleccionado.
- Diálogo dentro del viewport y sin desbordamiento horizontal a 320, 375 y 768 px.
- Movimiento reducido desactiva la animación.
- El scroll del fondo se restaura al cerrar.
- Canonical del catálogo correcto; sitemap con exactamente dos URLs.
- Una antigua URL de plan devuelve HTTP 404.
- Sin errores JavaScript capturados durante la prueba final.

La prueba de los estados de envío interceptó únicamente el POST en el navegador de prueba. **No creó leads reales** y no vuelve a acreditar persistencia en PostgreSQL. La función de envío a Express y las reglas del formulario se conservan; la integración persistente se había comprobado en la etapa anterior.

## Límites

No se modificó el backend, esquema ni `.env`; no se hicieron commits ni se instalaron paquetes. La API necesitó un segundo intento de arranque para conectarse; no se diagnosticó ni corrigió el backend. El entorno requirió permisos para puertos locales y una invocación de Node sin snapshot para la revisión final tras un fallo nativo de V8 previo al arranque de la aplicación.

No se midieron Lighthouse ni Web Vitals reales ni se verificó un despliegue público. El hero utiliza la imagen suministrada `public/Vida conectada.png` con `next/image`; el logo sigue siendo tipográfico.

## Contacto general y banner

Verificados en el build de producción de esta actualización:

- «Contáctanos» desde `/` y `/planes`, a 1440 y 375 px: un solo diálogo, sin navegación ni cambio de URL.
- Selector de plan vacío incluso después de abrir y cerrar una solicitud de tarjeta.
- Nombre, teléfono y provincia válidos sin plan: error asociado al selector, foco en `plan_id` y ningún POST.
- Tarjeta: plan correspondiente preseleccionado.
- Tab y Shift+Tab contenidos, Escape y retorno del foco al disparador.
- Fallo de carga de planes interceptado: error y botón de reintento; al retirar la intercepción se cargaron los planes reales.
- POST 503 interceptado: datos conservados. POST 201 interceptado: confirmación y cierre del modal al volver al inicio.
- Banner cargado correctamente en el navegador, con dimensiones reservadas y tamaños responsive.
- Ningún error JavaScript capturado en esta prueba; ningún lead real creado.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`: correctos. Se añadió una prueba explícita de obligatoriedad del plan para contacto general.

La comprobación de navegador se ejecutó con Chrome/Playwright ya disponibles en el entorno. Las respuestas simuladas existieron solo en el navegador de prueba; la aplicación sigue consumiendo Express.
