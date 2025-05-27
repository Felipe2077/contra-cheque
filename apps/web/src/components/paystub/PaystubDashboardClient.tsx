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

export default function PaystubDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [selectedCompetency, setSelectedCompetency] = useState<
    string | undefined
  >(undefined);

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

  if (
    isAuthenticating ||
    (isLoadingCompetencies && !competencies && !isAuthenticating)
  ) {
    return <DashboardLoadingScreen />;
  }

  return (
    <div className='flex min-h-screen flex-col bg-muted/10 print:bg-white'>
      <PageHeader title='Demonstrativo de Pagamento' onLogout={handleLogout} />
      <main className='flex-grow container mx-auto py-4 px-2 md:p-6 lg:p-8 print:p-0'>
        <Card className='w-full max-w-4xl mx-auto print:shadow-none print:border-none print:rounded-none'>
          <CardHeader className='print:hidden'>
            <CardTitle className='text-2xl'>Bem-vindo(a)!</CardTitle>
            <CardDescription>
              Selecione um período abaixo para visualizar os detalhes do seu
              contracheque.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 print:space-y-0 print:p-0 p-1'>
            <CompetencySelector
              competencies={competencies}
              selectedCompetency={selectedCompetency}
              onCompetencyChange={handleCompetencyChange}
              isLoading={isLoadingCompetencies}
              paystubDetails={paystubDetails}
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
