// apps/api/src/shared/errors/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown; // Para informações adicionais, como erros de validação Zod

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    // Mantém o stack trace correto para onde o erro foi instanciado
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
    this.name = 'AppError';
  }
}
