/* ============================================================
   evidencias.js v6 — FisioSalud Milagros
   - Lee videos reales desde Google Sheets
   - Comentarios se muestran directo (sin aprobación)
   - Solo admin puede borrar comentarios
   ============================================================ */

var currentEsp    = null;
var todosLosVideos = [];
var todosLosComentarios = [];
var currentFilter = 'all';

var ESPECIALISTAS = [
    { id:'mm', nombre:'Milagros Mayorga',     rol:'Supervisora',    especialidad:'Tec. Fisioterapia y Rehabilitación',        iniciales:'MM', principal:true  },
    { id:'lc', nombre:'Luis Coz',             rol:'Especialista',   especialidad:'Tec. Fisioterapia y Rehabilitación',        iniciales:'LC', principal:false },
    { id:'tc', nombre:'Trinidad T. Cárdenas', rol:'Especialista',   especialidad:'Tec. Fisioterapia y Rehabilitación',        iniciales:'TC', principal:false },
    { id:'bm', nombre:'Briguitt L. Martínez', rol:'Especialista',   especialidad:'Fisioterapia, Rehabilitación y Enfermería', iniciales:'BM', principal:false },
    { id:'ae', nombre:'Aurora Escudero',      rol:'Especialista',   especialidad:'Fisioterapia y Rehabilitación',             iniciales:'AE', principal:false }
];


/* ===================== LEER PARÁMETRO ?esp= ===================== */

function getURLParam(param) {
    var search = window.location.search;
    if (!search) return null;
    try { return new URLSearchParams(search).get(param); } catch(e) { return null; }
}


/* ===================== CARGAR DATOS AL INICIO ===================== */

window.addEventListener('load', function () {
    /* Cargar videos */
    getData('videos', function(data) {
        todosLosVideos = (data || []).filter(function(v) {
            var estado = (v.estado || v.Estado || 'publicado').toLowerCase();
            return estado === 'publicado';
        });
        actualizarContadores();
        console.log('Videos cargados:', todosLosVideos.length);

        /* Autoabrir por URL */
        var espParam = getURLParam('esp');
        if (espParam) {
            setTimeout(function () {
                var card = document.getElementById('esp-' + espParam);
                if (card) {
                    card.click();
                    setTimeout(function () {
                        var panel = document.getElementById('espPanel');
                        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 400);
                }
            }, 300);
        }

        /* Autoabrir desde index */
        try {
            var sel = localStorage.getItem('selectedEsp');
            if (sel && !espParam) {
                localStorage.removeItem('selectedEsp');
                var card = document.getElementById('esp-' + sel);
                if (card) { setTimeout(function(){ card.click(); }, 400); }
            }
        } catch(e) {}
    });

    /* Cargar comentarios */
    getData('comentarios', function(data) {
        /* Mostrar todos los comentarios directamente */
        todosLosComentarios = data || [];
        console.log('Comentarios cargados:', todosLosComentarios.length);
    });
});


/* ===================== ACTUALIZAR CONTADORES ===================== */

function actualizarContadores() {
    ESPECIALISTAS.forEach(function(esp) {
        var count = todosLosVideos.filter(function(v) {
            return (v.especialista || v.Especialista || '') === esp.id;
        }).length;
        var card = document.getElementById('esp-' + esp.id);
        if (card) {
            var pill = card.querySelector('.ev-vid-pill-main, .ev-vid-pill-sec');
            if (pill) pill.textContent = '🎬 ' + count;
        }
    });
}


/* ===================== ABRIR PANEL ESPECIALISTA ===================== */

function toggleEspPanel(id, init, name, role, el) {
    var panel = document.getElementById('espPanel');

    if (currentEsp === id) {
        panel.classList.remove('open');
        document.querySelectorAll('.esp-av-main, .esp-av-sec').forEach(function(c) { c.classList.remove('active'); });
        currentEsp = null;
        history.replaceState(null, '', window.location.pathname);
        return;
    }

    document.querySelectorAll('.esp-av-main, .esp-av-sec').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    currentEsp = id;

    history.replaceState(null, '', window.location.pathname + '?esp=' + id);

    var panelAv   = document.getElementById('panelAv');
    var panelName = document.getElementById('panelName');
    var panelRole = document.getElementById('panelRole');
    if (panelAv)   panelAv.textContent   = init;
    if (panelName) panelName.textContent = name;
    if (panelRole) panelRole.textContent = role;

    renderVideos(id);
    panel.classList.add('open');

    setTimeout(function () {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
}


/* ===================== RENDERIZAR VIDEOS ===================== */

function renderVideos(espId) {
    var container = document.getElementById('videosGrid');
    if (!container) return;

    var videos = todosLosVideos.filter(function(v) {
        return (v.especialista || v.Especialista || '') === espId;
    });

    if (currentFilter !== 'all') {
        videos = videos.filter(function(v) {
            return (v.categoria || v.Categoría || '') === currentFilter;
        });
    }

    if (videos.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);font-size:.85rem;">'
            + '<div style="font-size:2rem;margin-bottom:.5rem;">🎬</div>'
            + '<p>Aún no hay videos publicados para este especialista.</p>'
            + '</div>';
        return;
    }

    var bgs = ['vt1','vt2','vt3','vt4','vt5','vt6'];

    container.innerHTML = videos.map(function(v, idx) {
        var ytId   = getYTId(v.url || v.URL || '');
        var titulo = v.titulo  || v.Título  || 'Sin título';
        var desc   = v.descripcion || v.Descripción || '';
        var cat    = v.categoria   || v.Categoría   || 'General';
        var vid_id = v.id || ('vid_' + idx);
        var bg     = bgs[idx % bgs.length];

        var thumbContent = ytId
            ? '<img src="https://img.youtube.com/vi/' + ytId + '/mqdefault.jpg" style="width:100%;height:100%;object-fit:cover;" alt="' + titulo + '">'
            : '<div class="play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>';

        var clickAction = ytId
            ? 'abrirVideo(\'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0\',\'' + titulo.replace(/'/g,"\'") + '\')'
            : '';

        /* Contar comentarios de este video */
        var comentariosVideo = todosLosComentarios.filter(function(c) {
            return String(c.video || c.Video || '') === String(vid_id);
        });

        return '<div class="video-card" data-cat="' + cat + '">'
            + '<div class="video-thumb ' + bg + '" onclick="' + clickAction + '" style="' + (ytId ? 'cursor:pointer;' : '') + 'position:relative;">'
            + thumbContent
            + (ytId ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"><div class="play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>' : '')
            + '<span class="vid-cat-badge">' + cat + '</span>'
            + '</div>'
            + '<div class="video-info"><h4>' + titulo + '</h4><p>' + desc + '</p></div>'
            + '<button class="comments-toggle" onclick="toggleComments(this,\'' + vid_id + '\')">'
            + '<span class="toggle-left">💬 <span>Ver opiniones</span>'
            + '<span class="comment-count">' + comentariosVideo.length + '</span>'
            + '</span><span class="toggle-arrow">▼</span>'
            + '</button>'
            + '<div class="comments-panel" id="cp-' + vid_id + '">'
            + '<div class="comments-inner">'
            + buildComments(vid_id, comentariosVideo)
            + buildCommentForm(vid_id)
            + '</div>'
            + '</div>'
            + '</div>';
    }).join('');
}

function getYTId(url) {
    if (!url) return null;
    var m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? m[1] : null;
}


/* ===================== RENDERIZAR COMENTARIOS ===================== */

function buildComments(vidId, comentarios) {
    if (!comentarios || comentarios.length === 0) return '';

    return comentarios.map(function(c) {
        var nombre   = c.nombre   || c.Nombre   || 'Anónimo';
        var texto    = c.texto    || c.Texto    || '';
        var estrellas = parseInt(c.estrellas || c.Estrellas || 0);
        var fecha    = c.fecha    || c.Fecha    || '';
        var iniciales = nombre.split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().substring(0,2);
        var colores  = ['av-g','av-p','av-r'];
        var color    = colores[nombre.charCodeAt(0) % colores.length];
        var stars    = estrellas > 0 ? '★'.repeat(estrellas) + '☆'.repeat(5 - estrellas) : '';

        return '<div class="comment">'
            + '<div class="c-av ' + color + '">' + iniciales + '</div>'
            + '<div class="c-content">'
            + '<div class="c-header">'
            + '<span class="c-name">' + nombre + '</span>'
            + (stars ? '<span class="c-stars">' + stars + '</span>' : '')
            + '<span class="c-date">' + fecha + '</span>'
            + '</div>'
            + '<p class="c-text">' + texto + '</p>'
            + '</div>'
            + '</div>';
    }).join('');
}

function buildCommentForm(vid) {
    return '<div class="new-comment">'
        + '<p>¿Tuviste este tratamiento? Deja tu opinión:</p>'
        + '<div class="nc-row">'
        + '<input class="nc-input" placeholder="Tu nombre" id="nc-name-' + vid + '">'
        + '<div class="stars-row" id="stars-' + vid + '">'
        + [1,2,3,4,5].map(function(n){ return '<button class="star-btn" onclick="setStar(\'' + vid + '\',' + n + ')">★</button>'; }).join('')
        + '</div></div>'
        + '<textarea class="nc-input nc-textarea" placeholder="Escribe tu opinión..." id="nc-text-' + vid + '"></textarea>'
        + '<button class="send-btn" onclick="sendComment(\'' + vid + '\')">Publicar opinión</button>'
        + '<p class="sent-msg" id="sent-' + vid + '">✅ Opinión publicada correctamente.</p>'
        + '</div>';
}


/* ===================== TOGGLE COMENTARIOS ===================== */

function toggleComments(btn, vid) {
    var panel  = document.getElementById('cp-' + vid);
    var arrow  = btn.querySelector('.toggle-arrow');
    var label  = btn.querySelector('.toggle-left span:nth-child(2)');
    var isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    btn.classList.toggle('open');
    arrow.classList.toggle('rotated');
    if (label) label.textContent = isOpen ? 'Ver opiniones' : 'Ocultar opiniones';
}


/* ===================== ESTRELLAS ===================== */

function setStar(vid, val) {
    var row = document.getElementById('stars-' + vid);
    if (!row) return;
    row.querySelectorAll('.star-btn').forEach(function(s, i) {
        s.classList.toggle('active', i < val);
    });
    row.dataset.val = val;
}


/* ===================== ENVIAR COMENTARIO ===================== */

function sendComment(vid) {
    var name = document.getElementById('nc-name-' + vid);
    var text = document.getElementById('nc-text-' + vid);
    if (!name || !text) return;
    if (!name.value.trim() || !text.value.trim()) {
        alert('Por favor completa tu nombre y opinión.');
        return;
    }

    var starsRow = document.getElementById('stars-' + vid);
    var estrellas = starsRow ? (parseInt(starsRow.dataset.val) || 5) : 5;

    var nuevoComentario = {
        id:        Date.now(),
        nombre:    name.value.trim(),
        estrellas: estrellas,
        texto:     text.value.trim(),
        video:     vid,
        estado:    'publicado',   /* Directo, sin aprobación */
        fecha:     new Date().toLocaleDateString('es-PE')
    };

    /* Guardar en Sheets */
    if (typeof writeToSheet !== 'undefined') {
        writeToSheet({
            sheet:  'comentarios',
            action: 'add',
            row:    nuevoComentario
        }, function() {});
    }

    /* Mostrar inmediatamente en la página sin recargar */
    todosLosComentarios.push(nuevoComentario);

    /* Actualizar el panel de comentarios del video */
    var panel = document.getElementById('cp-' + vid);
    if (panel) {
        var inner = panel.querySelector('.comments-inner');
        if (inner) {
            var comentariosVideo = todosLosComentarios.filter(function(c) {
                return String(c.video || c.Video || '') === String(vid);
            });
            inner.innerHTML = buildComments(vid, comentariosVideo) + buildCommentForm(vid);
        }
    }

    /* Actualizar contador */
    var toggle = panel ? panel.previousElementSibling : null;
    if (toggle) {
        var count = toggle.querySelector('.comment-count');
        if (count) {
            count.textContent = parseInt(count.textContent || 0) + 1;
        }
    }

    /* Limpiar campos */
    name.value = '';
    text.value = '';
    if (starsRow) {
        starsRow.querySelectorAll('.star-btn').forEach(function(s) { s.classList.remove('active'); });
        starsRow.dataset.val = '';
    }
}


/* ===================== FILTRO DE CATEGORÍA ===================== */

function filterCat(btn, cat) {
    currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    if (currentEsp) renderVideos(currentEsp);
}


/* ===================== COMPARTIR ===================== */

function copyShareLink(espId) {
    var baseUrl  = window.location.href.split('?')[0];
    var shareUrl = baseUrl + '?esp=' + espId;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
            .then(function() { showShareToast('✅ Link copiado al portapapeles'); });
    } else {
        var input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showShareToast('✅ Link copiado al portapapeles');
    }
}

function shareByWhatsApp(espId) {
    var esp     = ESPECIALISTAS.find(function(e) { return e.id === espId; });
    var baseUrl = window.location.href.split('?')[0];
    var url     = baseUrl + '?esp=' + espId;
    var msg     = '👩‍⚕️ *' + (esp ? esp.nombre : espId) + '*\n'
                + (esp ? esp.especialidad + '\n' : '')
                + '\n🎬 Ve sus casos clínicos en video:\n' + url
                + '\n\n🏥 _FisioSalud Milagros · Lima_';
    openWA(msg);
}

function showShareToast(msg) {
    var t = document.getElementById('shareToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'shareToast';
        t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(10px);background:#1a1a24;border:1px solid rgba(0,229,195,.3);color:#00e5c3;padding:10px 20px;border-radius:10px;font-size:.8rem;font-weight:500;opacity:0;transition:all .3s;pointer-events:none;z-index:9999;white-space:nowrap;max-width:90vw;text-align:center;';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(function() {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(10px)';
    }, 3000);
}


/* ===================== REPRODUCTOR MODAL ===================== */

function abrirVideo(embedUrl, titulo) {
    /* Crear modal si no existe */
    var modal = document.getElementById('videoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:9999',
            'background:rgba(0,0,0,.92)',
            'display:flex', 'align-items:center', 'justify-content:center',
            'flex-direction:column', 'padding:1rem',
            'animation:fadeIn .25s ease'
        ].join(';');

        modal.innerHTML = [
            '<div style="width:100%;max-width:860px;position:relative;">',
            /* Título y botón cerrar */
            '  <div style="display:flex;align-items:center;justify-content:space-between;',
            '              margin-bottom:.7rem;gap:1rem;">',
            '    <span id="videoModalTitle" style="font-family:Syne,sans-serif;font-weight:700;',
            '          font-size:.95rem;color:#f0f0f5;line-height:1.3;"></span>',
            '    <button onclick="cerrarVideo()" style="',
            '      background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);',
            '      color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.1rem;',
            '      cursor:pointer;flex-shrink:0;display:flex;align-items:center;',
            '      justify-content:center;transition:all .2s;" ',
            '      onmouseover="this.style.background=\'rgba(255,255,255,.2)\'" ',
            '      onmouseout="this.style.background=\'rgba(255,255,255,.1)\'">✕</button>',
            '  </div>',
            /* Contenedor del iframe — ratio 16:9 */
            '  <div style="position:relative;padding-bottom:56.25%;height:0;',
            '              background:#000;border-radius:12px;overflow:hidden;',
            '              box-shadow:0 20px 60px rgba(0,0,0,.8);">',
            '    <iframe id="videoIframe"',
            '      style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"',
            '      allow="autoplay;encrypted-media;fullscreen"',
            '      allowfullscreen></iframe>',
            '  </div>',
            /* Instrucción */
            '  <p style="text-align:center;font-size:.72rem;color:#555;margin-top:.6rem;">',
            '    Toca fuera del video o presiona ✕ para cerrar',
            '  </p>',
            '</div>'
        ].join('');

        /* Cerrar al hacer clic fuera del video */
        modal.addEventListener('click', function(e) {
            if (e.target === modal) cerrarVideo();
        });

        /* Cerrar con tecla Escape */
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') cerrarVideo();
        });

        document.body.appendChild(modal);
    }

    /* Actualizar contenido */
    document.getElementById('videoModalTitle').textContent = titulo || '';
    document.getElementById('videoIframe').src = embedUrl;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; /* Bloquear scroll */
}

function cerrarVideo() {
    var modal = document.getElementById('videoModal');
    if (modal) {
        modal.style.display = 'none';
        /* Detener el video */
        var iframe = document.getElementById('videoIframe');
        if (iframe) iframe.src = '';
    }
    document.body.style.overflow = ''; /* Restaurar scroll */
}