// apps/api/src/modules/auth/dtos/reset-password.dto.ts
import { z } from 'zod';

// Regex para CPF (aceita com ou sem máscara, transforma para só números)
const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/;

// Regex para data no formato AAAA-MM-DD
// Simples, não valida dias do mês (ex: 2023-02-30 passaria aqui, mas pode ser refinado se necessário)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const resetPasswordSchema = z.object({
  cpf: z
    .string({
      required_error: 'CPF is required.',
      invalid_type_error: 'CPF must be a string.',
    })
    .regex(cpfRegex, { message: 'Invalid CPF format.' })
    .transform((val) => val.replace(/[^\d]/g, '')),
  dataNascimento: z // O frontend deve enviar como AAAA-MM-DD
    .string({
      required_error: 'Date of birth is required.',
      invalid_type_error: 'Date of birth must be a string.',
    })
    .regex(dateRegex, {
      message: 'Date of birth must be in YYYY-MM-DD format.',
    }),
  primeiroNomeMae: z // Vamos pedir apenas o primeiro nome para simplificar um pouco a comparação
    .string({
      required_error: "Mother's first name is required.",
      invalid_type_error: "Mother's first name must be a string.",
    })
    .min(2, {
      message: "Mother's first name must be at least 2 characters long.",
    })
    .trim(),
  newPassword: z
    .string({
      required_error: 'New password is required.',
      invalid_type_error: 'New password must be a string.',
    })
    .min(6, { message: 'New password must be at least 6 characters long.' }),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
