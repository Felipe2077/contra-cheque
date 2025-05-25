// src/app/page.tsx
import PaystubDashboardClient from '@/components/paystub/PaystubDashboardClient';

// Este é um Server Component por padrão
export default function DashboardPage() {
  return (
    // Suspense pode ser usado aqui se PaystubDashboardClient tiver alguma lógica de fetching assíncrona
    // que queiramos cobrir com um fallback no nível da página, mas os loaders internos do Client Component
    // já cuidam disso.
    // <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando Dashboard...</div>}>
    <PaystubDashboardClient />
    // </Suspense>
  );
}
