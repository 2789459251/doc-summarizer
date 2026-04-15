/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            /* ===== 橙色主题色阶 ===== */
            colors: {
                primary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                /* 粉色（用于白天模式强调文字） */
                pink: {
                    accent: '#ec4899',   /* pink-500 */
                    light: '#f9a8d4',     /* pink-200 */
                    dark: '#be185d',      /* pink-700 */
                },
                surface: {
                    dark: {
                        DEFAULT: '#0a0a0f',
                        secondary: '#111118',
                        elevated: '#18181f',
                        overlay: '#1e1e28',
                        hover: '#252530',
                    },
                    light: {
                        DEFAULT: '#ffffff',
                        secondary: '#fafaf9',
                        elevated: '#ffffff',
                        overlay: '#fff7ed',
                        hover: '#fef3c7',
                    },
                },
            },

            /* ===== 排版系统 ===== */
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 
                       'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans SC', 'sans-serif'],
            },
            fontSize: {
                /* 排版比例尺：12 14 16 18 24 32 48 */
                'base': ['1rem', { lineHeight: '1.6' }],
                'lg': ['1.125rem', { lineHeight: '1.5' }],
                'xl': ['1.25rem', { lineHeight: '1.4' }],
                '2xl': ['1.5rem', { lineHeight: '1.35' }],
                '3xl': ['2rem', { lineHeight: '1.3' }],
            },

            /* ===== 间距系统（4pt 基础） ===== */
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },

            /* ===== 圆角统一 ===== */
            borderRadius: {
                'sm': '6px',
                'DEFAULT': '10px',
                'md': '12px',
                'lg': '16px',
                'xl': '20px',
                '2xl': '24px',
                'full': '9999px',
            },

            /* ===== 阴影层级（一致的 elevation） ===== */
            boxShadow: {
                'sm': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                'DEFAULT': '0 4px 14px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
                'md': '0 8px 30px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04)',
                'lg': '0 14px 40px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(0, 0, 0, 0.05)',
                'xl': '0 25px 60px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.06)',
                'orange': '0 4px 14px rgba(249, 115, 22, 0.35)',
                'orange-lg': '0 8px 28px rgba(249, 115, 22, 0.25)',
                'inner-sm': 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
                'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
            },

            /* ===== 过渡动画 ===== */
            transitionDuration: {
                'fast': '150ms',
                'normal': '250ms',
                'slow': '350ms',
            },
            transitionTimingFunction: {
                'out': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },

            /* ===== 动画 ===== */
            animation: {
                'fade-in': 'fadeIn 250ms ease-out',
                'slide-up': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-in-right': 'slideInRight 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                'shimmer': 'shimmer 1.5s infinite',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.65' },
                },
            },

            /* ===== Z-index 层级管理 ===== */
            zIndex: {
                'base': '0',
                'dropdown': '10',
                'sticky': '20',
                'fixed': '30',
                'modal-backdrop': '40',
                'modal': '50',
                'popover': '60',
                'tooltip': '70',
                'toast': '80',
                'max': '100',
            },

            /* ===== 背景模糊 ===== */
            backdropBlur: {
                'sm': '4px',
            },

            /* ===== 断点（Mobile-first） ===== */
            screens: {
                'sm': '375px',      /* 小手机 */
                'md': '768px',      /* 平板竖屏 */
                'lg': '1024px',     /* 平板横屏/小笔记本 */
                'xl': '1280px',     /* 桌面 */
                '2xl': '1440px',    /* 大屏桌面 */
            },
        },
    },
    plugins: [],
}
