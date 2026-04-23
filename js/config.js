/* ============================================================
   config.js v3 — FisioSalud Milagros
   ============================================================ */

var SHEETS_ID = '1-bYWD7Lek90dgiXjfIGEp3oUkf-DDI1sUmu3dtbb-1A';

var USUARIOS = {
    'admin': {
        pass: 'fisiomilagrosjhon',
        rol:  'admin',
        id:   null,
        nombre: 'Administrador'
    },
    'milagros.ma': {
        pass:   'camilagros',
        rol:    'especialista',
        id:     'mm',
        nombre: 'Milagros Mayorga'
    },
    'luis.co': {
        pass:   'luis928',
        rol:    'especialista',
        id:     'lc',
        nombre: 'Luis Coz'
    },
    'trinidad.ca': {
        pass:   'trinidad943',
        rol:    'especialista',
        id:     'tc',
        nombre: 'Trinidad T. Cárdenas'
    },
    'briguitt.ma': {
        pass:   'bri910',
        rol:    'especialista',
        id:     'bm',
        nombre: 'Briguitt L. Martínez'
    },
    'aurora.es': {
        pass:   'magaly920',
        rol:    'especialista',
        id:     'ae',
        nombre: 'Aurora Escudero'
    }
};

var WA_NUMBER = '51921720767';

var WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw1mtmGvi4lgV5LOWu4lQ3r9Af09bivcquooJTN_ItwbcI1opmmrv9x-d8XiQxQkUJp/exec';

var SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d/' + SHEETS_ID + '/gviz/tq?tqx=out:json&sheet=';

var SHEETS = {
    Pacientes:   'Pacientes',
    pacientes:   'Pacientes',
    equipo:      'Equipo',
    videos:      'Videos',
    servicios:   'Servicios',
    comentarios: 'Comentarios',
    contacto:    'Contacto'
};

var ESPECIALISTAS_DEFAULT = [
    { id:'mm', nombre:'Milagros Mayorga',     cargo:'Supervisora',  especialidad:'Tec. Fisioterapia y Rehabilitación',        anios:'', principal:'si', iniciales:'MM' },
    { id:'lc', nombre:'Luis Coz',             cargo:'Especialista', especialidad:'Tec. Fisioterapia y Rehabilitación',        anios:'', principal:'no', iniciales:'LC' },
    { id:'tc', nombre:'Trinidad T. Cárdenas', cargo:'Especialista', especialidad:'Tec. Fisioterapia y Rehabilitación',        anios:'', principal:'no', iniciales:'TC' },
    { id:'bm', nombre:'Briguitt L. Martínez', cargo:'Especialista', especialidad:'Fisioterapia, Rehabilitación y Enfermería', anios:'', principal:'no', iniciales:'BM' },
    { id:'ae', nombre:'Aurora Escudero',      cargo:'Especialista', especialidad:'Fisioterapia y Rehabilitación',             anios:'', principal:'no', iniciales:'AE' }
];

function getSheetURL(sheetName) {
    return SHEETS_BASE_URL + encodeURIComponent(sheetName);
}

function openWA(msg) {
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}

var SHEETS_CONFIGURED = (SHEETS_ID !== 'TU_ID_AQUI');

function verificarLogin(usuario, password) {
    var u = USUARIOS[usuario.toLowerCase()];
    if (!u) return null;
    if (u.pass !== password) return null;
    return u;
}
