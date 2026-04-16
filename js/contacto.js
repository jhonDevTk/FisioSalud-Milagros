/* ============================================================
   contacto.js — FisioSalud Milagros
   Formulario de cita → envío por WhatsApp
   ============================================================ */

/**
 * Lee los campos del formulario, construye un mensaje
 * formateado y lo abre en WhatsApp.
 */
function sendWhatsApp() {

    /* Leer campos */
    var nombre   = document.getElementById('fname')    ? document.getElementById('fname').value.trim()    : '';
    var apellido = document.getElementById('lname')    ? document.getElementById('lname').value.trim()    : '';
    var telefono = document.getElementById('fphone')   ? document.getElementById('fphone').value.trim()   : '';
    var fecha    = document.getElementById('fdate')    ? document.getElementById('fdate').value            : '';
    var servicio = document.getElementById('fservice') ? document.getElementById('fservice').value         : '';
    var motivo      = document.getElementById('fmessage') ? document.getElementById('fmessage').value.trim()  : '';
    var especialista = document.getElementById('fesp')     ? document.getElementById('fesp').value               : '';

    /* Nombre completo */
    var nombreCompleto = ((nombre + ' ' + apellido).trim()) || 'No especificado';

    /* Formatear fecha en español peruano */
    var fechaFormateada = 'A coordinar';
    if (fecha) {
        try {
            fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', {
                weekday: 'long',
                year:    'numeric',
                month:   'long',
                day:     'numeric'
            });
            /* Capitalizar primera letra */
            fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
        } catch (e) {
            fechaFormateada = fecha;
        }
    }

    /* Construir mensaje con formato WhatsApp */
    var texto = '🏥 *Solicitud de Cita — FisioSalud Milagros*\n\n'
        + '👤 *Paciente:*        ' + nombreCompleto                    + '\n'
        + '📞 *Teléfono:*        ' + (telefono || 'No especificado')   + '\n'
        + '🗓️ *Fecha preferida:* ' + fechaFormateada                   + '\n'
        + '👩‍⚕️ *Especialista:*    ' + (especialista || 'Sin preferencia')  + '\n'
        + '💆 *Servicio:*        ' + (servicio || 'No especificado')   + '\n'
        + '📋 *Motivo:*          ' + (motivo   || 'No especificado')   + '\n\n'
        + '_Enviado desde fisiosaludmilagros.pe_';

    /* Abrir WhatsApp */
    openWA(texto);
}
