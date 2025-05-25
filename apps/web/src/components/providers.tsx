// src/components/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Use React.ComponentProps para obter os tipos de props do NextThemesProvider
// e adicione `children` explicitamente, já que o estamos definindo.
interface CustomThemeProviderProps
  extends React.ComponentProps<typeof NextThemesProvider> {
  children: React.ReactNode;
}

export function Providers({ children, ...props }: CustomThemeProviderProps) {
  // Use o tipo corrigido aqui
  return (
    <NextThemesProvider {...props}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
