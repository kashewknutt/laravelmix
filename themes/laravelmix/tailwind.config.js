module.exports = {
    purge: [
        './assets/src/**/*.vue',
        './layouts/**/*.htm',
        './pages/**/*.htm',
        './partials/**/*.htm',
    ],
    plugins: [],
    theme: {
        colors: {
            bg: 'var(--bg)',
            surface: 'var(--surface)',
            'surface-2': 'var(--surface-2)',
            fg: 'var(--fg)',
            muted: 'var(--muted)',
            border: 'var(--border)',
            accent: 'var(--accent)',
            'accent-fg': 'var(--accent-fg)',
            error: '#EF4444',
            white: '#FFFFFF',
            black: '#000000',
            transparent: 'transparent',
        },
        fontFamily: {
            display: ['Bricolage Grotesque', 'sans-serif'],
            body: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        },
        extend: {
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            animation: {
                fadeUp: 'fadeUp 0.7s ease-out forwards',
                fadeIn: 'fadeIn 0.5s ease-out forwards',
                marquee: 'marquee 32s linear infinite',
                shake: 'shake 0.4s ease-in-out',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
            },
            boxShadow: {
                soft: '0 1px 3px rgba(0, 0, 0, 0.12)',
                card: '0 4px 0 var(--border)',
                lift: '0 8px 0 var(--border)',
            },
        },
    },
};
