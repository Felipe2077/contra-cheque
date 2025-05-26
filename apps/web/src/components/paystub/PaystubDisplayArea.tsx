// src/components/paystub/PaystubDisplayArea.tsx
'use client';

import { PaystubDetails } from '@/types/paystub';
import { Info, Loader2 } from 'lucide-react';
import { PaystubDocument } from './PaystubDocument'; // Já existente

interface PaystubDisplayAreaProps {
  selectedCompetency: string | undefined;
  paystubDetails: PaystubDetails | undefined;
  isLoadingDetails: boolean;
  isDetailsError: boolean;
  // Você poderia passar a mensagem de erro também se quisesse exibi-la
}

export function PaystubDisplayArea({
  selectedCompetency,
  paystubDetails,
  isLoadingDetails,
  isDetailsError,
}: PaystubDisplayAreaProps) {
  return (
    <div
      id='paystub-details-render-area'
      className='pt-6 mt-6 print:pt-0 print:mt-0 '
    >
      {isLoadingDetails && selectedCompetency && (
        <div className='text-center py-8 print:hidden'>
          <Loader2 className='mx-auto h-10 w-10 animate-spin text-primary mb-3' />
          <p className='text-muted-foreground'>
            Carregando detalhes para {selectedCompetency}...
          </p>
        </div>
      )}

      {isDetailsError && selectedCompetency && (
        <div className='text-center py-8 bg-destructive/10 p-4 rounded-md print:hidden'>
          <Info className='mx-auto h-10 w-10 text-destructive mb-2' />
          <p className='font-semibold text-destructive'>
            Erro ao carregar detalhes.
          </p>
          <p className='text-sm text-destructive/80'>
            Não foi possível buscar as informações para {selectedCompetency}.
            Tente novamente mais tarde.
          </p>
        </div>
      )}

      {!isLoadingDetails &&
        !isDetailsError &&
        paystubDetails &&
        selectedCompetency && <PaystubDocument details={paystubDetails} />}

      {!selectedCompetency &&
        !isLoadingDetails && ( // Mostrar se nenhuma competência selecionada
          <div className='text-center py-8 print:hidden'>
            <Info className='mx-auto h-12 w-12 text-muted-foreground/50 mb-3' />
            <p className='text-muted-foreground'>
              Escolha um período acima para exibir seu contracheque.
            </p>
          </div>
        )}
    </div>
  );
}
