/* ============================================================
   index.js — FisioSalud Milagros
   Carrusel de especialistas con scroll horizontal
   ============================================================ */

var track = document.getElementById('carouselTrack');
var dots   = document.querySelectorAll('.c-dot');

/* ===================== DRAG TO SCROLL (escritorio) ===================== */

if (track) {
    var isDown   = false;
    var startX;
    var scrollLeft;

    track.addEventListener('mousedown', function (e) {
        isDown     = true;
        startX     = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mouseleave', function () {
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', function () {
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - track.offsetLeft;
        track.scrollLeft = scrollLeft - (x - startX);
    });


    /* ===================== ACTUALIZAR DOTS ===================== */

    track.addEventListener('scroll', function () {
        updateDots();
    });

    function updateDots() {
        if (!dots.length) return;

        /* Ancho aproximado de cada tarjeta */
        var cardW = track.querySelector('.esp-card-main, .esp-card-sec');
        if (!cardW) return;

        var w   = cardW.offsetWidth + 14; /* 14px = gap */
        var idx = Math.round(track.scrollLeft / w);
        idx = Math.max(0, Math.min(idx, dots.length - 1));

        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === idx);
        });
    }

    /* Clic en dots para navegar */
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            var cardW = track.querySelector('.esp-card-main, .esp-card-sec');
            if (!cardW) return;
            var w = cardW.offsetWidth + 14;
            track.scrollTo({ left: w * i, behavior: 'smooth' });
        });
    });
}


/* ===================== IR A EVIDENCIAS ===================== */

/**
 * Navega a evidencias.html con el especialista preseleccionado.
 * @param {string} espId  ID del especialista (ej: 'ml', 'cr', etc.)
 */
function goToEvidencias(espId) {
    /* Guardamos el especialista seleccionado para que evidencias lo abra */
    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem('selectedEsp', espId);
        } catch (e) { /* silent */ }
    }
    window.location.href = 'evidencias.html';
}
