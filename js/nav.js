/* ============================================================
   nav.js — FisioSalud Milagros
   Menú hamburguesa + WhatsApp flotante (todas las páginas)
   ============================================================ */

var WA_NUMBER     = '51921720767';
var bubbleVisible = false;

/* ===================== MENÚ HAMBURGUESA ===================== */

var hamBtn    = document.getElementById('hamBtn');
var mobileMenu = document.getElementById('mobileMenu');

if (hamBtn && mobileMenu) {
    hamBtn.addEventListener('click', function () {
        hamBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    /* Cerrar menú al hacer clic en un enlace */
    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            hamBtn.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    /* Cerrar menú al hacer clic fuera */
    document.addEventListener('click', function (e) {
        if (!hamBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamBtn.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });
}


/* ===================== WHATSAPP FLOTANTE ===================== */

/**
 * Alterna el globo de bienvenida.
 * Si se cierra, abre WhatsApp directamente.
 */
function toggleBubble() {
    bubbleVisible = !bubbleVisible;
    var bubble = document.getElementById('waBubble');

    if (bubbleVisible) {
        bubble.style.display = 'block';
    } else {
        bubble.style.display = 'none';
        openWA('¡Hola! Me gustaría obtener más información sobre los servicios de FisioSalud Milagros.');
    }
}

/**
 * Abre WhatsApp con el mensaje indicado.
 * @param {string} msg  Mensaje a enviar
 */
function openWA(msg) {
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}

/* Mostrar globo automáticamente al cargar y ocultarlo a los 5 s */
window.addEventListener('load', function () {
    setTimeout(function () {
        var bubble = document.getElementById('waBubble');
        if (bubble) {
            bubble.style.display = 'block';
            bubbleVisible = true;

            setTimeout(function () {
                bubble.style.display = 'none';
                bubbleVisible = false;
            }, 5000);
        }
    }, 2500);
});
