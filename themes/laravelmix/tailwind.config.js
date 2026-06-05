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
            surface: {
                DEFAULT: '#FFFFFF',
                muted: '#F8FAFC',
                subtle: '#F1F5F9',
            },
            ink: {
                DEFAULT: '#0F172A',
                muted: '#64748B',
                faint: '#94A3B8',
            },
            accent: {
                DEFAULT: '#6366F1',
                light: '#EEF2FF',
                dark: '#4338CA',
            },
            error: {
                DEFAULT: '#EF4444',
                light: '#FEE2E2',
            },
            white: '#FFFFFF',
            black: '#000000',
            transparent: 'transparent',
        },
        fontFamily: {
            body: ['Poppins', 'sans-serif'],
            display: ['Poppins', 'sans-serif'],
        },
        extend: {
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            animation: {
                fadeUp: 'fadeUp 0.6s ease-out forwards',
                fadeIn: 'fadeIn 0.5s ease-out forwards',
                slideIn: 'slideIn 0.5s ease-out forwards',
                shake: 'shake 0.4s ease-in-out',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateX(-12px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-6px)' },
                    '75%': { transform: 'translateX(6px)' },
                },
            },
            boxShadow: {
                soft: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
                card: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
            },
        },
    },
};
