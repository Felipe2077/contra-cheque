// src/components/paystub/ExportAsPDF.tsx
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportAsPDFProps {
  elementId?: string;
  fileName?: string;
}

export function ExportAsPDF({
  elementId = 'paystub-pdf',
  fileName = 'contracheque',
}: ExportAsPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    try {
      setIsGenerating(true);

      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Elemento não encontrado');
        return;
      }

      // Configurações do html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Adicionar apenas uma página
      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        imgWidth,
        Math.min(imgHeight, pageHeight)
      );

      // Download
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      size='sm'
      className='gap-2 bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 hover:border-yellow-500'
    >
      <Download className='h-4 w-4 text-black' />
      {isGenerating ? 'Gerando PDF...' : 'Gerar PDF do Período'}
    </Button>
  );
}
