import type { Metadata } from 'next';
import './globals.css';

import { geistMono, geistSans } from './_app/fonts';
import { MuiRootProvider } from './_app/providers';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Use suppressHydrationWarning to prevent browser extensions from causing hydration mismatch
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="__next">
          <MuiRootProvider>{children}</MuiRootProvider>
        </div>
      </body>
    </html>
  );
}
