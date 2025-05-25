import { z } from 'zod';

// const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/;

export const updateUserSchema = z.object({
  // Geralmente CPF não é atualizado, mas se for permitido:
  // cpf: z.string().regex(cpfRegex, { message: 'Invalid CPF format' })
  //   .transform(val => val.replace(/[^\d]/g, '')).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .optional(),
  // Não permitir atualização de senha por este DTO
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
