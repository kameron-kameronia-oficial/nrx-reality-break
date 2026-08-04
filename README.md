# NRX : Reality Break - Wiki oficial

Sitio estatico oficial de NRX : Reality Break, preparado para GitHub Pages sin proceso de compilacion.

## Abrirla en tu PC

Abre `index.html` con doble clic. Para probarla como sitio real, abre PowerShell dentro de esta carpeta y ejecuta:

```powershell
py -m http.server 8080
```

Despues visita `http://localhost:8080`.

## Publicarla en GitHub Pages

Repositorio publico:

`https://github.com/kameron-kameronia-oficial/nrx-reality-break`

URL prevista de GitHub Pages:

`https://kameron-kameronia-oficial.github.io/nrx-reality-break/`

Configuracion recomendada en GitHub: Settings -> Pages -> Deploy from a branch -> `main` / `(root)`.

El sitio no necesita frameworks, instalacion de dependencias ni carpeta de salida. `index.html` debe permanecer en la raiz del repositorio y `.nojekyll` debe mantenerse para publicar los archivos estaticos tal como estan.

## SEO

Las etiquetas canonical, `og:url`, `og:image`, `robots.txt` y `sitemap.xml` usan la URL de GitHub Pages:

`https://kameron-kameronia-oficial.github.io/nrx-reality-break/`

Despues de activar GitHub Pages, registra la URL en Google Search Console, envia `sitemap.xml` y solicita indexacion de la portada.

## Estructura

- `index.html`: portada.
- `personajes.html`: indice oficial.
- `personajes/`: paginas individuales, incluyendo archivos especiales/scrapped.
- `canciones.html`, `mecanicas.html`, `desarrollo.html`: secciones principales.
- `assets/css/`: estilos globales y estilos de paginas especiales.
- `assets/js/`: buscador, interaccion y scripts de paginas especiales.
- `assets/img/characters/`: GIFs temporales originales.
- `assets/media/`: material multimedia adicional.

Los GIFs incluidos son senales abstractas temporales creadas para la wiki; pueden reemplazarse por arte oficial manteniendo el mismo nombre de archivo.
