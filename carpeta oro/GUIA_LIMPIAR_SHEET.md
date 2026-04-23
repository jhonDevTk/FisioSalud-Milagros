# 🛠️ Cómo limpiar y ordenar el Google Sheet

## El problema
Tu hoja "Pacientes" tiene columnas desordenadas porque se fueron
agregando sueltas (foto, registradoPor, foto1, foto2, foto3…).

## Solución rápida — reorganizar columnas manualmente

### Paso 1: Elimina las columnas que no sirven
En tu Sheet, elimina estas columnas si las ves:
- `foto` (la antigua, ya se reemplaza por `foto1`..`foto5`)
- `registradoPor` duplicada
- Cualquier columna en blanco

### Paso 2: El orden correcto de cabeceras
La fila 1 de tu hoja **Pacientes** debe quedar exactamente así
(en este orden, cada una en su propia columna):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | codigo | nombre | edad | genero | telefono | fecha | diagnostico | tratamiento | estado | registradoPor | foto1 | foto2 | foto3 | foto4 | foto5 |

### Paso 3: Reacomodar (si ya tienes datos)
1. Haz clic derecho en una columna → "Mover columna" para reordenarlas
2. O más fácil: selecciona toda la fila 1 y escribe los nombres
   en el orden correcto (teniendo cuidado de no borrar los datos)

### Paso 4: ¿Qué pasa con los registros viejos que tienen código PX001 etc.?
Los pacientes con código antiguo (PX001, PX002…) **seguirán
funcionando** para consultar en pacientes.html si ingresan ese
código exacto. Los nuevos registros tendrán código numérico.

Si quieres que los pacientes viejos también funcionen con el
nuevo sistema, simplemente edita el código en el Sheet y
comunícales el nuevo código.

## Limpieza completa (opción nuclear)
Si prefieres empezar desde cero:
1. Elimina todas las filas de datos (fila 2 en adelante)
2. Elimina todas las columnas
3. El Apps Script creará las columnas correctas automáticamente
   la próxima vez que agregues un paciente

## ¿Por qué las fotos salen como "data:image/png;..."?
Las fotos se guardan en formato base64 directamente en el Sheet.
Esto es normal — ocupa espacio en el Sheet pero funciona.
Las fotos sí se muestran correctamente en la web aunque en el
Sheet aparezcan como texto largo.

Si quieres el Sheet más limpio, puedes borrar manualmente el
contenido de las celdas foto1..foto5 — no afecta la web porque
las fotos también se guardan en el localStorage del navegador.
