import type { Config } from 'tailwindcss';

const config: Config = {
  corePlugins: {
    preflight: false,
  },
  important: '#__next',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/widgets/**/*.{js,ts,jsx,tsx,mdx}',
    './src/entities/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      'geist-sans': 'var(--font-geist-sans)',
      'geist-mono': 'var(--font-geist-mono)',
    },
    extend: {
      colors: {
        background: 'rgb(var(--palette-common-backgroundChannel))',
        main: 'rgb(var(--palette-primary-mainChannel))',
        secondary: 'rgb(var(--palette-secondary-mainChannel))',
        error: 'rgb(var(--palette-error-mainChannel))',
      },
    },
  },
  plugins: [],
};

export default config;
