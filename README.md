# D365FO Workshop Tool v2 — Guía de deploy

Herramienta para equipos de consultores D365FO. Soporta dos backends configurables mediante una variable de entorno.

---

## Elegir backend

Copiar `.env.example` a `.env` y cambiar la primera línea:

```
REACT_APP_BACKEND=supabase   # gratis, sin suscripción Azure
REACT_APP_BACKEND=azure      # para equipos con suscripción corporativa
```

---

## Opción A — Supabase + Vercel (recomendado, gratis)

### Paso 1 — Crear base de datos en Supabase

1. Ir a [app.supabase.com](https://app.supabase.com) → **New project**
2. Completar nombre (ej: `d365-workshops`), contraseña, y elegir la región más cercana
3. Esperar ~2 minutos hasta que el proyecto termine de crearse
4. En el menú lateral izquierdo, ir a **SQL Editor** → **New query**
5. Pegar el contenido completo del archivo `supabase-schema.sql` → clic en **Run**

### Paso 2 — Obtener las credenciales del proyecto

1. En el dashboard del proyecto, buscar el botón **Connect** en la parte superior (cerca del nombre del proyecto) y hacer clic
2. En el diálogo que se abre, copiar:
   - **Project URL** → es el valor de `REACT_APP_SUPABASE_URL`
   - **Publishable key** (o **anon public** si aparece la pestaña Legacy) → es el valor de `REACT_APP_SUPABASE_ANON_KEY`
3. Si no encontrás el botón Connect, ir a **Settings** (engranaje en el menú lateral) → **API Keys** → ahí están los mismos valores

### Paso 3 — Configurar SMTP para envío de emails

> **Por qué es necesario:** Supabase incluye un servidor de email gratuito, pero por seguridad solo envía a las direcciones que son miembros del proyecto en Supabase. Para que todos los consultores del equipo puedan recibir el magic link, hay que conectar un servicio de email externo.

La opción más simple y gratuita es **Resend** (hasta 3.000 emails/mes gratis):

1. Crear cuenta en [resend.com](https://resend.com) → ir a **API Keys** → **Create API Key** → copiar el valor
2. En Supabase, ir a **Authentication** → **Emails** → **SMTP Settings**
3. Activar **Enable Custom SMTP** y completar:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** (el API Key de Resend)
   - **Sender email:** `noreply@resend.dev` (o tu dominio si tenés uno verificado)
4. Guardar

### Paso 4 — Subir el código a GitHub

1. Crear un repositorio nuevo en [github.com](https://github.com) (puede ser privado)
2. Desde la carpeta del proyecto en tu computadora, ejecutar:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Paso 5 — Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com) → crear cuenta si no tenés → **Add New Project**
2. Conectar con GitHub y seleccionar el repositorio del paso anterior
3. Antes de hacer clic en Deploy, ir a **Environment Variables** y agregar las tres variables:

| Variable | Valor |
|---|---|
| `REACT_APP_BACKEND` | `supabase` |
| `REACT_APP_SUPABASE_URL` | (el Project URL del Paso 2) |
| `REACT_APP_SUPABASE_ANON_KEY` | (la key del Paso 2) |

4. Clic en **Deploy** — Vercel detecta automáticamente que es una React app y la construye
5. Esperar ~2 minutos y copiar la URL generada (ej: `https://d365-workshops.vercel.app`)

### Paso 6 — Conectar Supabase con la URL de Vercel

1. Volver a Supabase → en el menú lateral clic en **Authentication**
2. En la parte superior aparecen pestañas — buscar y hacer clic en **URL Configuration**
3. En el campo **Site URL** pegar la URL de Vercel (ej: `https://d365-workshops.vercel.app`)
4. Más abajo, en **Redirect URLs**, hacer clic en **Add URL** y agregar la misma URL seguida de `/**` (ej: `https://d365-workshops.vercel.app/**`)
5. Clic en **Save

La app ya está lista para usar.

### Costo

| Servicio | Plan | Costo |
|---|---|---|
| Supabase | Free | $0/mes — 50.000 usuarios, 500MB de base de datos |
| Vercel | Free | $0/mes — deploys ilimitados, dominio incluido |
| Resend | Free | $0/mes — 3.000 emails/mes, más que suficiente |
| **Total** | | **$0/mes** |

---

## Opción B — Azure Static Web Apps + Cosmos DB

Requiere suscripción Azure activa y configuración de Entra ID. Ver documentación oficial de Azure Static Web Apps para el proceso completo.

Para activar este backend en el código:

```
REACT_APP_BACKEND=azure
REACT_APP_AZURE_API_BASE=https://tu-app.azurestaticapps.net/api
```

---

## Primeros usuarios

Cuando un consultor entra por primera vez a la app:

1. Va a la URL de Vercel
2. Ingresa su email corporativo
3. Recibe un email con un link de acceso (magic link)
4. Hace clic en ese link y queda logueado automáticamente

No hay que crear usuarios manualmente ni asignar permisos. Si querés restringir el acceso a un dominio específico (ej: solo `@tuempresa.com`), se puede configurar en Supabase → **Authentication** → **Providers** → **Email** → **Restrict signups**.

---

## Agregar o editar escenarios del BPC

Todos los escenarios están en un único archivo: `src/data/scenarios.js`. Para agregar un escenario nuevo, seguir esta estructura:

```js
{
  id: "90.XX.XXX.XXX",            // ID del BPC MAR 2026
  t: "Nombre corto del escenario",
  biz: "¿Pregunta de negocio para el cliente?",
  forms: ["Formulario D365 (NombreTécnico)"],
  menu: "Módulo > Submenú > Formulario",
  key: "Qué puntos clave mostrar en el workshop",
  fit: "fit",                     // "fit" | "cfg" | "gap"
  tip: "Consejo para el consultor junior"
}
```

Guardás el archivo → hacés push a `main` → Vercel re-deploya automáticamente en ~2 minutos.

---

## Cambiar de Supabase a Azure

Los datos no se migran automáticamente. Lo más práctico para equipos que empiezan con Supabase y consiguen suscripción Azure después:

1. Exportar datos desde Supabase: **Table Editor** → cada tabla → **Export as CSV**
2. Configurar el backend Azure según la documentación oficial
3. Cambiar `REACT_APP_BACKEND=azure` en las variables de entorno de Vercel
4. Hacer un push vacío para forzar el re-deploy: `git commit --allow-empty -m "switch to azure" && git push`

En la práctica los datos de workshops son históricos y muchos equipos simplemente arrancan de cero en Azure sin migrar.
