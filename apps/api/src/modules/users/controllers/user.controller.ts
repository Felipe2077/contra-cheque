import { AppError } from '@/shared/errors/AppError';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { CreateUserDTO, createUserSchema } from '../dtos/create-user.dto';
import { UpdateUserDTO, updateUserSchema } from '../dtos/update-user.dto';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    // Bind `this` para os métodos para garantir o contexto correto quando usados como handlers
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const validatedData = createUserSchema.parse(request.body);
      const user = await this.userService.createUser(
        validatedData as CreateUserDTO,
      );
      reply.status(201).send(user);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError('Validation failed', 400, error.format());
      }
      throw error; // Re-throw para ser pego pelo errorHandler global ou AppError
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { id } = request.params;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    reply.send(user);
  }

  async getAll(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.userService.findAll();
    reply.send(users);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id } = request.params;
      const validatedData = updateUserSchema.parse(request.body);
      const user = await this.userService.updateUser(
        id,
        validatedData as UpdateUserDTO,
      );
      if (!user) {
        throw new AppError('User not found', 404);
      }
      reply.send(user);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError('Validation failed', 400, error.format());
      }
      throw error;
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { id } = request.params;
    const success = await this.userService.deleteUser(id);
    if (!success) {
      throw new AppError('User not found or could not be deleted', 404);
    }
    reply.status(204).send(); // No Content
  }
}
