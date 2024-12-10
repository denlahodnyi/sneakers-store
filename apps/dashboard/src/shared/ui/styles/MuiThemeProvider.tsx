'use client';

import { ThemeProvider, type Theme } from '@mui/material';
import { useEffect, useState } from 'react';

type MuiThemeProviderProps = {
  getMuiTheme: (opts: { rootElement: Element | null }) => Theme;
} & React.PropsWithChildren;

function MuiThemeProvider(props: MuiThemeProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getRootContainer = () =>
    typeof document !== undefined ? document.getElementById('__next') : null;

  return (
    <ThemeProvider
      theme={props.getMuiTheme({
        rootElement: isMounted ? getRootContainer() : null,
      })}
    >
      {props.children}
    </ThemeProvider>
  );
}

export default MuiThemeProvider;
