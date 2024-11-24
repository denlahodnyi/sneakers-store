import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { PropsWithChildren } from 'react';

import { MuiThemeProvider } from '~/shared/ui/styles';
import getTheme from '../theme';

function MuiRootProvider({ children }: PropsWithChildren) {
  return (
    <AppRouterCacheProvider
      options={{ enableCssLayer: true, key: 'mui', prepend: true }}
    >
      <CssBaseline />
      <MuiThemeProvider getMuiTheme={getTheme}>{children}</MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

export default MuiRootProvider;
