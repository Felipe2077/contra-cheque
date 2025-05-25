// src/lib/api/authService.ts
import axios from 'axios';
import { z } from 'zod';
import apiClient from '../axios'; // Sua instância configurada do Axios

// Schema de validação para os dados de reset de senha no frontend
// (a validação principal e mais robusta ocorre no backend)
export const resetPasswordFrontendSchema = z.object({
  cpf: z.string().transform((val) => val.replace(/\D/g, '')), // Normaliza CPF removendo não dígitos
  dataNascimento: z.string(), // Espera-se "AAAA-MM-DD"
  primeiroNomeMae: z.string().trim(), // Remove espaços em branco extras
  newPassword: z.string(),
});

export type ResetPasswordPayload = z.infer<typeof resetPasswordFrontendSchema>;

// Interface para o erro esperado da API em caso de falha
// (corresponde ao que o backend retorna em AppError com detalhes)
export interface ApiErrorResponse {
  message: string;
  statusCode?: number; // Opcional, pois o status HTTP já informa
  errors?: {
    [key: string]: string[] | undefined;
    // Podemos adicionar campos específicos se quisermos tipagem mais forte para erros de validação
    // cpf?: string[];
    // dataNascimento?: string[];
    // etc.
  };
}

// Schema e Tipo para Cadastro
export const registerUserFrontendSchema = z.object({
  cracha: z.string().min(1, 'Crachá é obrigatório.'), // Adicionar validação de formato se houver (ex: apenas números, tamanho exato)
  cpf: z.string().transform((val) => val.replace(/\D/g, '')), // Normaliza CPF
  email: z.string().email('Formato de email inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'), // Ajuste o mínimo se a API exigir mais
});
export type RegisterUserPayload = z.infer<typeof registerUserFrontendSchema>;

// Tipo para a resposta de sucesso do cadastro
export interface RegisterUserResponse {
  id: string;
  cpf: string;
  cracha: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  /**
   * Solicita a redefinição de senha.
   * @param payload Os dados para redefinição de senha.
   * @returns Uma promessa que resolve se bem-sucedido (void para 204).
   * @throws ApiErrorResponse em caso de erro da API.
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    try {
      // O payload já deve vir validado e transformado pelo react-hook-form com Zod no componente
      await apiClient.post('/auth/reset-password', payload);
      // Em caso de sucesso (204 No Content), não há corpo de resposta.
      return;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // Repassa o objeto de erro da API (que deve conter message e opcionalmente errors)
        throw error.response.data as ApiErrorResponse;
      }
      // Para erros de rede ou outros erros inesperados
      throw {
        message:
          'Não foi possível conectar ao servidor. Verifique sua conexão.',
      } as ApiErrorResponse;
    }
  },

  /**
   * Registra um novo usuário.
   * @param payload Os dados para registro do usuário.
   * @returns Uma promessa que resolve com os dados do usuário registrado.
   * @throws ApiErrorResponse em caso de erro da API.
   */
  registerUser: async (
    payload: RegisterUserPayload
  ): Promise<RegisterUserResponse> => {
    try {
      // O payload já deve vir validado e transformado pelo react-hook-form com Zod no componente
      const response = await apiClient.post<RegisterUserResponse>(
        '/users',
        payload
      );
      return response.data; // Backend retorna 201 com o usuário criado
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // Repassa o objeto de erro da API
        throw error.response.data as ApiErrorResponse;
      }
      // Para erros de rede ou outros erros inesperados
      throw {
        message:
          'Não foi possível conectar ao servidor. Verifique sua conexão.',
      } as ApiErrorResponse;
    }
  },
};
