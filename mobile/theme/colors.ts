/**
 * colors.ts — Design Tokens (Dark-first)
 *
 * PENJELASAN:
 * Semua warna UI ada di sini. Dark mode jadi default
 * karena mayoritas crypto app pakai dark theme.
 * Light mode juga tersedia untuk yang prefer.
 */

export const Colors = {
    dark: {
        background: '#0c1220',
        surface: '#141c2e',
        surface2: '#1c2840',
        surface3: '#243352',
        border: 'rgba(255,255,255,0.06)',
        borderHover: 'rgba(255,255,255,0.12)',
        text: '#e2e8f0',
        textDim: '#94a3b8',
        textMuted: '#64748b',
        accent: '#3b82f6',
        accentGlow: 'rgba(59,130,246,0.15)',
        accentHover: '#2563eb',
        green: '#10b981',
        greenGlow: 'rgba(16,185,129,0.12)',
        red: '#ef4444',
        redGlow: 'rgba(239,68,68,0.12)',
        yellow: '#f59e0b',
        tabBar: '#0c1220',
        tabInactive: '#475569',
    },
    light: {
        background: '#f8fafc',
        surface: '#ffffff',
        surface2: '#f1f5f9',
        surface3: '#e2e8f0',
        border: 'rgba(0,0,0,0.06)',
        borderHover: 'rgba(0,0,0,0.12)',
        text: '#0f172a',
        textDim: '#475569',
        textMuted: '#94a3b8',
        accent: '#3b82f6',
        accentGlow: 'rgba(59,130,246,0.08)',
        accentHover: '#2563eb',
        green: '#10b981',
        greenGlow: 'rgba(16,185,129,0.08)',
        red: '#ef4444',
        redGlow: 'rgba(239,68,68,0.08)',
        yellow: '#f59e0b',
        tabBar: '#ffffff',
        tabInactive: '#94a3b8',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const Radius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 100,
};

export const FontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    hero: 28,
};

export type ThemeMode = 'dark' | 'light';
export type ThemeColors = typeof Colors.dark;
