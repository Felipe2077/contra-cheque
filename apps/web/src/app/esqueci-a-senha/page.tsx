// src/app/esqueci-a-senha/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Seus componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label não é explicitamente usado abaixo se FormLabel for usado, mas é bom ter se necessário
// import { Label } from '@/components/ui/label';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { KeyRound } from 'lucide-react'; // Ícone para a página

// Serviço de autenticação
import { ApiErrorResponse, authService } from '@/lib/api/authService';

// Schema de validação para o formulário com React Hook Form
const forgotPasswordFormSchema = z
  .object({
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório.')
      .refine(
        (val) =>
          /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(val) || /^\d{11}$/.test(val),
        {
          message:
            'Formato de CPF inválido. Use XXX.XXX.XXX-XX ou XXXXXXXXXXX.',
        }
      )
      .transform((val) => val.replace(/\D/g, '')), // Normaliza APÓS a validação do formato
    dataNascimento: z
      .string()
      .min(1, 'Data de nascimento é obrigatória.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use AAAA-MM-DD.'),
    primeiroNomeMae: z
      .string()
      .min(1, 'Primeiro nome da mãe é obrigatório.')
      .trim(),
    newPassword: z
      .string()
      .min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
    confirmNewPassword: z
      .string()
      .min(6, 'Confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmNewPassword'],
  });

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      cpf: '',
      dataNascimento: '',
      primeiroNomeMae: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Função para normalizar CPF ao mudar o valor (opcional, para UX com máscaras)
  // const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const rawValue = e.target.value.replace(/\D/g, '');
  //   // Aqui você pode aplicar uma máscara se desejar
  //   form.setValue('cpf', rawValue, { shouldValidate: true });
  // };

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    // O Zod resolver já transformou o CPF para conter apenas números.
    const payload = {
      cpf: values.cpf,
      dataNascimento: values.dataNascimento,
      primeiroNomeMae: values.primeiroNomeMae,
      newPassword: values.newPassword,
    };

    try {
      await authService.resetPassword(payload);
      setSuccessMessage(
        'Senha redefinida com sucesso! Você será redirecionado para o login em instantes.'
      );
      form.reset();
      setTimeout(() => {
        router.push('/login');
      }, 4000);
    } catch (error) {
      const err = error as ApiErrorResponse; // Erro lançado pelo authService
      if (err.errors) {
        // Tenta mapear erros de validação do backend para os campos do formulário
        let VError = false;
        Object.entries(err.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            // react-hook-form espera que 'field' seja uma chave de ForgotPasswordFormValues
            // Se os nomes dos campos do backend não baterem 100%, ajuste aqui ou mostre como erro geral.
            if (field in form.getValues()) {
              VError = true;
              form.setError(field as keyof ForgotPasswordFormValues, {
                type: 'server',
                message: messages[0],
              });
            }
          }
        });
        setServerError(
          VError
            ? 'Verifique os erros nos campos.'
            : err.message || 'Ocorreu um erro.'
        );
      } else {
        setServerError(
          err.message || 'Ocorreu um erro inesperado. Tente novamente.'
        );
      }
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
              <KeyRound size={32} />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold'>Redefinir Senha</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para criar uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='cpf'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      {/* <Input placeholder='000.000.000-00' {...field} onChange={(e) => { field.onChange(e); handleCpfChange(e); }} /> */}
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
                name='dataNascimento'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormDescription>Use o formato AAAA-MM-DD.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='primeiroNomeMae'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primeiro Nome da Mãe</FormLabel>
                    <FormControl>
                      <Input placeholder='Ex: Maria' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
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
                name='confirmNewPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
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
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          </Form>
          <div className='mt-6 text-center text-sm'>
            Lembrou a senha?{' '}
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
