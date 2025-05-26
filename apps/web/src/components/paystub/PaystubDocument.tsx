// src/components/paystub/PaystubDocument.tsx
import { LOGO_PIONEIRA_BASE64 } from '@/constants/logoConstants'; // Importando o logo
import { PaystubDetails } from '@/types/paystub';
import { formatCurrency } from '@/utils/formatters';
import Image from 'next/image';

interface PaystubDocumentProps {
  details: PaystubDetails;
}

export function PaystubDocument({ details }: PaystubDocumentProps) {
  if (!details) return null;

  const { header, events } = details;

  return (
    <div
      id='paycheck-document' // Mantemos o ID para a função de gerar PDF
      className='flex flex-col bg-white border border-stone-400 text-black mx-auto print:border-none print:shadow-none' // Adicionado print:border-none print:shadow-none
      style={{ maxWidth: '800px' }} // Mantido para consistência visual, pode ser ajustado via CSS global para print
    >
      {/* Cabeçalho da Empresa */}
      <div className='flex text-[0.65rem] border-b border-stone-400 gap-1 p-1'>
        <div className='flex-shrink-0 bg-black rounded-[1px]'>
          <Image
            src={LOGO_PIONEIRA_BASE64} // Usando a constante diretamente
            width={70} // Ajuste conforme necessário para o tamanho do logo no documento
            height={70}
            alt='Logo Empresa'
            id='paycheckCompanyLogo' // Mantido para consistência, embora não mais usado para trocar src
            priority // Considere priority se for LCP na visualização
          />
        </div>
        <div className='flex flex-col w-full pl-1'>
          <div className='flex justify-between'>
            <p className='font-bold'>VIAÇÃO PIONEIRA LTDA</p>
          </div>
          <p>05.830.982.0001/62</p>
          <p>SIBS QD 1 CONJ. B LOTE 07 NÚCLEO BAND. - DF</p>
          <p>71.736-102</p>
        </div>
      </div>

      {/* Informações do Empregado */}
      <div className='grid grid-cols-12 grid-rows-3 w-full text-[0.65rem] bg-white'>
        <div className='flex flex-col col-span-2 row-span-1 border-r border-b border-stone-400 p-1'>
          <p className='font-semibold'>CRACHÁ:</p>
          {header.cracha}
        </div>
        <div className='flex flex-col col-span-10 row-span-1 border-b border-stone-400 p-1'>
          <p className='font-semibold'>NOME:</p>
          {header.nomeFunc}
        </div>
        <div className='flex flex-col col-span-6 row-span-1 border-r border-b border-stone-400 p-1'>
          <p className='font-semibold'>FUNÇÃO:</p>
          {header.funcao}
        </div>
        <div className='flex flex-col col-span-3 row-span-1 border-r border-b border-stone-400 p-1'>
          <p className='font-semibold'>AGÊNCIA:</p>
          {header.codAgencia || 'N/A'}
        </div>
        <div className='flex flex-col col-span-3 row-span-1 border-b border-stone-400 p-1'>
          <p className='font-semibold'>CONTA:</p>
          {header.conta || 'N/A'}
        </div>
        <div className='flex flex-col col-span-4 row-span-1 border-r border-b border-stone-400 p-1'>
          <p className='font-semibold'>ÁREA:</p>
          {header.descArea}
        </div>
        <div className='flex flex-col col-span-4 row-span-1 border-r border-b border-stone-400 p-1'>
          <p className='font-semibold'>DEPARTAMENTO:</p>
          {header.descDepartamento}
        </div>
        <div className='flex flex-col col-span-4 row-span-1 border-b border-stone-400 p-1'>
          <p className='font-semibold'>COMPETENCIA:</p>
          {header.refMesAno.toUpperCase()}
        </div>
      </div>

      {/* Título da Tabela de Eventos */}
      <div className='flex items-center justify-center text-black font-bold py-1 text-sm bg-gray-200 border-b border-stone-400'>
        <p>DEMONSTRATIVO DE PAGAMENTO</p>
      </div>

      {/* Tabela de Eventos */}
      <div className='grid w-full text-[0.65rem] overflow-x-auto'>
        <div className='grid grid-cols-12 font-semibold border-b border-stone-400'>
          <div className='col-span-1 text-center border-r border-stone-400 py-0.5'>
            CÓD.
          </div>
          <div className='col-span-4 pl-1 border-r border-stone-400 py-0.5'>
            EVENTO
          </div>
          <div className='col-span-1 text-center border-r border-stone-400 py-0.5'>
            REF.
          </div>
          <div className='col-span-3 text-right pr-1 border-r border-stone-400 py-0.5'>
            PROVENTOS
          </div>
          <div className='col-span-3 text-right pr-1 py-0.5'>DESCONTOS</div>
        </div>
        {events.length > 0 &&
          events.map((event) => (
            <div
              className='grid grid-cols-12 border-b border-stone-400 hover:bg-gray-50'
              key={event.id}
            >
              <div className='col-span-1 text-center border-r border-stone-400 py-0.5'>
                {event.codEvento}
              </div>
              <div className='col-span-4 pl-1 border-r border-stone-400 py-0.5 truncate'>
                {event.evento}
              </div>
              <div className='col-span-1 text-center border-r border-stone-400 py-0.5'>
                {String(event.referencia) === '0' ||
                String(event.referencia) === '0.00'
                  ? ''
                  : parseFloat(String(event.referencia)).toFixed(2)}
              </div>
              <div className='col-span-3 text-right pr-1 border-r border-stone-400 py-0.5'>
                {event.tipoEvento === 'D' ? formatCurrency(event.valor) : ''}
              </div>
              <div className='col-span-3 text-right pr-1 py-0.5'>
                {event.tipoEvento === 'P' ? formatCurrency(event.valor) : ''}
              </div>
            </div>
          ))}
      </div>

      {/* Totais */}
      <div className='flex flex-col text-[0.65rem]'>
        <div className='grid grid-cols-12 border-b border-stone-400'>
          <div className='col-span-1 border-r border-stone-400'>&nbsp;</div>
          <div className='col-span-4 border-r border-stone-400'>&nbsp;</div>
          <div className='col-span-1 font-bold text-right pr-1 border-r border-stone-400 py-0.5'>
            TOTAIS:
          </div>
          <div className='flex h-6 items-center justify-end col-span-3 text-green-700 border-r border-stone-400 font-bold pr-1 py-0.5'>
            {formatCurrency(header.totalProventos)}
          </div>
          <div className='flex h-6 items-center justify-end col-span-3 text-red-700 font-bold text-right pr-1 py-0.5'>
            {formatCurrency(header.totalDescontos)}
          </div>
        </div>
        <div className='flex col-span-4 row-span-1 border-b border-stone-400 p-1 bg-white justify-end gap-2 items-center'>
          <p className='font-bold text-sm'>VALOR LÍQUIDO:</p>
          <p className='font-bold text-sm'>
            {formatCurrency(header.totalLiquido)}
          </p>
        </div>

        {/* Encargos */}
        <div className='flex items-center justify-center text-black font-bold py-1 text-sm bg-gray-200 border-b border-stone-400'>
          <p>ENCARGOS</p>
        </div>
        <div className='grid grid-cols-12 w-full text-[0.65rem] bg-white'>
          <div className='flex flex-col col-span-4 row-span-1 border-r border-b border-stone-400 p-1'>
            <p className='font-semibold'>SALÁRIO BASE:</p>
            {formatCurrency(header.baseSalarial)}
          </div>
          <div className='flex flex-col col-span-4 row-span-1 border-r border-b border-stone-400 p-1'>
            <p className='font-semibold'>FGTS MÊS:</p>
            {formatCurrency(header.fgts)}
          </div>
          <div className='flex flex-col col-span-4 row-span-1 border-b border-stone-400 p-1'>
            <p className='font-semibold'>SALÁRIO CONTR. INSS:</p>
            {formatCurrency(header.baseInss)}
          </div>
          <div className='flex flex-col col-span-6 row-span-1 border-r border-stone-400 p-1'>
            <p className='font-semibold'>BASE CÁLCULO IRRF:</p>
            {formatCurrency(header.baseIrrf)}
          </div>
          <div className='flex flex-col col-span-6 row-span-1 p-1'>
            <p className='font-semibold'>BASE CÁLCULO FGTS:</p>
            {formatCurrency(header.baseFgts)}
          </div>
        </div>
      </div>
    </div>
  );
}
