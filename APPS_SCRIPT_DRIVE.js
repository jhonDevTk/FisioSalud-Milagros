/* ============================================================
   Apps Script — FisioSalud Milagros
   Versión con Google Drive para fotos
   ============================================================ */

/* Nombre de la carpeta en tu Google Drive donde se guardarán las fotos */
var NOMBRE_CARPETA_DRIVE = 'FisioSalud - Fotos Pacientes';

/* Columnas exactas de la hoja Pacientes */
var COLUMNAS_PACIENTES = [
    'id', 'codigo', 'nombre', 'edad', 'genero', 'telefono',
    'fecha', 'diagnostico', 'tratamiento', 'estado',
    'registradoPor', 'foto1', 'foto2', 'foto3', 'foto4', 'foto5'
];

/* ============================================================
   GET — para operaciones sin fotos (equipos, videos, etc.)
   ============================================================ */
function doGet(e) {
    try {
        var action = e.parameter.action;
        var sheet  = e.parameter.sheet;
        var data   = e.parameter.data;
        var id     = e.parameter.id;

        if (!action || !sheet) {
            return respond({ ok: false, error: 'Faltan parametros' });
        }

        var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(cap(sheet));
        if (!hoja) {
            return respond({ ok: false, error: 'Hoja no encontrada: ' + cap(sheet) });
        }

        var row = {};
        if (data) {
            try { row = JSON.parse(decodeURIComponent(data)); } catch(e2) {}
        }

        if      (action === 'add')     add(hoja, row, sheet);
        else if (action === 'delete')  del(hoja, id);
        else if (action === 'update')  upd(hoja, id, row, sheet);
        else if (action === 'replace') rep(hoja, row.rows || [], sheet);

        return respond({ ok: true, action: action });

    } catch(err) {
        return respond({ ok: false, error: err.toString() });
    }
}

/* ============================================================
   POST — para operaciones con fotos (pacientes)
   Recibe JSON con campos foto1..foto5 en base64,
   los sube a Drive y guarda solo el enlace en el Sheet
   ============================================================ */
function doPost(e) {
    try {
        var raw = e.postData.contents;
        var d   = JSON.parse(raw);

        var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(cap(d.sheet));
        if (!hoja) {
            return respond({ ok: false, error: 'Hoja no encontrada: ' + cap(d.sheet) });
        }

        /* Procesar fotos: subir a Drive y reemplazar base64 por URL */
        if (d.row) {
            d.row = subirFotosADrive(d.row, d.row.codigo || d.row.nombre || 'paciente');
        }

        if      (d.action === 'add')     add(hoja, d.row   || {}, d.sheet);
        else if (d.action === 'delete')  del(hoja, d.id);
        else if (d.action === 'update')  upd(hoja, d.id, d.row || {}, d.sheet);
        else if (d.action === 'replace') rep(hoja, d.rows  || [], d.sheet);

        return respond({ ok: true });

    } catch(err) {
        return respond({ ok: false, error: err.toString() });
    }
}

/* ============================================================
   SUBIR FOTOS A DRIVE
   Toma los campos foto1..foto5 del registro,
   sube cada imagen a Drive y reemplaza el base64 por la URL
   ============================================================ */
function subirFotosADrive(row, nombrePaciente) {
    var carpeta = obtenerCarpeta();
    var resultado = {};

    /* Copiar todos los campos del registro */
    Object.keys(row).forEach(function(k) {
        resultado[k] = row[k];
    });

    /* Procesar foto1 hasta foto5 */
    for (var n = 1; n <= 5; n++) {
        var campo = 'foto' + n;
        var valor = row[campo] || '';

        if (!valor || !valor.startsWith('data:image')) {
            /* No es base64, dejar como está (puede ser URL o vacío) */
            continue;
        }

        try {
            /* Extraer tipo y datos del base64 */
            var match    = valor.match(/^data:(image\/\w+);base64,(.+)$/);
            if (!match) continue;

            var mimeType = match[1];                    /* ej: image/jpeg */
            var b64data  = match[2];                    /* datos puros */
            var extension = mimeType.split('/')[1];     /* ej: jpeg */

            /* Crear el archivo en Drive */
            var blob      = Utilities.newBlob(
                Utilities.base64Decode(b64data),
                mimeType,
                nombrePaciente + '_foto' + n + '_' + Date.now() + '.' + extension
            );
            var archivo   = carpeta.createFile(blob);

            /* Hacer el archivo visible para cualquiera con el enlace */
            archivo.setSharing(
                DriveApp.Access.ANYONE_WITH_LINK,
                DriveApp.Permission.VIEW
            );

            /* Guardar la URL directa de visualización */
            var fileId = archivo.getId();
            resultado[campo] = 'https://drive.google.com/uc?export=view&id=' + fileId;

        } catch(err) {
            /* Si falla la subida de una foto, dejar el campo vacío */
            resultado[campo] = '';
            Logger.log('Error subiendo foto ' + n + ': ' + err.toString());
        }
    }

    return resultado;
}

/* Obtener (o crear) la carpeta de Drive */
function obtenerCarpeta() {
    var carpetas = DriveApp.getFoldersByName(NOMBRE_CARPETA_DRIVE);
    if (carpetas.hasNext()) {
        return carpetas.next();
    }
    /* Si no existe, la crea automáticamente */
    return DriveApp.createFolder(NOMBRE_CARPETA_DRIVE);
}

/* ============================================================
   OPERACIONES CRUD
   ============================================================ */
function add(h, r, sheetName) {
    inicializarCabeceras(h, sheetName);
    var headers = getH(h);
    if (!headers.length) return;
    h.appendRow(headers.map(function(k) {
        return r[k] !== undefined ? r[k] : '';
    }));
}

function del(h, id) {
    var d = h.getDataRange().getValues();
    var c = d[0].indexOf('id');
    if (c === -1) return;
    for (var i = d.length - 1; i >= 1; i--) {
        if (String(d[i][c]) === String(id)) {
            h.deleteRow(i + 1);
            break;
        }
    }
}

function upd(h, id, u, sheetName) {
    inicializarCabeceras(h, sheetName);
    var d  = h.getDataRange().getValues();
    var hd = d[0];
    var c  = hd.indexOf('id');
    if (c === -1) return;
    for (var i = 1; i < d.length; i++) {
        if (String(d[i][c]) === String(id)) {
            Object.keys(u).forEach(function(k) {
                var col = hd.indexOf(k);
                if (col !== -1) h.getRange(i + 1, col + 1).setValue(u[k]);
            });
            break;
        }
    }
}

function rep(h, rows, sheetName) {
    var l = h.getLastRow();
    if (l > 1) h.getRange(2, 1, l - 1, h.getLastColumn()).clearContent();
    rows.forEach(function(r) { add(h, r, sheetName); });
}

/* ============================================================
   INICIALIZAR CABECERAS
   ============================================================ */
function inicializarCabeceras(h, sheetName) {
    var nombre = (sheetName || '').toLowerCase();
    if (nombre === 'pacientes') {
        if (h.getLastRow() === 0 || h.getLastColumn() === 0) {
            h.appendRow(COLUMNAS_PACIENTES);
            return;
        }
        var actuales = getH(h);
        COLUMNAS_PACIENTES.forEach(function(col) {
            if (actuales.indexOf(col) === -1) {
                var lastCol = h.getLastColumn();
                h.getRange(1, lastCol + 1).setValue(col);
                actuales.push(col);
            }
        });
    }
}

/* ============================================================
   HELPERS
   ============================================================ */
function getH(h) {
    var l = h.getLastColumn();
    if (l === 0) return [];
    return h.getRange(1, 1, 1, l).getValues()[0];
}

function cap(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function respond(d) {
    return ContentService
        .createTextOutput(JSON.stringify(d))
        .setMimeType(ContentService.MimeType.JSON);
}

function testScript() {
    Logger.log('OK: ' + SpreadsheetApp.getActiveSpreadsheet().getName());
}
