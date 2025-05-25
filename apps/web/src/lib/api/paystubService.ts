// src/lib/api/paystubService.ts
import apiClient from '@/lib/axios'; // Seu apiClient existente
import {
  PaystubDetails,
  PaystubsListApiResponse,
  PaystubSummary,
} from '@/types/paystub';

export const fetchAvailableCompetencies = async (): Promise<
  PaystubSummary[]
> => {
  const { data } = await apiClient.get<PaystubsListApiResponse>('/paystubs', {
    params: { page: 1, limit: 100 }, // Considerar paginação se houver muitas competências
  });
  return data.data;
};

export const fetchPaystubDetails = async (
  refMesAno: string
): Promise<PaystubDetails> => {
  const encodedRef = encodeURIComponent(refMesAno);
  const { data } = await apiClient.get<PaystubDetails>(
    `/paystubs/details/${encodedRef}`
  );
  return data;
};
