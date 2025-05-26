// src/components/layout/PageHeader.tsx
// (Considerando que este header pode ser reutilizado, coloquei em uma pasta 'layout')
'use client';

import { Button } from '@/components/ui/button';
import { LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  onLogout: () => void;
}

export function PageHeader({ title, onLogout }: PageHeaderProps) {
  return (
    <header className='bg-background border-b shadow-sm sticky top-0 z-50 print:hidden'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 md:px-6'>
        <Image src='/logo.png' alt='pio logo' width={50} height={50} />
        <Link href='/' className='text-xl font-bold text-primary sm:text-2xl'>
          {title}
        </Link>
        <div className='flex items-center space-x-3 sm:space-x-4'>
          <Button onClick={onLogout} variant='outline' size='sm'>
            <LogOutIcon className='mr-1.5 h-4 w-4' /> Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
