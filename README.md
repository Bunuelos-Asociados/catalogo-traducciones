# Buñuelos & Asociados

Catálogo estático de novelas visuales traducidas. No requiere compilación: sirve los archivos con cualquier servidor web estático y publícalos en GitHub Pages.

## Administrar el contenido

- Añade o edita proyectos públicos en `data/translations.json`.
- Añade o edita proyectos del segundo catálogo en `data/translations-private.json`.
- Añade tutoriales en `data/tutorials.json`. El campo `content` acepta HTML sencillo (`<p>`, `<strong>`, listas, etc.).
- Cambia WhatsApp, Discord o agrega redes en `data/site.json`.
- Modifica los colores principales al comienzo de `src/styles.css`, dentro de `:root`.

Cada proyecto admite `name`, `author`, `status`, `image`, `description`, `translationNotes` y `links`. Dentro de `links`, deja `null`, una cadena vacía o elimina `official`, `pc` o `android` para ocultar ese botón.

## Segundo catálogo

`segunda-version/index.html` reutiliza los mismos estilos y JavaScript, pero carga `data/translations-private.json`. No se enlaza desde la portada.

> GitHub Pages es estático: una ruta no enlazada no es un control de acceso. Si el contenido debe ser realmente privado, usa autenticación y un backend o alojamiento con control de acceso.

## GitHub Pages

Las rutas son relativas, por lo que el sitio funciona tanto en un dominio como en un subdirectorio de GitHub Pages. Prueba localmente con:

```sh
python -m http.server 4173
```

Luego abre `http://localhost:4173`.
