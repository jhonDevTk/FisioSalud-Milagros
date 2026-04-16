/* ============================================================
   sheets.js v5 — FisioSalud Milagros
   - Fetch CSV con caché en localStorage
   - Si falla el fetch, usa datos guardados anteriormente
   - Los videos nunca desaparecen
   ============================================================ */

var CACHE_MINUTES = 30; /* Minutos que dura la caché */

/* ============================================================
   LEER DATOS — Fetch CSV con caché
   ============================================================ */

function readSheet(sheetName, callback) {
    if (!SHEETS_CONFIGURED) {
        callback(null, 'NO_CONFIG');
        return;
    }

    var cacheKey = 'fsm_cache_' + sheetName;
    var cacheTimeKey = 'fsm_cache_time_' + sheetName;

    /* Intentar fetch del Sheets */
    var url = 'https://docs.google.com/spreadsheets/d/' + SHEETS_ID
            + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(sheetName)
            + '&t=' + Date.now(); /* Evitar caché del navegador */

    fetch(url, { cache: 'no-store' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        })
        .then(function(csvText) {
            /* Verificar que recibimos datos reales (no página de error) */
            if (!csvText || csvText.trim().length < 10 || csvText.includes('<!DOCTYPE')) {
                throw new Error('Respuesta inválida del Sheets');
            }

            var result = parseCSV(csvText);

            if (result.length > 0) {
                /* Guardar en caché local */
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(result));
                    localStorage.setItem(cacheTimeKey, Date.now().toString());
                } catch(e) {}
                console.log('✅ Sheets leído OK (' + sheetName + '):', result.length, 'filas');
                callback(result, null);
            } else {
                /* Sin datos — usar caché */
                var cached = getCached(cacheKey);
                if (cached) {
                    console.log('📦 Usando caché (' + sheetName + '):', cached.length, 'filas');
                    callback(cached, null);
                } else {
                    callback([], null);
                }
            }
        })
        .catch(function(err) {
            console.warn('⚠️ Fetch error (' + sheetName + '):', err.message);
            /* Usar caché local si existe */
            var cached = getCached(cacheKey);
            if (cached && cached.length > 0) {
                console.log('📦 Usando caché por error (' + sheetName + '):', cached.length, 'filas');
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

/* Parsear CSV respetando comillas */
function parseCSV(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    var headers = parseCSVLine(lines[0]);
    var result  = [];

    for (var i = 1; i < lines.length; i++) {
        var values = parseCSVLine(lines[i]);
        if (!values.length) continue;

        var obj = {};
        headers.forEach(function(h, idx) {
            obj[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
        });

        if (Object.values(obj).some(function(v) { return v !== ''; })) {
            result.push(obj);
        }
    }
    return result;
}

function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;

    for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
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
   ESCRIBIR DATOS — GET al Apps Script
   ============================================================ */

function writeToSheet(payload, callback) {
    if (typeof WEBHOOK_URL === 'undefined' || !WEBHOOK_URL || WEBHOOK_URL === '') {
        saveLocalFallback(payload);
        callback({ ok: true, local: true });
        return;
    }

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
            saveLocalFallback(payload);
            /* Limpiar caché para forzar re-lectura */
            try { localStorage.removeItem('fsm_cache_' + payload.sheet); } catch(e) {}
            callback({ ok: true });
        })
        .catch(function() {
            writeWithScript(url, payload, callback);
        });
}

function writeWithScript(url, payload, callback) {
    var cbName = 'writeCb_' + Date.now();
    var script = document.createElement('script');

    window[cbName] = function(data) {
        delete window[cbName];
        if (document.head.contains(script)) document.head.removeChild(script);
        saveLocalFallback(payload);
        try { localStorage.removeItem('fsm_cache_' + payload.sheet); } catch(e) {}
        callback(data || { ok: true });
    };

    script.onerror = function() {
        delete window[cbName];
        if (document.head.contains(script)) document.head.removeChild(script);
        saveLocalFallback(payload);
        callback({ ok: true, local: true });
    };

    script.src = url + '&callback=' + cbName;
    document.head.appendChild(script);

    setTimeout(function() {
        if (window[cbName]) {
            delete window[cbName];
            saveLocalFallback(payload);
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

        if (payload.action === 'add') {
            if (!payload.row.id) payload.row.id = Date.now();
            var exists = data.some(function(r) { return String(r.id) === String(payload.row.id); });
            if (!exists) data.push(payload.row);
        } else if (payload.action === 'delete') {
            data = data.filter(function(r) { return String(r.id) !== String(payload.id); });
        } else if (payload.action === 'update') {
            data = data.map(function(r) {
                return String(r.id) === String(payload.id) ? Object.assign({}, r, payload.row) : r;
            });
        } else if (payload.action === 'replace') {
            data = payload.rows || [];
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
            /* Intentar fallback local primero */
            var local = readLocalFallback(sheet);
            if (local.length > 0) {
                console.log('📦 Usando localStorage (' + sheet + '):', local.length, 'items');
                callback(local);
            } else {
                callback(DEFAULT_DATA[sheet] || []);
            }
        } else {
            callback(data);
        }
    });
}
