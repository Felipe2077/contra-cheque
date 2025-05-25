// src/components/paystub/PaystubDashboardClient.tsx
'use client';

import apiClient from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Mantido para o Card principal

import {
  fetchAvailableCompetencies,
  fetchPaystubDetails,
} from '@/lib/api/paystubService';
import { PaystubDetails, PaystubSummary } from '@/types/paystub';

// Novos componentes importados
import { PageFooter } from '@/components/layout/PageFooter'; // Ajuste o caminho se necessário
import { PageHeader } from '@/components/layout/PageHeader'; // Ajuste o caminho se necessário
import { CompetencySelector } from './CompetencySelector';
import { DashboardLoadingScreen } from './DashboardLoadingScreen';
import { PaystubDisplayArea } from './PaystubDisplayArea';
import { PdfActions } from './PdfActions';

export default function PaystubDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [selectedCompetency, setSelectedCompetency] = useState<
    string | undefined
  >(undefined);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthenticating(false);
    }
  }, [router]);

  const { data: competencies, isLoading: isLoadingCompetencies } = useQuery<
    PaystubSummary[],
    Error
  >({
    queryKey: ['availableCompetencies'],
    queryFn: fetchAvailableCompetencies,
    enabled: !isAuthenticating,
    staleTime: 1000 * 60 * 15,
  });

  const {
    data: paystubDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
  } = useQuery<PaystubDetails, Error>({
    queryKey: ['paystubDetails', selectedCompetency],
    queryFn: () => {
      if (!selectedCompetency)
        throw new Error('Nenhuma competência selecionada.');
      return fetchPaystubDetails(selectedCompetency);
    },
    enabled: !!selectedCompetency && !isAuthenticating,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return false;
      if (axios.isAxiosError(error) && error.response?.status === 404)
        return false;
      return failureCount < 1;
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    if (apiClient.defaults.headers.common['Authorization']) {
      delete apiClient.defaults.headers.common['Authorization'];
    }
    queryClient.clear();
    router.push('/login');
  };

  const handleCompetencyChange = (value: string) => {
    setSelectedCompetency(value);
  };

  const handleGeneratePdf = async () => {
    if (!paystubDetails || !selectedCompetency) {
      alert(
        'Por favor, selecione um período e carregue os detalhes do contracheque primeiro.'
      );
      return;
    }

    const elementToPrint = document.getElementById('paycheck-document');
    if (!elementToPrint) {
      alert(
        'Erro: Não foi possível encontrar o conteúdo do contracheque para gerar o PDF.'
      );
      return;
    }

    setIsGeneratingPdf(true);
    const printableElement = elementToPrint.cloneNode(true) as HTMLElement;
    const logoImgElementInClone = printableElement.querySelector(
      '#paycheckCompanyLogo'
    ) as HTMLImageElement;

    if (logoImgElementInClone) {
      console.log(
        '[PDF DEBUG] Logo encontrado no clone para ajuste de tamanho para o PDF.'
      );

      // O componente next/image já deve ter setado o src para o Base64.
      // Vamos ajustar os atributos e estilos para o PDF.
      logoImgElementInClone.setAttribute('width', '100');
      logoImgElementInClone.setAttribute('height', '100');

      // Ajustar também os estilos CSS para garantir o tamanho desejado
      // e como a imagem se comporta dentro dessas dimensões.
      logoImgElementInClone.style.width = '100px';
      logoImgElementInClone.style.height = '100px';
      // Você pode adicionar/ajustar object-fit se necessário:
      // logoImgElementInClone.style.objectFit = 'contain'; // ou 'cover', 'fill', 'scale-down'

      console.log(
        '[PDF DEBUG] Tamanho do logo no clone ajustado para 100x100px para o PDF.'
      );
    } else {
      console.warn(
        '[PDF DEBUG] Logo com ID "paycheckCompanyLogo" não encontrado no clone. Não foi possível ajustar o tamanho para o PDF.'
      );
    }
    // --- FIM DA MODIFICAÇÃO PARA O TAMANHO DO LOGO NO PDF ---
    const htmlContent = printableElement.outerHTML;

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent }),
      });

      if (!response.ok) {
        let errorMessage = `Erro do servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.details || errorMessage;
        } catch (e) {
          /* Ignora erro ao parsear JSON do erro */
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const employeeNameSafe = paystubDetails.header.nomeFunc
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_ ]/g, '')
        .replace(/\s+/g, '_');
      const competencyRefSafe = selectedCompetency.replace(
        /[^a-zA-Z0-9-]/g,
        '_'
      );
      const fileName = `contracheque_${competencyRefSafe}_${employeeNameSafe}.pdf`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erro ao gerar PDF (frontend):', error);
      alert(
        `Ocorreu um erro ao gerar o PDF: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (
    isAuthenticating ||
    (isLoadingCompetencies && !competencies && !isAuthenticating)
  ) {
    return <DashboardLoadingScreen />;
  }

  return (
    <div className='flex min-h-screen flex-col bg-muted/10 print:bg-white'>
      <PageHeader title='Meu Contracheque' onLogout={handleLogout} />

      <main className='flex-grow container mx-auto py-4 px-2 md:p-6 lg:p-8 print:p-0'>
        <Card className='w-full max-w-4xl mx-auto print:shadow-none print:border-none print:rounded-none'>
          <CardHeader className='print:hidden'>
            <CardTitle className='text-2xl'>Bem-vindo(a)!</CardTitle>
            <CardDescription>
              Selecione um período abaixo para visualizar os detalhes do seu
              contracheque.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 print:space-y-0 print:p-0'>
            <CompetencySelector
              competencies={competencies}
              selectedCompetency={selectedCompetency}
              onCompetencyChange={handleCompetencyChange}
              isLoading={isLoadingCompetencies}
            />

            <PdfActions
              onGeneratePdf={handleGeneratePdf}
              isGeneratingPdf={isGeneratingPdf}
              canGenerate={!!(selectedCompetency && paystubDetails)}
            />

            <PaystubDisplayArea
              selectedCompetency={selectedCompetency}
              paystubDetails={paystubDetails}
              isLoadingDetails={isLoadingDetails}
              isDetailsError={isDetailsError}
            />
          </CardContent>
        </Card>
      </main>

      <PageFooter />
    </div>
  );
}
