// src/components/layout/PageFooter.tsx
// (Também em 'layout' para possível reutilização)
'use client';

export function PageFooter() {
  return (
    <footer className='border-t bg-background/80 backdrop-blur-sm print:hidden'>
      <div className='container mx-auto py-4 px-4 md:px-6 text-center text-xs text-muted-foreground'>
        © {new Date().getFullYear()} Seu Portal de Contracheques. Viação
        Pioneira - Todos os direitos reservados.
      </div>
    </footer>
  );
}
