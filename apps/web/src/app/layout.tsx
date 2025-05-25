import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Contracheque - Viação Pioneira', // Mude o título conforme desejar
  description: 'Acesse seus contracheques de forma fácil e moderna.', // Mude a descrição
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Providers
          attribute='class'
          defaultTheme='dark' // Nosso tema padrão será dark
          enableSystem={false} // Definimos como false para não seguir o sistema, como solicitado
          disableTransitionOnChange
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
