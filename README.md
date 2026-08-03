# NRX : Reality Break — Wiki oficial

Primera versión estática, interactiva y preparada para buscadores.

## Abrirla en tu PC

Abre `index.html` con doble clic. Para probarla como sitio real, abre PowerShell dentro de esta carpeta y ejecuta:

```powershell
py -m http.server 8080
```

Después visita `http://localhost:8080`.

## Publicarla

La cuenta de GitHub conectada no tenía repositorios al crear este paquete. Crea un repositorio público llamado `nrx-reality-break` y sube todo el contenido de esta carpeta. Para GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.

Cloudflare Pages también puede conectarse al mismo repositorio. No requiere proceso de compilación; el directorio de salida es la raíz del proyecto.

## Antes de enviar a Google

1. Reemplaza `https://nrxrealitybreak.pages.dev/` en `sitemap.xml`, `robots.txt` y las etiquetas canonical por la URL final.
2. Sube arte y música aprobados a `assets/img/` y `assets/audio/`.
3. Registra la URL en Google Search Console.
4. Envía `sitemap.xml` y solicita indexación de la portada.

## Estructura

- `index.html`: portada.
- `personajes.html`: índice oficial.
- `personajes/`: páginas individuales.
- `canciones.html`, `mecanicas.html`, `desarrollo.html`: secciones principales.
- `assets/css/styles.css`: diseño.
- `assets/js/app.js`: buscador e interacción.
- `assets/img/characters/`: GIFs temporales originales.

Los GIFs incluidos son señales abstractas temporales creadas para la wiki; pueden reemplazarse por arte oficial manteniendo el mismo nombre de archivo.
