// src/app/login/page.tsx
'use client';

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
  // FormDescription, // Removido se não usado
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/axios'; // Importe o apiClient configurado
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Schema de validação com Zod
const loginFormSchema = z.object({
  // A API espera CPF apenas com números. Vamos ajustar a validação ou tratar no submit.
  // Por agora, mantemos uma validação simples de string, mas idealmente,
  // o usuário digitaria com máscara e enviaríamos só os números.
  cpf: z
    .string()
    .min(1, { message: 'CPF é obrigatório.' })
    .refine((val) => /^\d{11}$/.test(val.replace(/\D/g, '')), {
      // Remove não dígitos e verifica se tem 11
      message: 'CPF deve conter 11 dígitos numéricos.',
    }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }), // API não especifica min, mas é bom ter
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      cpf: '',
      password: '',
    },
  });

  // Função para remover máscara do CPF antes de enviar
  const sanitizeCpf = (cpf: string) => cpf.replace(/\D/g, '');

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setLoginError(null);

    const payload = {
      cpf: sanitizeCpf(data.cpf), // Envia apenas os números do CPF
      password: data.password,
    };

    try {
      const response = await apiClient.post('/auth/login', payload);

      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        // TODO: Idealmente, o token deve ser adicionado aos headers do apiClient para futuras requisições
        // Ex: apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        router.push('/'); // Redireciona para a página principal
      } else {
        setLoginError('Resposta inesperada do servidor ao tentar fazer login.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (axios.isAxiosError(error) && error.response) {
        // Mensagens de erro da API
        setLoginError(
          error.response.data?.message ||
            'Ocorreu um erro ao tentar fazer login.'
        );
      } else {
        setLoginError(
          'Não foi possível conectar ao servidor. Verifique sua conexão.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='flex min-h-[99dvh] flex-col items-center justify-center bg-muted/40 p-4 '>
      <div
        className={cn(
          'glow-wrapper',
          'rounded-xl', // Garante que o wrapper tenha o mesmo arredondamento externo que o card teria
          'w-full max-w-sm shadow-lg',
          'relative z-[1]', // Card fica na frente do ::before do wrapper
          'm-[2px]'
        )}
      >
        <Card
          className={cn(
            'relative z-[1]', // Card fica na frente do ::before do wrapper
            'm-[2px]' // << IMPORTANTE: Margem de 2px no Card.
            // Esta margem cria o espaço para o "fundo" (::before) do wrapper aparecer como borda.
            // O Card PRECISA ter seu próprio background (bg-card) para cobrir o centro.
            // O Card já tem rounded-xl ou similar, que deve ser um pouco menor que o do wrapper
            // ou o mesmo se a margem for pequena.
            // Se o wrapper tem rounded-xl, e o card tem margin e bg-card,
            // o border-radius do card (que shadcn aplica, ex: rounded-lg) vai definir a forma interna.
            // Para um resultado mais previsível, você pode querer que o card também seja rounded-xl
            // ou um pouco menos (rounded-lg) se a margem for 2px.
            // 'rounded-lg' // Ex: Se --radius-xl é 1rem, e --radius-lg é 0.75rem.
          )}
        >
          <CardHeader className='text-center'>
            <div className='mb-4 flex justify-center'>
              <div className='text-primary-foreground rounded-full p-3'>
                <Image
                  src='/logo.png'
                  width={92}
                  height={92}
                  alt='logomarca viação pioneira'
                />
              </div>
            </div>
            <CardTitle className='text-[20px] font-bold'>
              Demonstrativo de Pagamento. <br /> Viação Pioneira
            </CardTitle>
            <CardDescription className='mt-2'>
              Digite seu CPF e senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='cpf'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        {/* Idealmente, usaríamos uma máscara de input para CPF aqui */}
                        <Input placeholder='000.000.000-00' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex flex-col'>
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

                  <div className='mt-2 text-center text-sm self-end'>
                    <Link
                      href='/esqueci-a-senha'
                      className='hover:underline text-yellow-300 font-medium'
                    >
                      Esqueci a senha.
                    </Link>
                  </div>
                </div>

                {loginError && (
                  <p className='text-sm font-medium text-destructive'>
                    {loginError}
                  </p>
                )}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className='mt-4 text-center text-sm'>
        Não tem uma conta?{' '}
        <Link
          href='/cadastro'
          className='hover:underline text-yellow-300 font-bold'
        >
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}
