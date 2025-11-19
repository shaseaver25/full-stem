import { useEffect, useState } from 'react';
import { Download, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateClassQR, downloadQRCode } from '@/utils/qrCodeGenerator';
import { toast } from '@/hooks/use-toast';

interface ClassQRCodeProps {
  classCode: string;
  className: string;
}

export const ClassQRCode = ({ classCode, className }: ClassQRCodeProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await generateClassQR(classCode);
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate QR code',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [classCode]);

  const handleDownload = async () => {
    try {
      await downloadQRCode(classCode, className);
      toast({
        title: 'Downloaded',
        description: 'QR code saved to your downloads',
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Error',
        description: 'Please allow popups to print',
        variant: 'destructive',
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Join ${className} on TailorEDU</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            h1 { font-size: 2em; margin-bottom: 10px; }
            h2 { font-size: 1.5em; color: #666; margin-bottom: 20px; }
            img { max-width: 400px; margin: 20px 0; }
            .code { font-size: 2em; font-weight: bold; margin: 20px 0; }
            .instructions { text-align: center; max-width: 500px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>Join Our Class on TailorEDU</h1>
          <h2>${className}</h2>
          <img src="${qrDataUrl}" alt="QR Code" />
          <div class="code">OR enter code: ${classCode}</div>
          <div class="instructions">
            <p>Go to <strong>tailoredu.com/join</strong></p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
        <CardDescription>
          Students can scan this code with their camera
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center bg-muted rounded-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <img
              src={qrDataUrl}
              alt="Class QR Code"
              className="w-[200px] h-[200px]"
            />
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={loading}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={loading}
            className="flex-1"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
