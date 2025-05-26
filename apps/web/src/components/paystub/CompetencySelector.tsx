// src/components/paystub/CompetencySelector.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaystubSummary } from '@/types/paystub';

interface CompetencySelectorProps {
  competencies: PaystubSummary[] | undefined;
  selectedCompetency: string | undefined;
  onCompetencyChange: (value: string) => void;
  isLoading: boolean;
  // O 'disabled' geral pode ser calculado internamente ou passado se houver mais condições
}

export function CompetencySelector({
  competencies,
  selectedCompetency,
  onCompetencyChange,
  isLoading,
}: CompetencySelectorProps) {
  const isDisabled = !competencies || competencies.length === 0 || isLoading;

  return (
    <div className='print:hidden mx-4'>
      <label
        htmlFor='competency-select'
        className='block text-sm font-medium text-foreground mb-1'
      >
        Escolha o Período (Mês/Ano):
      </label>
      <Select
        value={selectedCompetency}
        onValueChange={onCompetencyChange}
        disabled={isDisabled}
      >
        <SelectTrigger id='competency-select' className='w-full sm:w-[300px]'>
          <SelectValue
            placeholder={
              isLoading ? 'Carregando períodos...' : 'Selecione um período...'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {competencies && competencies.length > 0 ? (
            competencies.map((comp) => (
              <SelectItem key={Math.random()} value={comp.refMesAno}>
                {comp.nomeMes.trim()}/{comp.ano} ({comp.refMesAno})
              </SelectItem>
            ))
          ) : (
            <SelectItem value='no-data' disabled>
              {isLoading ? 'Carregando...' : 'Nenhuma competência encontrada'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
