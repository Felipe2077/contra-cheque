// src/lib/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rotas que não devem receber o token JWT
const PUBLIC_ROUTES = ['/auth/login', '/auth/reset-password'];

// Interceptor para adicionar o token JWT a cada requisição
apiClient.interceptors.request.use(
  (config) => {
    // Não precisamos adicionar o token para rotas públicas
    if (config.url && PUBLIC_ROUTES.includes(config.url)) {
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
    return Promise.reject(error);
  }
);

// Opcional: Interceptor de resposta para lidar com erros globais (ex: token expirado -> logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        const originalRequestUrl = error.config?.url;
        // Evitar loop se o erro 401 for de uma rota pública que não deveria ter token
        const isPublicRouteAttempt =
          originalRequestUrl && PUBLIC_ROUTES.includes(originalRequestUrl);

        if (!isPublicRouteAttempt) {
          console.warn(
            'Token inválido ou expirado. Redirecionando para login.'
          );
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            window.location.href = '/login'; // Ou uma navegação mais elegante
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
