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
            paper: '#FDFBF7',
            surface: {
                DEFAULT: '#FFFFFF',
                sand: '#F6F0E8',
                muted: '#FAF8F5',
            },
            ink: {
                DEFAULT: '#211C2B',
                muted: '#6A6475',
                faint: '#A8A2B2',
            },
            clay: {
                DEFAULT: '#C2614A',
                soft: '#F3DDD4',
                dark: '#A04E3A',
            },
            blush: '#F7DCE2',
            sage: '#DDEBDD',
            sky: '#DAE6F2',
            butter: '#F6E7C4',
            lilac: '#E7E0F4',
            error: {
                DEFAULT: '#C2614A',
                light: '#F3DDD4',
            },
            white: '#FFFFFF',
            black: '#000000',
            transparent: 'transparent',
        },
        fontFamily: {
            display: ['Fraunces', 'Georgia', 'serif'],
            body: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        },
        extend: {
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            animation: {
                fadeUp: 'fadeUp 0.8s ease-out forwards',
                fadeIn: 'fadeIn 0.6s ease-out forwards',
                float: 'float 10s ease-in-out infinite',
                floatSlow: 'floatSlow 14s ease-in-out infinite',
                marquee: 'marquee 35s linear infinite',
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
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-16px)' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(1deg)' },
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
                soft: '0 1px 3px rgba(33, 28, 43, 0.04)',
                card: '0 4px 20px rgba(33, 28, 43, 0.06)',
                lift: '0 8px 30px rgba(33, 28, 43, 0.08)',
                offset: '4px 4px 0 rgba(33, 28, 43, 0.06)',
            },
        },
    },
};
