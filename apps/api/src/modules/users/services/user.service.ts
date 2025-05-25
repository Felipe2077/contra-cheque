// apps/api/src/modules/users/services/user.service.ts
import { AppDataSource } from '@/infra/database/typeorm/data-source';
import { Employee } from '@/infra/database/typeorm/entities/employee.entity';
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // <<< ADICIONADO IMPORT
import { CreateUserDTO } from '../dtos/create-user.dto'; // DTO agora espera 'cracha'
import { UpdateUserDTO } from '../dtos/update-user.dto';

export class UserService {
  private userRepository: Repository<Employee>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(Employee);
  }

  async createUser(data: CreateUserDTO): Promise<Omit<Employee, 'password'>> {
    // 'data' agora deve conter 'cracha' conforme o DTO ajustado
    const { cpf, cracha, email, password } = data;

    // 1. Verificar se CPF já existe
    const cpfExists = await this.userRepository.findOneBy({ cpf });
    if (cpfExists) {
      throw new AppError('CPF already in use.', 409);
    }

    // 2. Verificar se Email já existe (se fornecido e não nulo)
    if (email) {
      const emailExists = await this.userRepository.findOneBy({ email });
      if (emailExists) {
        throw new AppError('Email address already in use.', 409);
      }
    }

    // 3. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10); // Aumentado salt rounds para 10

    // 4. Gerar o UUID para o novo 'employee'
    const newUserId = uuidv4(); // <<< GERAR O UUID

    // 5. Criar a instância da entidade Employee
    const employeeToCreate = this.userRepository.create({
      id: newUserId, // <<< ID GERADO FORNECIDO AQUI
      cpf,
      cracha, // <<< USANDO 'cracha'
      email: email || undefined, // Passa undefined se email for null ou não fornecido, TypeORM/DB lida com nullable
      password: hashedPassword,
      // createdAt e updatedAt são gerenciados pelo TypeORM/DB
    });

    // 6. Salvar a entidade no banco
    try {
      const savedEmployee = await this.userRepository.save(employeeToCreate);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...employeeWithoutPassword } = savedEmployee;
      return employeeWithoutPassword;
    } catch (error: any) {
      // Logar o erro original do banco para depuração
      console.error('DATABASE_SAVE_ERROR in createUser:', error);

      // Código '23505' é para unique_violation no PostgreSQL
      if (error.code === '23505') {
        let field = 'CPF or Email'; // Default
        if (error.detail && error.detail.includes('(cpf)')) {
          field = 'CPF';
        } else if (error.detail && error.detail.includes('(email)')) {
          field = 'Email';
        }
        throw new AppError(
          `A user with this ${field} may already exist. Please check the provided ${field}.`,
          409,
        );
      }
      // Para outros erros de banco ou inesperados
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
      .createQueryBuilder('employee') // Alias 'employee' para clareza
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
    // Ajustado para retornar Omit, não | null
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new AppError('User not found for update.', 404); // Lançar erro se não encontrado
    }

    // Lógica de atualização para Email (se fornecido e diferente)
    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOneBy({
        email: data.email,
      });
      // Garantir que o email existente não é do próprio usuário que está sendo atualizado
      if (emailExists && emailExists.id !== id) {
        throw new AppError(
          'New email address already in use by another user.',
          409,
        );
      }
    }

    // Atualizar senha se fornecida
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Mesclar os dados. O TypeORM é inteligente sobre campos undefined.
    // Se data.email for undefined, ele não tentará definir user.email para undefined,
    // a menos que você explicitamente configure para isso (ex: { nullable: true } e passando null).
    this.userRepository.merge(user, data);

    // Se você quiser permitir que um email seja explicitamente definido como null via DTO:
    // if (data.hasOwnProperty('email') && data.email === null) {
    //   user.email = null;
    // }

    try {
      await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error('DATABASE_UPDATE_ERROR in updateUser:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        throw new AppError(
          `Database constraint violation during update. Check CPF or Email. Detail: ${error.detail || error.message}`,
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
    return !!result.affected && result.affected > 0; // Forma mais concisa
  }
}
