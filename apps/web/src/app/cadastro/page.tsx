// src/app/cadastro/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Componentes UI
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react'; // Ícone para a página

// Serviço de autenticação
import {
  ApiErrorResponse,
  authService,
  RegisterUserPayload,
} from '@/lib/api/authService';

// Schema de validação para o formulário de cadastro no frontend
const signUpFormSchema = z
  .object({
    cracha: z.string().min(1, 'Crachá é obrigatório.'),
    // Adicione validações mais específicas para o crachá se necessário
    // Ex: .regex(/^\d{6}$/, "Crachá deve conter 6 dígitos.")
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório.')
      .refine(
        (val) =>
          /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(val) || /^\d{11}$/.test(val),
        {
          message: 'Formato de CPF inválido.',
        }
      )
      .transform((val) => val.replace(/\D/g, '')), // Normaliza após validação do formato
    email: z
      .string()
      .min(1, 'Email é obrigatório.')
      .email('Formato de email inválido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'], // Atribui o erro ao campo confirmPassword
  });

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      cracha: '',
      cpf: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    const payload: RegisterUserPayload = {
      cracha: values.cracha,
      cpf: values.cpf, // Já normalizado pelo Zod transform
      email: values.email,
      password: values.password,
    };

    try {
      const registeredUser = await authService.registerUser(payload);
      setSuccessMessage(
        `Usuário ${registeredUser.email} cadastrado com sucesso! Você será redirecionado para o login.`
      );
      form.reset();
      setTimeout(() => {
        router.push('/login'); // Redireciona para login após o cadastro
      }, 4000);
    } catch (error) {
      const err = error as ApiErrorResponse;
      if (err.errors) {
        let VError = false;
        Object.entries(err.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            if (field in form.getValues()) {
              VError = true;
              form.setError(field as keyof SignUpFormValues, {
                type: 'server',
                message: messages[0],
              });
            }
          }
        });
        setServerError(
          VError
            ? 'Verifique os erros nos campos.'
            : err.message || 'Erro ao tentar cadastrar.'
        );
      } else {
        setServerError(
          err.message || 'Ocorreu um erro inesperado. Tente novamente.'
        );
      }
      // Casos específicos de erro do backend (ex: CPF/Email já existe)
      // A mensagem já deve vir em err.message do backend.
      // Ex: if (err.message.includes("CPF already exists")) { ... }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='flex min-h-[99dvh] flex-col items-center justify-center bg-muted/40 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='bg-primary text-primary-foreground rounded-full p-3'>
              <UserPlus size={32} />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold'>Criar Nova Conta</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para se cadastrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='cracha'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crachá</FormLabel>
                    <FormControl>
                      <Input placeholder='Número do Crachá' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='cpf'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='000.000.000-00 ou 00000000000'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='seu@email.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError &&
                !form.formState.isDirty &&
                Object.keys(form.formState.errors).length === 0 && (
                  <p className='text-sm font-medium text-destructive'>
                    {serverError}
                  </p>
                )}
              {successMessage && (
                <p className='text-sm font-medium text-green-600 dark:text-green-500'>
                  {successMessage}
                </p>
              )}

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
          </Form>
          <div className='mt-6 text-center text-sm'>
            Já tem uma conta?{' '}
            <Link
              href='/login'
              className='font-medium text-primary hover:underline'
            >
              Fazer Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
