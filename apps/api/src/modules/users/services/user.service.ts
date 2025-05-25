// apps/api/src/modules/users/services/user.service.ts
import { AppDataSource } from '@/infra/database/typeorm/data-source';
import { Employee } from '@/infra/database/typeorm/entities/employee.entity';
import { Paystub } from '@/infra/database/typeorm/entities/paystub.entity'; //
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';

export class UserService {
  private userRepository: Repository<Employee>;
  private paystubRepository: Repository<Paystub>; // B

  constructor() {
    this.userRepository = AppDataSource.getRepository(Employee);
    this.paystubRepository = AppDataSource.getRepository(Paystub);
  }

  async createUser(data: CreateUserDTO): Promise<Omit<Employee, 'password'>> {
    const { cpf, cracha, email, password } = data;

    // --- INÍCIO DAS VALIDAÇÕES ---

    // VALIDAÇÃO NOVA: CPF é de um funcionário existente (usando Paystub)
    // Esta deve ser uma das primeiras validações.
    const employeeRecordExists = await this.paystubRepository.findOneBy({
      cpf,
    });
    if (!employeeRecordExists) {
      throw new AppError(
        'Este CPF não corresponde a um funcionário registrado. Cadastro não permitido.',
        403, // Forbidden - não tem permissão para se registrar
      );
    }

    // VALIDAÇÃO ORIGINAL 1 (agora VALIDAÇÃO 2): Verificar se CPF já existe na tabela 'employes' (usuários)
    const cpfExistsInUsers = await this.userRepository.findOneBy({ cpf });
    if (cpfExistsInUsers) {
      // Ajuste na mensagem de erro para ser mais específica sobre onde o CPF já existe
      throw new AppError(
        'Este CPF já foi cadastrado como um usuário no sistema.',
        409,
      );
    }

    // VALIDAÇÃO ORIGINAL 2 (agora VALIDAÇÃO 3): Verificar se Email já existe (se fornecido e não nulo)
    if (email) {
      const emailExists = await this.userRepository.findOneBy({ email });
      if (emailExists) {
        throw new AppError(
          'Email address already in use by another user.',
          409,
        );
      }
    }

    // VALIDAÇÃO NOVA (adicionada anteriormente): Unicidade do Crachá no sistema de usuários (Employee)
    // (Esta validação agora é reforçada pela constraint do banco também)
    const crachaExistsInUsers = await this.userRepository.findOneBy({ cracha });
    if (crachaExistsInUsers) {
      throw new AppError(
        'Este crachá já está cadastrado para outro usuário.',
        409,
      );
    }
    // --- FIM DAS VALIDAÇÕES ---

    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Gerar o UUID para o novo 'employee'
    const newUserId = uuidv4();

    // 5. Criar a instância da entidade Employee
    const employeeToCreate = this.userRepository.create({
      id: newUserId,
      cpf,
      cracha,
      email: email || undefined,
      password: hashedPassword,
    });

    // 6. Salvar a entidade no banco
    try {
      const savedEmployee = await this.userRepository.save(employeeToCreate);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...employeeWithoutPassword } = savedEmployee;
      return employeeWithoutPassword;
    } catch (error: any) {
      console.error('DATABASE_SAVE_ERROR in createUser:', error);

      if (error.code === '23505') {
        // unique_violation no PostgreSQL
        let fieldMessage = 'um campo único'; // Mensagem padrão
        // Detalhar qual campo causou a violação de unicidade
        if (error.detail?.includes('(cpf)')) fieldMessage = 'o CPF fornecido';
        else if (error.detail?.includes('(email)'))
          fieldMessage = 'o email fornecido';
        else if (error.detail?.includes('(cracha)'))
          fieldMessage = 'o crachá fornecido';
        // Se for outra constraint única que não as esperadas:
        else if (error.constraint)
          fieldMessage = `o campo da constraint '${error.constraint}'`;

        throw new AppError(`Já existe um registro com ${fieldMessage}.`, 409);
      }
      throw new AppError(
        'Failed to create user due to a database or internal error.',
        500,
      );
    }
  }

  async findById(id: string): Promise<Omit<Employee, 'password'> | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByCpfWithPassword(cpf: string): Promise<Employee | null> {
    const user = await this.userRepository
      .createQueryBuilder('employee')
      .addSelect('employee.password')
      .where('employee.cpf = :cpf', { cpf })
      .getOne();
    return user;
  }

  async findByEmail(email: string): Promise<Omit<Employee, 'password'> | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(): Promise<Omit<Employee, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async updateUser(
    id: string,
    data: UpdateUserDTO,
  ): Promise<Omit<Employee, 'password'>> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new AppError('User not found for update.', 404);
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOneBy({
        email: data.email,
      });
      if (emailExists && emailExists.id !== id) {
        throw new AppError(
          'New email address already in use by another user.',
          409,
        );
      }
    }

    // <<< ADICIONADO: Validação de Crachá ao atualizar (se fornecido e diferente) >>>
    if (data.cracha && data.cracha !== user.cracha) {
      const crachaExists = await this.userRepository.findOneBy({
        cracha: data.cracha,
      });
      // Garantir que o crachá existente não é do próprio usuário que está sendo atualizado
      if (crachaExists && crachaExists.id !== id) {
        throw new AppError('New crachá already in use by another user.', 409);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    this.userRepository.merge(user, data);

    try {
      await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error('DATABASE_UPDATE_ERROR in updateUser:', error);
      if (error.code === '23505') {
        // <<< MELHORIA NA MENSAGEM DE ERRO DE UPDATE PARA UNICIDADE >>>
        let fieldMessage = 'um campo único';
        if (error.detail?.includes('(cpf)'))
          fieldMessage = 'o CPF fornecido'; // CPF não deve ser atualizável geralmente
        else if (error.detail?.includes('(email)'))
          fieldMessage = 'o email fornecido';
        else if (error.detail?.includes('(cracha)'))
          fieldMessage = 'o crachá fornecido';
        else if (error.constraint)
          fieldMessage = `o campo da constraint '${error.constraint}'`;
        throw new AppError(
          `A atualização falhou pois ${fieldMessage} já está em uso.`,
          409,
        );
      }
      throw new AppError(
        'Failed to update user due to a database or internal error.',
        500,
      );
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
}
