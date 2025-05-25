// apps/api/src/modules/auth/services/auth.service.ts
import { AppDataSource } from '@/infra/database/typeorm/data-source';
import { Employee } from '@/infra/database/typeorm/entities/employee.entity';
import { Paystub } from '@/infra/database/typeorm/entities/paystub.entity'; // Certifique-se que o caminho está correto
import { UserService } from '@/modules/users/services/user.service'; // Para buscar e atualizar o usuário
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ResetPasswordDTO } from '../dtos/reset-password.dto';

export class AuthService {
  private employeeRepository: Repository<Employee>;
  private paystubRepository: Repository<Paystub>;
  private userService: UserService; // Usaremos para algumas operações de usuário

  constructor() {
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.paystubRepository = AppDataSource.getRepository(Paystub);
    this.userService = new UserService(); // Instanciando diretamente; considere injeção de dependência para projetos maiores
  }

  /**
   * Normaliza uma string de data (YYYY-MM-DD HH:MM:SS.mmm ou Date object) para o formato YYYY-MM-DD.
   */
  private formatDateToYYYYMMDD(dateInput: Date | string): string {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Extrai o primeiro nome de uma string de nome completo.
   */
  private getFirstName(fullName: string): string {
    if (!fullName || typeof fullName !== 'string') {
      return '';
    }
    return fullName.trim().split(' ')[0].toUpperCase();
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const { cpf, dataNascimento, primeiroNomeMae, newPassword } = data;

    // 1. Buscar o Employee pelo CPF
    // Usando o método do userService que já lida com "não encontrado" e não seleciona a senha por padrão
    // Precisamos da entidade completa para atualizar a senha, então não usamos findByCpfWithPassword aqui
    const employee = await this.employeeRepository.findOneBy({ cpf });
    if (!employee) {
      throw new AppError('User not found for the provided CPF.', 404);
    }

    // 2. Buscar um registro Paystub para o CPF
    const paystubEntry = await this.paystubRepository.findOneBy({ cpf });
    if (!paystubEntry) {
      // Esta mensagem é genérica para não revelar se o CPF existe mas não tem contracheque,
      // ou se os dados de verificação estão faltando no contracheque.
      throw new AppError('Verification data mismatch or not found.', 400);
    }

    // 3. Verificar se os campos de verificação existem no paystubEntry
    if (!paystubEntry.dataNasc || !paystubEntry.nomeMae) {
      console.warn(
        `Incomplete verification data in paystub for CPF: ${cpf}. DataNasc: ${paystubEntry.dataNasc}, NomeMae: ${paystubEntry.nomeMae}`,
      );
      throw new AppError('Verification data mismatch or not found.', 400);
    }

    // 4. Comparar os dados de verificação
    // Comparar Data de Nascimento (normalizando para YYYY-MM-DD)
    const formattedDataNascFromDb = this.formatDateToYYYYMMDD(
      paystubEntry.dataNasc,
    );
    const formattedDataNascFromInput = dataNascimento; // Já deve estar em YYYY-MM-DD pelo DTO

    if (formattedDataNascFromDb !== formattedDataNascFromInput) {
      // Log para depuração, mas não envie detalhes específicos para o usuário
      console.debug(
        `Date of birth mismatch for CPF: ${cpf}. DB: ${formattedDataNascFromDb}, Input: ${formattedDataNascFromInput}`,
      );
      throw new AppError('Verification data mismatch or not found.', 400);
    }

    // Comparar Primeiro Nome da Mãe (normalizando)
    const primeiroNomeMaeFromDb = this.getFirstName(paystubEntry.nomeMae); // Pega o primeiro nome do DB
    const primeiroNomeMaeFromInput = primeiroNomeMae.trim().toUpperCase(); // Normaliza input

    if (primeiroNomeMaeFromDb !== primeiroNomeMaeFromInput) {
      // Log para depuração
      console.debug(
        `Mother's first name mismatch for CPF: ${cpf}. DB: ${primeiroNomeMaeFromDb}, Input: ${primeiroNomeMaeFromInput}`,
      );
      throw new AppError('Verification data mismatch or not found.', 400);
    }

    // 5. Se a verificação for bem-sucedida, atualizar a senha
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Mesmo saltRounds do cadastro
    employee.password = hashedPassword;

    try {
      await this.employeeRepository.save(employee);
      // Não há retorno de dados sensíveis, apenas confirmação implícita pelo status 200/204.
    } catch (error: any) {
      console.error('DATABASE_SAVE_ERROR in resetPassword:', error);
      throw new AppError(
        'Failed to update password due to a database or internal error.',
        500,
      );
    }
  }
}
