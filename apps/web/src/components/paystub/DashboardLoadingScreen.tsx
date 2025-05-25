// src/components/paystub/DashboardLoadingScreen.tsx
'use client';

import { Loader2 } from 'lucide-react';

export function DashboardLoadingScreen() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-muted/40'>
      <Loader2 className='h-12 w-12 animate-spin text-primary' />
      <p className='mt-4 text-lg text-muted-foreground'>Carregando...</p>
    </div>
  );
}
