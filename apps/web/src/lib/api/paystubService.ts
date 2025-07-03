import apiClient from '@/lib/axios';
import {
  PaystubDetails,
  PaystubsListApiResponse,
  PaystubSummary,
} from '@/types/paystub';

export const fetchAvailableCompetencies = async (): Promise<
  PaystubSummary[]
> => {
  const { data } = await apiClient.get<PaystubsListApiResponse>('/paystubs', {
    params: { page: 1, limit: 100 },
  });
  return data.data;
};

// 🔧 CORREÇÃO: Usar query parameter em vez de path parameter
export const fetchPaystubDetails = async (
  refMesAno: string
): Promise<PaystubDetails> => {
  console.log('Fetching paystub details for:', refMesAno); // Debug log

  const { data } = await apiClient.get<PaystubDetails>('/paystubs/details', {
    params: { refMesAno }, // Axios automaticamente codifica query params
  });
  return data;
};
