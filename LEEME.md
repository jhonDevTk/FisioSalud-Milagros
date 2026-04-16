# FisioSalud Milagros — Sitio Web
## Guía de uso y personalización

---

## 📁 Estructura del proyecto

```
fisiosaludmilagros/
│
├── index.html          ← Página de Inicio
├── nosotros.html       ← Página Nosotros
├── evidencias.html     ← Página Evidencias
├── contacto.html       ← Página Contacto
│
├── css/
│   ├── variables.css   ← Colores, fuentes y estilos globales
│   ├── nav.css         ← Navegación + WhatsApp flotante
│   ├── index.css       ← Estilos exclusivos del Inicio
│   ├── nosotros.css    ← Estilos exclusivos de Nosotros
│   ├── evidencias.css  ← Estilos exclusivos de Evidencias
│   └── contacto.css    ← Estilos exclusivos de Contacto
│
└── js/
    ├── nav.js          ← Menú hamburguesa + WhatsApp flotante
    ├── index.js        ← Carrusel de especialistas
    ├── evidencias.js   ← Panel de videos y comentarios
    └── contacto.js     ← Formulario de cita por WhatsApp
```

---

## 🚀 Cómo usar

1. Descomprime el ZIP en una carpeta de tu PC
2. Abre `index.html` con tu navegador (doble clic)
3. Navega entre las páginas normalmente

---

## 📸 Cómo agregar fotos de los especialistas

Las fotos aparecen en 3 páginas: index, nosotros y evidencias.

### Paso 1 — Prepara las fotos
- Formato recomendado: JPG o WebP
- Tamaño: mínimo 400x600 px (medio cuerpo vertical)
- Nombre sugerido: `foto-maria.jpg`, `foto-carlos.jpg`, etc.
- Guarda las fotos dentro de la carpeta del proyecto

### Paso 2 — Reemplaza en index.html (carrusel)

Busca el bloque de cada especialista y reemplaza el placeholder:

```html
<!-- ANTES (placeholder) -->
<div class="foto-placeholder">
    <span class="foto-initials">ML</span>
    <span class="foto-label">Foto<br>medio cuerpo</span>
</div>

<!-- DESPUÉS (con foto real) -->
<img src="foto-maria.jpg" alt="Mg. María López">
```

### Paso 3 — Reemplaza en nosotros.html

Mismo proceso, busca cada `.foto-ph` y reemplaza con `<img>`.

### Paso 4 — Reemplaza en evidencias.html

Los círculos de avatar usan iniciales. Para agregar foto:

```html
<!-- ANTES -->
<div class="ev-circle-main">
    <span class="ev-init-main">ML</span>
</div>

<!-- DESPUÉS -->
<div class="ev-circle-main">
    <img src="foto-maria.jpg" alt="María López">
</div>
```

---

## 🎬 Cómo agregar videos de YouTube

Abre `js/evidencias.js` y busca `var videosData = {`.

Para cada especialista verás un array con sus videos. Para agregar uno nuevo:

```javascript
// Ejemplo: agregar video al especialista 'cr' (Carlos Ríos)
cr: [
    // Videos existentes...
    {
        id: 99,                        // número único
        cat: 'Deportivo',              // categoría
        title: 'Título del caso',      // título visible
        desc: 'Descripción breve.',    // descripción
        bg: 'vt1',                     // fondo (vt1 a vt6)
        comments: 0                    // comentarios iniciales
    }
]
```

**Nota:** Cuando esté listo el panel admin con Google Sheets, no necesitarás editar este archivo. Los videos se agregarán desde el panel sin tocar código.

---

## 📱 WhatsApp

El número está configurado en `js/nav.js`:

```javascript
var WA_NUMBER = '51921720767';
```

Si cambia el número, solo modifica ese valor.

---

## 🎨 Colores

Todos los colores están en `css/variables.css`:

```css
:root {
    --accent:  #00e5c3;   /* Verde turquesa (principal) */
    --accent2: #7b6cff;   /* Violeta */
    --text:    #f0f0f5;   /* Texto blanco */
    --muted:   #8888aa;   /* Texto gris */
    --bg:      #0a0a0f;   /* Fondo negro */
    --bg3:     #1a1a24;   /* Fondo tarjetas */
}
```

---

## ✅ Checklist antes de publicar

- [ ] Fotos de los 5 especialistas agregadas
- [ ] Dirección real de la clínica en contacto.html
- [ ] Email real en contacto.html
- [ ] Horario real en contacto.html
- [ ] Videos de YouTube agregados en evidencias.js
- [ ] Nombre y datos de cada especialista actualizados

---

## 📞 Soporte

Número WhatsApp: +51 921 720 767
