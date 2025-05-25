import { z } from 'zod';

// Função simples para validar formato de CPF (sem verificar dígitos verificadores aqui por simplicidade)
// Para uma validação robusta de CPF (incluindo dígitos), use uma lib como 'cpf-cnpj-validator' ou crie uma função mais completa.
const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/; // Aceita com ou sem pontos/traço

export const createUserSchema = z.object({
  cpf: z
    .string()
    .regex(cpfRegex, { message: 'Invalid CPF format' })
    .transform((val) => val.replace(/[^\d]/g, '')), // Normaliza removendo não-dígitos
  email: z.string().email({ message: 'Invalid email address' }).optional(), // Email agora é opcional
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  // Adicione outros campos se necessário, ex: role, matricula
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
