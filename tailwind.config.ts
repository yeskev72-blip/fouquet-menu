import type { Config } from 'tailwindcss'

/**
 * Les couleurs pointent vers les variables de src/styles/tokens.css :
 * changer de thème ne change que les variables, jamais les classes.
 * Les échelles d'espacement, de rayon et de typo sont volontairement
 * fermées sur les valeurs du design system.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: 'var(--fonte-bg)',
      surface: 'var(--fonte-surface)',
      field: 'var(--fonte-field)',
      border: 'var(--fonte-border)',
      text: 'var(--fonte-text)',
      muted: 'var(--fonte-muted)',
      faint: 'var(--fonte-faint)',
      accent: {
        DEFAULT: 'var(--fonte-accent)',
        pressed: 'var(--fonte-accent-pressed)',
        text: 'var(--fonte-accent-text)',
        soft: 'var(--fonte-accent-soft)',
        'soft-border': 'var(--fonte-accent-soft-border)',
      },
      'on-accent': 'var(--fonte-on-accent)',
      ok: {
        DEFAULT: 'var(--fonte-ok)',
        soft: 'var(--fonte-ok-soft)',
      },
      'on-ok': 'var(--fonte-on-ok)',
      'chart-line': 'var(--fonte-chart-line)',
    },
    spacing: {
      0: '0px',
      px: '1px',
      0.5: '2px',
      0.75: '3px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      13: '52px',
      14: '56px',
      15: '60px',
      16: '64px',
      18: '72px',
      19: '76px',
      24: '96px',
      25: '100px',
    },
    borderRadius: {
      none: '0px',
      badge: '8px',
      field: '10px',
      btn: '12px',
      ctl: '14px',
      card: '16px',
      section: '20px',
      xcard: '24px',
      pill: '9999px',
      full: '9999px',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['"Barlow Condensed"', 'sans-serif'],
    },
    fontSize: {
      cap: ['11px', '14px'],
      legend: ['12px', '16px'],
      sm: ['13px', '18px'],
      base: ['14px', '20px'],
      md: ['15px', '20px'],
      lg: ['16px', '24px'],
      xl: ['17px', '22px'],
      '2xl': ['18px', '24px'],
      'd-sm': ['26px', '28px'],
      'd-md': ['28px', '30px'],
      'd-lg': ['30px', '32px'],
      'd-xl': ['34px', '36px'],
      'd-2xl': ['36px', '40px'],
      'd-3xl': ['38px', '40px'],
      'd-4xl': ['40px', '44px'],
      'd-5xl': ['46px', '48px'],
      'd-6xl': ['56px', '56px'],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      normal: '0',
      wide: '0.06em',
      wider: '0.08em',
      widest: '0.1em',
    },
    borderWidth: { 0: '0px', DEFAULT: '1px', 2: '2px' },
    extend: {
      // Les hauteurs de composants reprennent l'échelle d'espacement,
      // plus « touch » : 48 px, la zone tactile plancher du design system.
      minHeight: ({ theme }) => ({ ...theme('spacing'), touch: '48px' }),
      minWidth: ({ theme }) => ({ ...theme('spacing'), touch: '48px' }),
      height: ({ theme }) => ({ ...theme('spacing') }),
      width: ({ theme }) => ({ ...theme('spacing') }),
      transitionDuration: { fast: '120ms' },
      keyframes: {
        'pr-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pr-pop': 'pr-pop 320ms ease-out',
        'fade-up': 'fade-up 200ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
