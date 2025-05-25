// src/lib/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT a cada requisição
apiClient.interceptors.request.use(
  (config) => {
    // Não precisamos adicionar o token para a rota de login
    if (config.url === '/auth/login') {
      return config;
    }

    const token = localStorage.getItem('authToken');
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
  (response) => response, // Simplesmente retorna a resposta se for bem-sucedida
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // Se o erro for 401 (Não Autorizado), pode ser token expirado ou inválido.
        // Limpa o token e redireciona para o login.
        // Evitar redirecionamento aqui se for a própria página de login que causou o 401
        // ou se for uma tentativa de refresh de token (não implementado ainda).

        // Verifique se a requisição original NÃO era para /auth/login
        // para evitar loops de redirecionamento se o login falhar com 401.
        const originalRequestUrl = error.config?.url;
        const isLoginAttempt = originalRequestUrl?.endsWith('/auth/login');

        if (!isLoginAttempt) {
          console.warn(
            'Token inválido ou expirado. Redirecionando para login.'
          );
          localStorage.removeItem('authToken');
          // Redirecionar para a página de login
          // Usar window.location para redirecionamento fora de componentes React
          // ou implementar uma lógica mais sofisticada com um contexto de autenticação.
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
