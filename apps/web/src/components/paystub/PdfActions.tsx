// src/components/paystub/PdfActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface PdfActionsProps {
  onGeneratePdf: () => void;
  isGeneratingPdf: boolean;
  canGenerate: boolean; // Para controlar se o botão deve estar habilitado (ex: paystubDetails existe)
}

export function PdfActions({
  onGeneratePdf,
  isGeneratingPdf,
  canGenerate,
}: PdfActionsProps) {
  if (!canGenerate) {
    // Não renderiza o botão se não puder gerar
    return null;
  }

  return (
    <Button
      onClick={onGeneratePdf}
      size='sm'
      disabled={isGeneratingPdf}
      className='print:hidden mt-4 mx-4'
    >
      {isGeneratingPdf ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className='mr-2 h-4 w-4' />
          Gerar PDF do Período
        </>
      )}
    </Button>
  );
}
