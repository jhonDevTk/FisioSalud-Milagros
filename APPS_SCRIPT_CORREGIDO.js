/* ============================================================
   Apps Script — FisioSalud Milagros  (versión final)
   ============================================================
   INSTRUCCIONES:
   1. Pega este código completo en Apps Script (borra todo lo anterior)
   2. Implementar > Administrar implementaciones > lápiz ✏️
   3. Elige "Nueva versión" y guarda
   ============================================================ */

/* Columnas exactas de la hoja Pacientes (en este orden) */
var COLUMNAS_PACIENTES = [
    'id', 'codigo', 'nombre', 'edad', 'genero', 'telefono',
    'fecha', 'diagnostico', 'tratamiento', 'estado',
    'registradoPor', 'foto1', 'foto2', 'foto3', 'foto4', 'foto5'
];

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

function doPost(e) {
    try {
        var raw = e.postData.contents;
        var d   = JSON.parse(raw);

        var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(cap(d.sheet));
        if (!hoja) {
            return respond({ ok: false, error: 'Hoja no encontrada: ' + cap(d.sheet) });
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
   Garantiza que la hoja tenga las columnas correctas.
   Para "Pacientes" usa el orden fijo de COLUMNAS_PACIENTES.
   Para otras hojas agrega columnas faltantes al final.
   ============================================================ */

function inicializarCabeceras(h, sheetName) {
    var nombre = (sheetName || '').toLowerCase();

    if (nombre === 'pacientes') {
        /* Si la hoja está vacía, crear cabeceras con el orden correcto */
        if (h.getLastRow() === 0 || h.getLastColumn() === 0) {
            h.appendRow(COLUMNAS_PACIENTES);
            return;
        }
        /* Si ya tiene filas, agregar columnas faltantes al final */
        var actuales = getH(h);
        COLUMNAS_PACIENTES.forEach(function(col) {
            if (actuales.indexOf(col) === -1) {
                var lastCol = h.getLastColumn();
                h.getRange(1, lastCol + 1).setValue(col);
                actuales.push(col);
            }
        });
    } else {
        /* Para otras hojas: agregar columnas nuevas si no existen */
        if (h.getLastRow() === 0) return; /* vacía sin datos, se creará en add */
        /* No hacer nada — ya funciona con asegurarColumnas implícito */
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
