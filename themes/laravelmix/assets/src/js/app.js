import 'alpinejs';

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initParallax();
    initAudio();
});

function initScrollReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initParallax() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;
    let ticking = false;
    function update() {
        const y = window.scrollY;
        layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.parallax) || 0.08;
            layer.style.transform = `translateY(${y * speed}px)`;
        });
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
}

function initAudio() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toggles = document.querySelectorAll('#audio-toggle, #audio-toggle-mobile');
    const audioEl = document.getElementById('ambient-audio');
    if (!toggles.length) return;

    let enabled = localStorage.getItem('acme-audio') !== 'off';
    let armed = false;
    let ambientCtx = null;
    let ambientNodes = null;

    function updateUI() {
        toggles.forEach(t => {
            t.classList.toggle('is-on', enabled);
            t.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            t.title = enabled ? 'Sound on' : 'Sound off';
        });
    }

    function startWebAudioAmbient() {
        if (prefersReduced || ambientNodes) return;
        try {
            ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc1 = ambientCtx.createOscillator();
            const osc2 = ambientCtx.createOscillator();
            const gain = ambientCtx.createGain();
            osc1.type = 'sine';
            osc2.type = 'triangle';
            osc1.frequency.value = 110;
            osc2.frequency.value = 165;
            gain.gain.value = 0.12;
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ambientCtx.destination);
            osc1.start();
            osc2.start();
            ambientNodes = { osc1, osc2, gain };
        } catch (e) { /* silent */ }
    }

    function stopWebAudioAmbient() {
        if (ambientNodes) {
            try {
                ambientNodes.osc1.stop();
                ambientNodes.osc2.stop();
                ambientCtx.close();
            } catch (e) { /* silent */ }
            ambientNodes = null;
            ambientCtx = null;
        }
    }

    function playAmbient() {
        if (!enabled || prefersReduced) return;
        if (audioEl) {
            audioEl.volume = 0.7;
            audioEl.play().catch(() => startWebAudioAmbient());
        } else {
            startWebAudioAmbient();
        }
    }

    function stopAmbient() {
        if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
        stopWebAudioAmbient();
    }

    function armOnInteraction() {
        if (armed) return;
        armed = true;
        if (enabled) playAmbient();
        ['click', 'scroll', 'pointermove', 'keydown'].forEach(ev =>
            document.removeEventListener(ev, armOnInteraction)
        );
    }

    ['click', 'scroll', 'pointermove', 'keydown'].forEach(ev =>
        document.addEventListener(ev, armOnInteraction, { once: false, passive: true })
    );

    updateUI();

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            enabled = !enabled;
            localStorage.setItem('acme-audio', enabled ? 'on' : 'off');
            updateUI();
            if (enabled) {
                armed = true;
                playAmbient();
            } else {
                stopAmbient();
            }
        });
    });

    document.querySelectorAll('[data-sound]').forEach(el => {
        el.addEventListener('click', () => {
            if (!enabled || prefersReduced) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.value = 440;
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } catch (e) { /* silent */ }
        });
    });
}
