# XTRIM — Ecommerce y CRM

Frontend de una demostración técnica con Next.js 16, TypeScript y Tailwind CSS. Consume la API Express de `xtrim-ecommerce-api`. Los planes y precios son demostrativos; no es el sitio oficial de XTRIM.

## Instalación

Requisitos: Node.js 24, pnpm y la API Express en ejecución.

```bash
pnpm install
```

Copia `.env.example` a `.env.local` si aún no existe y configura las variables:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API accesible desde el navegador, por defecto `http://localhost:4000/api/v1`. |
| `NEXT_PUBLIC_SITE_URL` | URL del frontend, por defecto `http://localhost:3000`. |
| `API_URL` | API accesible desde el servidor de Next.js. |
| `ADMIN_API_TOKEN` | Mismo token privado configurado en Express. |
| `ADMIN_USERNAME` | Usuario administrador. |
| `ADMIN_PASSWORD_HASH` | Hash scrypt de la contraseña administrativa. |
| `ADMIN_SESSION_SECRET` | Secreto independiente; generar con `openssl rand -hex 32`. |

Para generar el hash de una contraseña de al menos 12 caracteres, en Bash:

```bash
read -rsp 'Contraseña: ' xtrim_password
printf '\n'
printf '%s' "$xtrim_password" | node scripts/hash-admin-password.mjs
unset xtrim_password
```

Copia el hash resultante a `ADMIN_PASSWORD_HASH`. Las credenciales solo se utilizan en servidor; no deben llevar el prefijo `NEXT_PUBLIC_` ni subirse a Git. PostgreSQL se configura únicamente en el backend.

```bash
pnpm dev
```

Abre [localhost:3000](http://localhost:3000). Express debe permitir este origen en `FRONTEND_URL`. Reinicia Next.js después de modificar las variables.

## Rutas

- `/`: inicio.
- `/planes`: catálogo, detalle y formulario mediante modales.
- `/planes/[slug]`: detalle del plan renderizado en servidor, con URL canónica, metadata propia y acceso al formulario existente.
- `/admin/login`: acceso administrativo.
- `/admin`: dashboard.
- `/admin/leads`: gestión de leads.
- `/admin/pipeline`: Kanban.

Las páginas públicas se renderizan en servidor y tienen metadata, canonical, sitemap y robots. El CRM queda excluido de indexación.

El catálogo conserva la vista rápida y añade un enlace a cada página individual. El sitemap consulta los planes activos de Express; un fallo de la API se trata como error, sin publicar un catálogo incompleto. Para Vercel, configura `NEXT_PUBLIC_SITE_URL` con el dominio público definitivo y `NEXT_PUBLIC_API_URL` con la API de Render antes del build. No se necesitan variables nuevas.

## Comandos

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

## Decisiones técnicas

- Express gestiona datos y reglas de negocio; Next.js gestiona la interfaz y la sesión administrativa firmada, de ocho horas. Producción requiere HTTPS. Rotar las credenciales invalida las sesiones; el límite de intentos de acceso es local al proceso.
- Las ventas en USD suman los montos mensuales históricos de leads cerrados y ganados (`CLOSED` + `WON`); no representan pagos cobrados. Eliminar un lead es permanente y requiere confirmación.
- Un teléfono solo puede tener una solicitud en Nuevo o En gestión. Tras cerrarla se permite otra; Express y PostgreSQL garantizan la restricción y el frontend muestra el conflicto.
- El CRM recibe avisos SSE sin polling y actualiza la vista al recibir cambios. Requiere ambos servicios actualizados, streaming sin buffering y una instancia Express. Varias réplicas requerirían compartir notificaciones.
- Al desplegar, configura las URLs públicas antes del build y comprueba que el hosting permita conexiones SSE persistentes.


## Flujo comercial

Las oportunidades avanzan de Nuevo a En gestión y después a Cerrado. La tabla y el Kanban ofrecen «Iniciar gestión» y «Cerrar oportunidad» según el estado actual. El modal de cierre exige Ganado o Perdido y, para ventas ganadas, un monto mensual en USD. El resultado de una oportunidad cerrada es de solo lectura.

La API devuelve HTTP 409 cuando una transición es inválida o el estado cambió desde otra vista. El CRM muestra el conflicto y consulta nuevamente la oportunidad para presentar sus datos actuales.
