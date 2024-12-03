'use client';

import { createTheme } from '@mui/material/styles';

import { geistSans } from './fonts';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    '2xl': true;
  }
}

const getTheme = (options: { rootElement?: Element | null }) =>
  createTheme({
    cssVariables: {
      cssVarPrefix: '',
    },
    typography: {
      fontFamily: geistSans.style.fontFamily,
    },
    // Sync with Tailwind spacing
    spacing: (factor: number) => `${0.25 * factor}rem`,
    shape: {
      borderRadius: 8,
    },
    breakpoints: {
      // Sync with Tailwind breakpoints
      values: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      },
    },
    palette: {
      // Tailwind should see mui palette colors using generated css variables
      primary: {
        main: '#5139AD',
        // Other colors will be calculated automatically
      },
      secondary: {
        main: '#D56784',
      },
    },
    components: {
      MuiPopover: {
        defaultProps: {
          container: options.rootElement,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: options.rootElement,
        },
      },
      MuiDialog: {
        defaultProps: {
          container: options.rootElement,
        },
      },
      MuiModal: {
        defaultProps: {
          container: options.rootElement,
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'initial',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            // double ampersand to increase specificity and override default
            '&&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px #EAF1FF inset',
              WebkitTextFillColor: '#000',
              caretColor: 'initial',
            },
          },
        },
      },
    },
  });

export default getTheme;
