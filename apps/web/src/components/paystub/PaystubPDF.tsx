// src/components/paystub/PaystubPDF.tsx
import { PaystubDetails } from '@/types/paystub';
import { formatCurrency } from '@/utils/formatters';
import Image from 'next/image';

interface PaystubPDFProps {
  details: PaystubDetails;
}

export function PaystubPDF({ details }: PaystubPDFProps) {
  if (!details) return null;

  const { header, events } = details;

  const containerStyle: React.CSSProperties = {
    width: '210mm',
    minHeight: '297mm',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px', // Equivalente ao text-[0.65rem] do Tailwind
    margin: '0 auto',
    border: '1px solid #a8a29e', // stone-400
    boxSizing: 'border-box',
  };

  // Cabeçalho da Empresa
  const companyHeaderStyle: React.CSSProperties = {
    display: 'flex',
    fontSize: '14px',
    borderBottom: '1px solid #a8a29e',
    gap: '4px',
    padding: '4px',
  };

  const logoContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    backgroundColor: '#000000',
    borderRadius: '1px',
    width: '70px',
    height: '70px',
  };

  const companyInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: '4px',
  };

  // Grid para informações do empregado
  const employeeGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    width: '100%',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  };

  const gridCellStyle = (
    colSpan: number,
    hasRightBorder: boolean = true,
    hasBottomBorder: boolean = true
  ): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gridColumn: `span ${colSpan}`,
    borderRight: hasRightBorder ? '1px solid #a8a29e' : 'none',
    borderBottom: hasBottomBorder ? '1px solid #a8a29e' : 'none',
    padding: '6px',
  });

  // Título da tabela
  const tableTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000',
    fontWeight: 'bold',
    padding: '4px',
    fontSize: '14px',
    backgroundColor: '#e5e7eb', // gray-200
    borderBottom: '1px solid #a8a29e',
  };

  // Tabela de eventos
  const eventsTableStyle: React.CSSProperties = {
    display: 'grid',
    width: '100%',
    fontSize: '14px',
  };

  const tableHeaderStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '8.33% 33.33% 8.33% 25% 25%', // Equivalente ao grid-cols-12
    fontWeight: 'bold',
    borderBottom: '1px solid #a8a29e',
  };

  const tableRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '8.33% 33.33% 8.33% 25% 25%',
    borderBottom: '1px solid #a8a29e',
  };

  const tableCellStyle = (
    textAlign: 'left' | 'center' | 'right' = 'left',
    hasRightBorder: boolean = true
  ): React.CSSProperties => ({
    textAlign,
    borderRight: hasRightBorder ? '1px solid #a8a29e' : 'none',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'flex-end'
          : 'flex-start',
  });

  // Totais
  const totalsRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '8.33% 33.33% 8.33% 25% 25%',
    borderBottom: '1px solid #a8a29e',
  };

  const liquidValueStyle: React.CSSProperties = {
    display: 'flex',
    gridColumn: 'span 4',
    gridRow: 'span 1',
    borderBottom: '1px solid #a8a29e',
    padding: '6px',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-end',
    gap: '8px',
    alignItems: 'center',
  };

  // Encargos grid
  const chargesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    width: '100%',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  };

  return (
    <div id='paystub-pdf' style={containerStyle}>
      {/* Cabeçalho da Empresa */}
      <div style={companyHeaderStyle}>
        <div style={logoContainerStyle}>
          <Image
            src={'/logo.png'}
            width={70}
            height={70}
            alt='Logo Empresa'
            style={{ display: 'block' }}
          />
        </div>
        <div style={companyInfoStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontWeight: 'bold', margin: 0 }}>
              VIAÇÃO PIONEIRA LTDA
            </p>
          </div>
          <p style={{ margin: 0 }}>05.830.982.0001/62</p>
          <p style={{ margin: 0 }}>
            SIBS QD 1 CONJ. B LOTE 07 NÚCLEO BAND. - DF
          </p>
          <p style={{ margin: 0 }}>71.736-102</p>
        </div>
      </div>

      {/* Informações do Empregado */}
      <div style={employeeGridStyle}>
        <div style={gridCellStyle(2, true, true)}>
          <p style={{ fontWeight: '600', margin: 0 }}>CRACHÁ:</p>
          <span>{header.cracha}</span>
        </div>
        <div style={gridCellStyle(10, false, true)}>
          <p style={{ fontWeight: '600', margin: 0 }}>NOME:</p>
          <span>{header.nomeFunc}</span>
        </div>
        <div style={gridCellStyle(6, true, true)}>
          <p style={{ fontWeight: '600', margin: 0 }}>FUNÇÃO:</p>
          <span>{header.funcao}</span>
        </div>
        <div style={gridCellStyle(3, true, true)}>
          <p style={{ fontWeight: '600', margin: 0 }}>AGÊNCIA:</p>
          <span>{header.codAgencia || 'N/A'}</span>
        </div>
        <div style={gridCellStyle(3, false, true)}>
          <p style={{ fontWeight: '600', margin: 0 }}>CONTA:</p>
          <span>{header.conta || 'N/A'}</span>
        </div>
        <div style={gridCellStyle(4, true, false)}>
          <p style={{ fontWeight: '600', margin: 0 }}>ÁREA:</p>
          <span>{header.descArea}</span>
        </div>
        <div style={gridCellStyle(4, true, false)}>
          <p style={{ fontWeight: '600', margin: 0 }}>DEPARTAMENTO:</p>
          <span>{header.descDepartamento}</span>
        </div>
        <div style={gridCellStyle(4, false, false)}>
          <p style={{ fontWeight: '600', margin: 0 }}>COMPETENCIA:</p>
          <span>{header.refMesAno.toUpperCase()}</span>
        </div>
      </div>

      {/* Título da Tabela de Eventos */}
      <div style={tableTitleStyle}>
        <p style={{ margin: 0 }}>DEMONSTRATIVO DE PAGAMENTO</p>
      </div>

      {/* Tabela de Eventos */}
      <div style={eventsTableStyle}>
        <div style={tableHeaderStyle}>
          <div style={tableCellStyle('center')}>CÓD.</div>
          <div style={tableCellStyle('left')}>EVENTO</div>
          <div style={tableCellStyle('center')}>REF.</div>
          <div style={tableCellStyle('right')}>PROVENTOS</div>
          <div style={tableCellStyle('right', false)}>DESCONTOS</div>
        </div>

        {events.length > 0 &&
          events
            .sort((a, b) => {
              if (a.tipoEvento === 'P' && b.tipoEvento === 'D') return -1;
              if (a.tipoEvento === 'D' && b.tipoEvento === 'P') return 1;
              return 0;
            })
            .map((event) => (
              <div style={tableRowStyle} key={event.id}>
                <div style={tableCellStyle('center')}>{event.codEvento}</div>
                <div
                  style={{
                    ...tableCellStyle('left'),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.evento}
                </div>
                <div style={tableCellStyle('center')}>
                  {String(event.referencia) === '0' ||
                  String(event.referencia) === '0.00'
                    ? ''
                    : parseFloat(String(event.referencia)).toFixed(2)}
                </div>
                <div style={tableCellStyle('right')}>
                  {event.tipoEvento === 'P' ? formatCurrency(event.valor) : ''}
                </div>
                <div style={tableCellStyle('right', false)}>
                  {event.tipoEvento === 'D' ? formatCurrency(event.valor) : ''}
                </div>
              </div>
            ))}
      </div>

      {/* Totais */}
      <div
        style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}
      >
        <div style={totalsRowStyle}>
          <div style={tableCellStyle('center')}>&nbsp;</div>
          <div style={tableCellStyle('center')}>&nbsp;</div>
          <div style={{ ...tableCellStyle('right'), fontWeight: 'bold' }}>
            TOTAIS:
          </div>
          <div
            style={{
              ...tableCellStyle('right'),
              color: '#15803d', // text-green-700
              fontWeight: 'bold',
              height: '24px',
            }}
          >
            {formatCurrency(header.totalProventos)}
          </div>
          <div
            style={{
              ...tableCellStyle('right', false),
              color: '#dc2626', // text-red-700
              fontWeight: 'bold',
              height: '24px',
            }}
          >
            {formatCurrency(header.totalDescontos)}
          </div>
        </div>

        <div style={liquidValueStyle}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
            VALOR LÍQUIDO:
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
            {formatCurrency(header.totalLiquido)}
          </p>
        </div>

        {/* Encargos */}
        <div style={tableTitleStyle}>
          <p style={{ margin: 0 }}>ENCARGOS</p>
        </div>

        <div style={chargesGridStyle}>
          <div style={gridCellStyle(4, true, true)}>
            <p style={{ fontWeight: '600', margin: 0 }}>SALÁRIO BASE:</p>
            <span>{formatCurrency(header.baseSalarial)}</span>
          </div>
          <div style={gridCellStyle(4, true, true)}>
            <p style={{ fontWeight: '600', margin: 0 }}>FGTS MÊS:</p>
            <span>{formatCurrency(header.fgts)}</span>
          </div>
          <div style={gridCellStyle(4, false, true)}>
            <p style={{ fontWeight: '600', margin: 0 }}>SALÁRIO CONTR. INSS:</p>
            <span>{formatCurrency(header.baseInss)}</span>
          </div>
          <div style={gridCellStyle(6, true, false)}>
            <p style={{ fontWeight: '600', margin: 0 }}>BASE CÁLCULO IRRF:</p>
            <span>{formatCurrency(header.baseIrrf)}</span>
          </div>
          <div style={gridCellStyle(6, false, false)}>
            <p style={{ fontWeight: '600', margin: 0 }}>BASE CÁLCULO FGTS:</p>
            <span>{formatCurrency(header.baseFgts)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
