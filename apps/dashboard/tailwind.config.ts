import type { Config } from 'tailwindcss';

const config: Config = {
  corePlugins: {
    preflight: false,
  },
  important: '#__next',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
      },
    },
  },
  plugins: [],
};

export default config;
