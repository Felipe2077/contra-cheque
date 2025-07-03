// apps/web/src/lib/axios.ts - Configuração atualizada

import axios from 'axios';

const apiClient = axios.create({
  // URL da API
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://contrachequeapi.vpioneira.com.br/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // REMOVER withCredentials temporariamente para testar
  // withCredentials: true,

  // Adicionar timeout para evitar requests que ficam pendentes
  timeout: 30000, // 30 segundos
});

// Rotas que não devem receber o token JWT
const PUBLIC_ROUTES = ['/auth/login', '/auth/reset-password', '/users'];

// Interceptor para adicionar o token JWT a cada requisição
apiClient.interceptors.request.use(
  (config) => {
    // Log para debug (mantenha temporariamente)
    console.log('Request:', config.method?.toUpperCase(), config.url);
    console.log('Base URL:', config.baseURL);

    // Não precisamos adicionar o token para rotas públicas
    if (
      config.url &&
      PUBLIC_ROUTES.some((route) => config.url!.includes(route))
    ) {
      return config;
    }

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com erros globais
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Log detalhado para debug
    console.error('Response Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        const originalRequestUrl = error.config?.url;
        const isPublicRouteAttempt =
          originalRequestUrl &&
          PUBLIC_ROUTES.some((route) => originalRequestUrl.includes(route));

        if (!isPublicRouteAttempt) {
          console.warn(
            'Token inválido ou expirado. Redirecionando para login.'
          );
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
