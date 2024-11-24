import type { Metadata } from 'next';

import './globals.css';
import { Toaster } from '~/shared/ui';
import { satoshi } from './_app/fonts';

export const metadata: Metadata = {
  title: 'Store',
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
      <body className={`${satoshi.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
