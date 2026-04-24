# Vault — Series Tracker Client

Cliente web para gestionar una lista de series. Construido con HTML, CSS y JavaScript vanilla puro — sin frameworks, sin librerías externas, solo `fetch()` y el DOM.

🔗 **App en producción:** https://series-client.netlify.app  
🔗 **Repositorio del backend:** https://github.com/dallycita/series-api

---

## Screenshot

<img width="1861" height="905" alt="image" src="https://github.com/user-attachments/assets/b650c51d-083e-4884-803e-524c5cb97590" />


---

## Stack

- **HTML5** semántico
- **CSS3** con custom properties (variables)
- **JavaScript ES Modules** (import/export nativo, sin bundler)
- **fetch()** para consumir la API REST
- **Deploy:** [Netlify](https://netlify.com)

---

## Correr localmente

Este proyecto es estático — no necesita build ni dependencias. Solo se necesita un servidor HTTP local porque usa ES Modules (`type="module"`), que el navegador no permite con el protocolo `file://`.

### Opción 1: VS Code Live Server

Instalar la extensión **Live Server** y hacer click en "Go Live".

### Opción 2: Python

```bash
cd series.client
python -m http.server 3000
```

Luego abrir `http://localhost:3000`.

### Opción 3: Node

```bash
npx serve series.client
```

---

## Estructura del proyecto

```
series.client/
├── index.html          # Vista principal (catálogo de series)
├── detail.html         # Vista de detalle + ratings
├── css/
│   └── styles.css      # Estilos globales con CSS variables
└── js/
    ├── api.js          # Todas las llamadas fetch() a la API
    ├── app.js          # Lógica principal: grid, modal, filtros, paginación
    ├── detail.js       # Lógica de la vista de detalle y ratings
    └── export.js       # Exportación CSV y XLSX sin librerías
```

Cada archivo tiene una responsabilidad única. `api.js` es el único que sabe la URL del backend — el resto importa de ahí.

---

## Funcionalidades

- **Catálogo visual** en grid con portadas, badges de estado y acciones en hover
- **Búsqueda** por título en tiempo real
- **Filtros** por estado (viendo, pendiente, completada, abandonada)
- **Ordenamiento** por fecha, título y año
- **Paginación** navegable
- **Crear / editar / eliminar** series desde la interfaz
- **Subida de imagen** directamente desde el formulario (JPG, PNG, WebP · máx 1 MB)
- **Vista de detalle** con sinopsis y sistema de reseñas
- **Exportar a CSV** — generado manualmente desde JavaScript
- **Exportar a Excel (.xlsx)** — generado manualmente desde JavaScript, construyendo el ZIP del formato SpreadsheetML byte a byte, incluyendo CRC32 propio

---

## Sobre CORS

CORS (Cross-Origin Resource Sharing) es una política de seguridad del navegador que bloquea peticiones `fetch()` entre orígenes distintos (distinto dominio o puerto) a menos que el servidor las permita explícitamente. El backend está configurado con `Access-Control-Allow-Origin: *` para aceptar peticiones desde cualquier origen.

---

## Challenges implementados

- ✅ **Exportar CSV** — generado manualmente en `export.js`, con BOM UTF-8 para compatibilidad con Excel
- ✅ **Exportar Excel (.xlsx)** — formato SpreadsheetML generado desde cero: ZIP manual con CRC32 propio, sin ninguna librería
- ✅ **Sistema de rating** — cada serie tiene su página de detalle con formulario para dejar reseñas y puntajes del 0 al 10
- ✅ **Subida de imágenes** — upload directo desde el formulario al endpoint del backend, que almacena en Cloudinary

---

## Reflexión

Trabajar solo con JavaScript vanilla fue más interesante de lo que esperaba. Sin un framework que abstraiga la gestión del DOM, tienes que pensar más en cómo está organizado el estado y cuándo re-renderizar. No es necesariamente más difícil, pero sí más explícito.

El challenge más satisfactorio fue el exportador de Excel. Entender el formato SpreadsheetML, armar el ZIP manualmente con su estructura de directorios, calcular el CRC32 y que finalmente se abra en LibreOffice y Excel fue gratificante. Lo volvería a hacer, aunque en un proyecto real usaría una librería para eso sin pensarlo dos veces.

CSS con variables (`--accent`, `--surface`, etc.) resultó ser una forma muy limpia de mantener consistencia visual sin ningún preprocesador. Lo adoptaría en cualquier proyecto estático.
