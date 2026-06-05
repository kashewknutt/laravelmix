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

const FADE_IN_SEC = 3;
const FADE_OUT_SEC = 2;
const TARGET_GAIN = 0.032;

function createAmbientEngine(ctx) {
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 900;
    tone.Q.value = 0.5;
    tone.connect(master);

    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.42;
    const delayMix = ctx.createGain();
    delayMix.gain.value = 0.22;
    delay.connect(delayMix);
    delayMix.connect(tone);
    delayMix.connect(delay);

    const padBus = ctx.createGain();
    padBus.gain.value = 0.11;
    padBus.connect(tone);
    padBus.connect(delay);

    const arpBus = ctx.createGain();
    arpBus.gain.value = 0.14;
    arpBus.connect(tone);
    arpBus.connect(delay);

    // A minor — warm, consonant pad + slow pentatonic arpeggio
    const padFreqs = [220.0, 261.63, 329.63, 440.0];
    const arpPattern = [220, 261.63, 329.63, 392, 440, 523.25, 440, 392, 329.63, 261.63];
    const arpStepMs = 750;

    let padOscs = [];
    let arpTimer = null;
    let arpStep = 0;
    let running = false;
    let stopping = false;

    function startPad() {
        padOscs = padFreqs.map((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.detune.value = (i - 1.5) * 3;
            osc.connect(padBus);
            osc.start();
            return osc;
        });
    }

    function stopPad() {
        padOscs.forEach(osc => {
            try { osc.stop(); } catch (e) { /* already stopped */ }
        });
        padOscs = [];
    }

    function playArpNote(freq) {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.55, t + 0.12);
        env.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        osc.connect(env);
        env.connect(arpBus);
        osc.start(t);
        osc.stop(t + 1.15);
    }

    function scheduleArp() {
        playArpNote(arpPattern[arpStep % arpPattern.length]);
        arpStep++;
        arpTimer = setTimeout(scheduleArp, arpStepMs);
    }

    function fadeTo(value, duration) {
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(value, t + duration);
    }

    return {
        master,
        fadeIn() { fadeTo(TARGET_GAIN, FADE_IN_SEC); },
        fadeOut() {
            fadeTo(0, FADE_OUT_SEC);
            return new Promise(resolve => setTimeout(resolve, FADE_OUT_SEC * 1000 + 80));
        },
        start() {
            if (running || stopping) return;
            running = true;
            startPad();
            arpStep = 0;
            scheduleArp();
            this.fadeIn();
        },
        async stop() {
            if (!running || stopping) return;
            stopping = true;
            running = false;
            clearTimeout(arpTimer);
            arpTimer = null;
            await this.fadeOut();
            stopPad();
            stopping = false;
        },
    };
}

function initAudio() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toggles = document.querySelectorAll('#audio-toggle, #audio-toggle-mobile');
    const audioEl = document.getElementById('ambient-audio');
    if (!toggles.length) return;

    let enabled = localStorage.getItem('acme-audio') !== 'off';
    let armed = false;
    let ambientCtx = null;
    let ambientEngine = null;
    let mediaSource = null;
    let usingMediaElement = false;

    function ensureContext() {
        if (!ambientCtx) {
            ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
            ambientEngine = createAmbientEngine(ambientCtx);
        }
        if (ambientCtx.state === 'suspended') {
            ambientCtx.resume();
        }
    }

    function setupMediaElement() {
        if (!audioEl || mediaSource) return false;
        try {
            mediaSource = ambientCtx.createMediaElementSource(audioEl);
            mediaSource.connect(ambientEngine.master);
            audioEl.loop = true;
            usingMediaElement = true;
            return true;
        } catch (e) {
            return false;
        }
    }

    function updateUI() {
        toggles.forEach(t => {
            t.classList.toggle('is-on', enabled);
            t.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            t.title = enabled ? 'Sound on' : 'Sound off';
        });
    }

    async function playAmbient() {
        if (!enabled || prefersReduced) return;
        ensureContext();

        if (audioEl && audioEl.src) {
            setupMediaElement();
            try {
                await audioEl.play();
                ambientEngine.start();
                return;
            } catch (e) {
                usingMediaElement = false;
            }
        }

        ambientEngine.start();
    }

    async function stopAmbient() {
        if (usingMediaElement && audioEl) {
            await ambientEngine.stop();
            audioEl.pause();
            try { audioEl.currentTime = 0; } catch (e) { /* silent */ }
            usingMediaElement = false;
            return;
        }
        if (ambientEngine) {
            await ambientEngine.stop();
        }
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
                ensureContext();
                const t = ambientCtx.currentTime;
                const osc = ambientCtx.createOscillator();
                const env = ambientCtx.createGain();
                osc.type = 'sine';
                osc.frequency.value = 523.25;
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(0.04, t + 0.02);
                env.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                osc.connect(env);
                env.connect(ambientCtx.destination);
                osc.start(t);
                osc.stop(t + 0.36);
            } catch (e) { /* silent */ }
        });
    });
}
