'use client'

import { Button } from '@/components/button'

interface ActionButtonsProps {
  formName: string;
  generatePDF: boolean;
  submitOnline: boolean;
}

export default function ActionButtons({ formName, generatePDF, submitOnline }: ActionButtonsProps) {
  const handleGeneratePDF = () => {
    alert(`Generating PDF for ${formName}. This feature is not yet implemented.`);
  };

  const handleSubmitOnline = () => {
    console.log('Submitting online for', formName);
    // Implement online submission logic here
  };

  return (
    <div className="flex gap-4">
      {generatePDF && (
        <Button outline onClick={handleGeneratePDF}>
          Generate PDF
        </Button>
      )}
      {submitOnline && (
        <Button onClick={handleSubmitOnline}>
          Submit Online
        </Button>
      )}
    </div>
  );
}