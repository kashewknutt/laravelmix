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

    function updateParallax() {
        const scrollY = window.scrollY;
        layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.parallax) || 0.08;
            layer.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    updateParallax();
}

function initAudio() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toggles = document.querySelectorAll('#audio-toggle, #audio-toggle-mobile');
    if (!toggles.length) return;

    let enabled = localStorage.getItem('acme-audio') === 'on';
    let ctx = null;

    function updateUI() {
        toggles.forEach(toggle => {
            toggle.classList.toggle('is-on', enabled);
            toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            toggle.title = enabled ? 'Sound on' : 'Sound off';
        });
    }

    updateUI();

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            enabled = !enabled;
            localStorage.setItem('acme-audio', enabled ? 'on' : 'off');
            updateUI();
            if (enabled && !prefersReduced) {
                playTone(440, 0.06, 0.08);
            }
        });
    });

    function playTone(freq, duration, volume) {
        if (!enabled || prefersReduced) return;
        try {
            if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* silent fail */ }
    }

    document.querySelectorAll('.cta-magnetic, [data-sound]').forEach(el => {
        el.addEventListener('click', () => playTone(523, 0.05, 0.06));
    });
}
