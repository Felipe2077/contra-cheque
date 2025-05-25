//apps/api/src/modules/users/services/user.service.ts
import { AppDataSource } from '@/infra/database/typeorm/data-source';
import { Employee } from '@/infra/database/typeorm/entities/employee.entity';
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UpdateUserDTO } from '../dtos/update-user.dto';

export class UserService {
  private userRepository: Repository<Employee>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(Employee);
  }

  async createUser(data: CreateUserDTO): Promise<Omit<Employee, 'password'>> {
    const { cpf, email, name, password } = data;

    const cpfExists = await this.userRepository.findOneBy({ cpf });
    if (cpfExists) {
      throw new AppError('CPF already in use.', 409);
    }

    if (email) {
      // Se o email for fornecido, verificar se já existe
      const emailExists = await this.userRepository.findOneBy({ email });
      if (emailExists) {
        throw new AppError('Email address already in use.', 409);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = this.userRepository.create({
      cpf, // CPF normalizado (só números) pelo DTO
      email: email || null, // Armazena null se não fornecido
      name,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findById(id: string): Promise<Omit<Employee, 'password'> | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new AppError('User not found.', 404); // Lança erro se não encontrar
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Método para buscar por CPF, retornando com a senha (para login)
  async findByCpfWithPassword(cpf: string): Promise<Employee | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Garante que a senha seja selecionada
      .where('user.cpf = :cpf', { cpf })
      .getOne();
    return user;
  }

  // Opcional: se ainda precisar buscar por email (sem senha)
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
  ): Promise<Omit<Employee, 'password'> | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }

    // Lógica de atualização para CPF e Email (se permitido e fornecido)
    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOneBy({
        email: data.email,
      });
      if (emailExists) {
        throw new AppError('New email address already in use.', 409);
      }
    }
    // Se for permitir atualização de CPF (geralmente não se faz)
    // if (data.cpf && data.cpf !== user.cpf) {
    //   const cpfExists = await this.userRepository.findOneBy({ cpf: data.cpf });
    //   if (cpfExists) {
    //     throw new AppError('New CPF already in use.', 409);
    //   }
    // }

    this.userRepository.merge(user, data);
    if (data.email === undefined) user.email = null; // Se email não foi passado, mas queremos permitir "limpar"

    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
