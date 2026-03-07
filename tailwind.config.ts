import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#0a0a0a',
        primary: '#0066cc',
        'primary-dark': '#0052a3',
        secondary: '#666666',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        border: '#e5e7eb',
        muted: '#f3f4f6',
      },
      spacing: {
        '4.5': '1.125rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
