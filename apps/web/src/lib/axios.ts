import axios from 'axios';

const apiClient = axios.create({
  // IMPORTANTE: Use a URL correta da API
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'http://contrachequeapi.vpioneira.com.br:3334/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // CRUCIAL: Adicione withCredentials para funcionar com CORS
  withCredentials: true,
});

// Rotas que não devem receber o token JWT
const PUBLIC_ROUTES = ['/auth/login', '/auth/reset-password', '/users']; // Adicionei /users que também é público

// Interceptor para adicionar o token JWT a cada requisição
apiClient.interceptors.request.use(
  (config) => {
    // Log para debug (remova em produção)
    console.log('Request:', config.method?.toUpperCase(), config.url);

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
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com erros globais
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log para debug (remova em produção)
    console.error(
      'Response Error:',
      error.response?.status,
      error.response?.data
    );

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
