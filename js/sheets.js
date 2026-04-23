/* ============================================================
   sheets.js v6 — FisioSalud Milagros
   - Fetch CSV con caché en localStorage
   - Si falla el fetch, usa datos guardados anteriormente
   - writeToSheet usa POST para datos grandes (fotos)
   ============================================================ */

var CACHE_MINUTES = 30;

/* ============================================================
   LEER DATOS
   ============================================================ */

function readSheet(sheetName, callback) {
    if (!SHEETS_CONFIGURED) {
        callback(null, 'NO_CONFIG');
        return;
    }

    var cacheKey = 'fsm_cache_' + sheetName;

    var url = 'https://docs.google.com/spreadsheets/d/' + SHEETS_ID
            + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(sheetName)
            + '&t=' + Date.now();

    fetch(url, { cache: 'no-store' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        })
        .then(function(csvText) {
            if (!csvText || csvText.trim().length < 10 || csvText.includes('<!DOCTYPE')) {
                throw new Error('Respuesta inválida del Sheets');
            }
            var result = parseCSV(csvText);
            if (result.length > 0) {
                try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch(e) {}
                callback(result, null);
            } else {
                var cached = getCached(cacheKey);
                callback(cached || [], null);
            }
        })
        .catch(function(err) {
            console.warn('Fetch error (' + sheetName + '):', err.message);
            var cached = getCached(cacheKey);
            if (cached && cached.length > 0) {
                callback(cached, null);
            } else {
                callback(null, 'FETCH_ERROR');
            }
        });
}

function getCached(key) {
    try {
        var data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
}

function parseCSV(text) {
    /* Eliminar BOM UTF-8 que Google Sheets a veces incluye */
    text = text.replace(/^\uFEFF/, '');

    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    /* Limpiar headers: quitar espacios y comillas residuales */
    var headers = parseCSVLine(lines[0]).map(function(h) {
        return h.trim().replace(/^["'\s]+|["'\s]+$/g, '');
    });

    console.log('📋 CSV headers:', headers);

    var result  = [];
    for (var i = 1; i < lines.length; i++) {
        var values = parseCSVLine(lines[i]);
        if (!values.length) continue;
        var obj = {};
        headers.forEach(function(h, idx) {
            obj[h] = values[idx] !== undefined ? values[idx].trim() : '';
        });
        if (Object.values(obj).some(function(v) { return v !== ''; })) {
            result.push(obj);
        }
    }
    return result;
}

function parseCSVLine(line) {
    var result   = [];
    var current  = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}


/* ============================================================
   ESCRIBIR DATOS
   — usa POST cuando el payload tiene fotos (>4 KB)
   — usa GET para el resto
   ============================================================ */

function writeToSheet(payload, callback) {
    if (typeof WEBHOOK_URL === 'undefined' || !WEBHOOK_URL || WEBHOOK_URL === '') {
        saveLocalFallback(payload);
        callback({ ok: true, local: true });
        return;
    }

    /* Respaldo local inmediato */
    saveLocalFallback(payload);

    /* ¿Tiene fotos? */
    var esPesado = payload.row && JSON.stringify(payload.row).length > 4000;

    if (esPesado) {
        /* POST para registros con fotos — envía JSON crudo en el body */
        var postBody = {
            action: payload.action,
            sheet:  payload.sheet
        };
        if (payload.action === 'add')    postBody.row  = payload.row;
        if (payload.action === 'update') postBody.row  = payload.row;
        if (payload.action === 'update') postBody.id   = payload.id;
        if (payload.action === 'delete') postBody.id   = payload.id;
        if (payload.action === 'replace') postBody.rows = payload.rows;

        fetch(WEBHOOK_URL, {
            method:  'POST',
            mode:    'no-cors',
            headers: { 'Content-Type': 'text/plain' }, /* text/plain evita preflight CORS */
            body:    JSON.stringify(postBody)
        })
            .then(function() {
                try { localStorage.removeItem('fsm_cache_' + payload.sheet); } catch(e) {}
                callback({ ok: true });
            })
            .catch(function() {
                callback({ ok: true, local: true });
            });

    } else {
        /* GET normal */
        var params = 'action=' + encodeURIComponent(payload.action)
                   + '&sheet='  + encodeURIComponent(payload.sheet);

        if (payload.action === 'add' && payload.row) {
            params += '&data=' + encodeURIComponent(JSON.stringify(payload.row));
        } else if (payload.action === 'delete') {
            params += '&id=' + encodeURIComponent(payload.id);
        } else if (payload.action === 'update') {
            params += '&id='   + encodeURIComponent(payload.id);
            params += '&data=' + encodeURIComponent(JSON.stringify(payload.row));
        } else if (payload.action === 'replace') {
            params += '&data=' + encodeURIComponent(JSON.stringify({ rows: payload.rows }));
        }

        var url = WEBHOOK_URL + '?' + params;

        fetch(url, { method: 'GET', mode: 'no-cors' })
            .then(function() {
                try { localStorage.removeItem('fsm_cache_' + payload.sheet); } catch(e) {}
                callback({ ok: true });
            })
            .catch(function() {
                writeWithScript(url, payload, callback);
            });
    }
}

function writeWithScript(url, payload, callback) {
    var cbName = 'writeCb_' + Date.now();
    var script = document.createElement('script');

    window[cbName] = function(data) {
        delete window[cbName];
        if (document.head.contains(script)) document.head.removeChild(script);
        try { localStorage.removeItem('fsm_cache_' + payload.sheet); } catch(e) {}
        callback(data || { ok: true });
    };

    script.onerror = function() {
        delete window[cbName];
        if (document.head.contains(script)) document.head.removeChild(script);
        callback({ ok: true, local: true });
    };

    script.src = url + '&callback=' + cbName;
    document.head.appendChild(script);

    setTimeout(function() {
        if (window[cbName]) {
            delete window[cbName];
            callback({ ok: true, local: true, timeout: true });
        }
    }, 8000);
}


/* ============================================================
   FALLBACK LOCAL
   ============================================================ */

function saveLocalFallback(payload) {
    try {
        var key  = 'fsm_' + payload.sheet;
        var data = JSON.parse(localStorage.getItem(key) || '[]');

        /* Si el registro tiene fotos en base64, no las guardamos
           en localStorage — ya van a Drive vía el Apps Script.
           Solo guardamos la URL si ya viene como enlace de Drive. */
        function limpiarFotos(row) {
            if (!row) return row;
            var r = Object.assign({}, row);
            for (var n = 1; n <= 5; n++) {
                var campo = 'foto' + n;
                if (r[campo] && r[campo].startsWith('data:')) {
                    r[campo] = ''; /* quitar base64, Drive guardará la URL real */
                }
            }
            /* también limpiar campo "foto" legacy */
            if (r.foto && r.foto.startsWith('data:')) r.foto = '';
            return r;
        }

        if (payload.action === 'add') {
            var row = limpiarFotos(payload.row);
            if (!row.id) row.id = Date.now();
            var exists = data.some(function(r) {
                return String(r.id) === String(row.id);
            });
            if (!exists) data.push(row);
        } else if (payload.action === 'delete') {
            data = data.filter(function(r) {
                return String(r.id) !== String(payload.id);
            });
        } else if (payload.action === 'update') {
            var upd = limpiarFotos(payload.row);
            data = data.map(function(r) {
                return String(r.id) === String(payload.id)
                    ? Object.assign({}, r, upd) : r;
            });
        } else if (payload.action === 'replace') {
            data = (payload.rows || []).map(limpiarFotos);
        }

        localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {}
}

function readLocalFallback(sheet) {
    try { return JSON.parse(localStorage.getItem('fsm_' + sheet) || '[]'); }
    catch(e) { return []; }
}


/* ============================================================
   DATOS POR DEFECTO
   ============================================================ */

var DEFAULT_DATA = {
    equipo: [
        { id:'mm', nombre:'Milagros Mayorga',     cargo:'Supervisora',  especialidad:'Tec. Fisioterapia y Rehabilitación',        anios:'', principal:'si', iniciales:'MM' },
        { id:'lc', nombre:'Luis Coz',             cargo:'Especialista', especialidad:'Tec. Fisioterapia y Rehabilitación',        anios:'', principal:'no', iniciales:'LC' },
        { id:'tc', nombre:'Trinidad T. Cárdenas', cargo:'Especialista', especialidad:'Tec. Fisioterapia y Rehabilitación',        anios:'', principal:'no', iniciales:'TC' },
        { id:'bm', nombre:'Briguitt L. Martínez', cargo:'Especialista', especialidad:'Fisioterapia, Rehabilitación y Enfermería', anios:'', principal:'no', iniciales:'BM' },
        { id:'ae', nombre:'Aurora Escudero',      cargo:'Especialista', especialidad:'Fisioterapia y Rehabilitación',             anios:'', principal:'no', iniciales:'AE' }
    ],
    servicios: [
        { nombre:'Fisioterapia Musculoesquelética', descripcion:'Columna, articulaciones y tejidos blandos.', icono:'🦴' },
        { nombre:'Electroterapia',                  descripcion:'Corrientes para analgesia y estimulación.',  icono:'⚡' },
        { nombre:'Rehabilitación Deportiva',        descripcion:'Protocolos para retorno deportivo.',         icono:'🏃' },
        { nombre:'Fisioterapia Neurológica',        descripcion:'ACV, Parkinson, esclerosis.',                icono:'🧠' },
        { nombre:'Terapia Manual',                  descripcion:'Movilizaciones, miofascial y punción seca.', icono:'💆' },
        { nombre:'Fisioterapia Obstétrica',         descripcion:'Embarazo, postparto y suelo pélvico.',       icono:'🤰' }
    ],
    contacto: [
        { campo:'Dirección', valor:'Av. Javier Prado Este 1234, San Isidro, Lima' },
        { campo:'Teléfono',  valor:'+51 921 720 767'                               },
        { campo:'Email',     valor:'info@fisiosaludmilagros.pe'                    },
        { campo:'Horario',   valor:'Lun – Vie: 8:00 – 19:00 · Sáb: 8:00 – 13:00' }
    ]
};


/* ============================================================
   FUNCIÓN PRINCIPAL
   ============================================================ */

function getData(sheet, callback) {
    if (!SHEETS_CONFIGURED) {
        var local = readLocalFallback(sheet);
        callback(local.length > 0 ? local : (DEFAULT_DATA[sheet] || []));
        return;
    }

    readSheet(SHEETS[sheet] || sheet, function(data, err) {
        if (err || !data || data.length === 0) {
            var local = readLocalFallback(sheet);
            if (local.length > 0) {
                callback(local);
            } else {
                callback(DEFAULT_DATA[sheet] || []);
            }
        } else {
            callback(data);
        }
    });
}
