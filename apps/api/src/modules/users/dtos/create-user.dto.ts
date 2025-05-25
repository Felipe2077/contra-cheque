// apps/api/src/modules/users/dtos/create-user.dto.ts
import { z } from 'zod';

// Função simples para validar formato de CPF (sem verificar dígitos verificadores aqui por simplicidade)
// Para uma validação robusta de CPF (incluindo dígitos), use uma lib como 'cpf-cnpj-validator' ou crie uma função mais completa.
const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/; // Aceita com ou sem pontos/traço

export const createUserSchema = z.object({
  cpf: z
    .string({
      required_error: 'CPF is required.',
      invalid_type_error: 'CPF must be a string.',
    })
    .regex(cpfRegex, { message: 'Invalid CPF format.' })
    .transform((val) => val.replace(/[^\d]/g, '')), // Normaliza removendo não-dígitos
  cracha: z // <<< ALTERADO DE 'name' PARA 'cracha'
    .string({
      required_error: 'Crachá is required.',
      invalid_type_error: 'Crachá must be a string.',
    })
    .min(1, { message: 'Crachá must be at least 1 character long.' }), // Ajuste a validação se necessário
  email: z
    .string({
      invalid_type_error: 'Email must be a string.',
    })
    .email({ message: 'Invalid email address.' })
    .optional()
    .nullable(), // Email é opcional e pode ser explicitamente nulo
  password: z
    .string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    })
    .min(6, { message: 'Password must be at least 6 characters long.' }),
  // Adicione outros campos se necessário, ex: role
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
