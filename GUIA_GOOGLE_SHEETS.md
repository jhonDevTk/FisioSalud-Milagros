# 📋 GUÍA — Conectar Google Sheets con FisioSalud Milagros
## Instrucciones paso a paso (15 minutos, solo una vez)

---

## ¿Qué necesitas?
- Una cuenta de Google (Gmail)
- Tu proyecto descargado en tu PC
- Este documento abierto mientras sigues los pasos

---

## PASO 1 — Crear el Google Sheets

1. Ve a **https://sheets.google.com**
2. Haz clic en **"+ En blanco"** para crear una hoja nueva
3. Ponle el nombre: **FisioSalud Milagros**

---

## PASO 2 — Crear las 5 hojas (pestañas)

En la parte inferior verás una pestaña que dice "Hoja 1".
Debes crear **5 hojas** con estos nombres exactos:

| Pestaña | Nombre exacto |
|---------|--------------|
| 1       | **Equipo**   |
| 2       | **Videos**   |
| 3       | **Servicios** |
| 4       | **Comentarios** |
| 5       | **Contacto** |

**¿Cómo crear una pestaña?**
→ Clic derecho en "Hoja 1" → "Cambiar nombre" → escribe **Equipo**
→ Clic en el **+** (esquina inferior izquierda) para agregar más hojas

---

## PASO 3 — Agregar encabezados a cada hoja

### Hoja: Equipo
En la fila 1, escribe estos encabezados (una celda por columna):
```
id | nombre | cargo | especialidad | anios | frase | principal | videos
```

### Hoja: Videos
```
id | url | titulo | especialista | categoria | descripcion | estado | fecha
```

### Hoja: Servicios
```
id | nombre | icono | descripcion
```

### Hoja: Comentarios
```
id | nombre | estrellas | texto | video | estado | fecha
```

### Hoja: Contacto
```
campo | valor
```

**En la hoja Contacto**, agrega estos datos iniciales en las filas 2-5:

| campo     | valor                                           |
|-----------|-------------------------------------------------|
| Dirección | Av. Javier Prado Este 1234, San Isidro, Lima    |
| Teléfono  | +51 921 720 767                                 |
| Email     | info@fisiosaludmilagros.pe                      |
| Horario   | Lun – Vie: 8:00 – 19:00 · Sáb: 8:00 – 13:00   |

---

## PASO 4 — Obtener el ID de tu hoja

1. Mira la URL de tu Google Sheets. Se verá así:
   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXX/edit#gid=0
   ```
2. Copia solo la parte **XXXXXXXXXXXXXXXX** (entre `/d/` y `/edit`)
3. Ese es tu **ID de Sheets**

---

## PASO 5 — Pegar el ID en el proyecto

1. Abre la carpeta de tu proyecto en tu PC
2. Ve a la carpeta **js/**
3. Abre el archivo **config.js** con el Bloc de notas
4. Busca esta línea:
   ```javascript
   var SHEETS_ID = 'TU_ID_AQUI';
   ```
5. Reemplaza **TU_ID_AQUI** con tu ID real:
   ```javascript
   var SHEETS_ID = 'XXXXXXXXXXXXXXXX';
   ```
6. Guarda el archivo

---

## PASO 6 — Publicar la hoja como API (muy importante)

Para que tu página web pueda leer los datos:

1. En tu Google Sheets, ve al menú **Archivo**
2. Haz clic en **"Compartir y exportar"**
3. Haz clic en **"Publicar en la web"**
4. En el primer menú, selecciona **"Todo el documento"**
5. En el segundo menú, selecciona **"Valores separados por comas (.csv)"**
6. Haz clic en **"Publicar"**
7. Confirma con "Aceptar"

⚠️ **Importante:** Esto NO hace que tu hoja sea visible públicamente como archivo. Solo permite que tu página la lea como datos. Los datos sensibles no deben estar en el Sheets.

---

## PASO 7 — Cambiar las contraseñas (opcional pero recomendado)

En el archivo **js/config.js**, cambia estas líneas:

```javascript
var ADMIN_PASSWORD        = 'admin2025';     // ← Cambia esto
var ESPECIALISTA_PASSWORD = 'fisio2025';     // ← Cambia esto
```

Usa contraseñas que solo tú y tus especialistas conozcan.

---

## PASO 8 — Verificar que funciona

1. Abre **admin.html** en tu navegador
2. Ingresa con tu contraseña
3. Si el aviso amarillo **desaparece**, significa que el Sheets está conectado correctamente ✅
4. Si el aviso amarillo **sigue visible**, revisa que copiaste bien el ID en el paso 5

---

## PASO 9 — Agregar los datos iniciales desde el panel

Una vez conectado, desde **admin.html** puedes:

1. **Tab Equipo** → Agregar los 5 especialistas con sus datos reales
2. **Tab Servicios** → Los servicios ya tienen datos por defecto, puedes editarlos
3. **Tab Contacto** → Verificar que la dirección y horario sean correctos
4. **Tab Videos** → Agregar los primeros videos de YouTube

---

## ¿Cómo usan el sistema los especialistas?

1. Cada especialista abre **especialista.html** en su celular o PC
2. Ingresa con la contraseña compartida
3. Selecciona su perfil
4. Pega el link de YouTube de su video
5. Completa título y descripción
6. Presiona "Enviar para aprobación"
7. Tú recibes una notificación por WhatsApp
8. Entras al panel admin → Tab Videos → Apruebas el video
9. Aparece automáticamente en la página de evidencias

---

## ❓ Preguntas frecuentes

**¿Puedo usar el panel desde mi celular?**
Sí. Abre admin.html en el navegador de tu celular, funciona igual.

**¿Qué pasa si pierdo mi contraseña?**
Abre js/config.js con el Bloc de notas y cámbiala directamente.

**¿Los datos del Sheets son privados?**
Los datos son legibles por cualquiera que conozca el ID de tu hoja.
No guardes información sensible de pacientes (solo nombres de especialistas, servicios y videos).

**¿Puedo tener múltiples administradores?**
Por ahora hay una sola contraseña de admin. Si necesitas múltiples admins, es parte de una mejora futura.

**¿Qué pasa si borro accidentalmente un dato en Sheets?**
Google Sheets guarda el historial de cambios. Ve a Archivo → Historial de versiones → Ver historial para restaurar.

---

## 📞 ¿Necesitas ayuda?

Si tienes algún problema siguiendo estos pasos, vuelve a la conversación
con Claude y describe qué paso te está causando dificultad.
Se puede acompañar el proceso paso a paso.

---

*FisioSalud Milagros — Guía técnica v1.0*
