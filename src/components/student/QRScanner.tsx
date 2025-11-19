import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Upload, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRScannerProps {
  onBack: () => void;
  onScan: (code: string) => void;
}

export const QRScanner = ({ onBack, onScan }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const extractCodeFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('code') || '';
    } catch {
      // If not a URL, assume it's just the code
      return url;
    }
  };

  const startScanning = async () => {
    setError('');
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const code = extractCodeFromUrl(decodedText);
          if (code) {
            scanner.stop();
            onScan(code);
          }
        },
        (error) => {
          // Ignore errors - they happen frequently during scanning
          console.debug('QR scan error:', error);
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera. Please try uploading an image instead.');
      }
      setScanning(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const scanner = new Html5Qrcode('qr-reader');
      const result = await scanner.scanFile(file, true);
      const code = extractCodeFromUrl(result);
      if (code) {
        onScan(code);
      } else {
        setError('Could not read QR code from image. Please try again.');
      }
    } catch (err) {
      console.error('Error scanning file:', err);
      setError('Could not read QR code from image. Please make sure it\'s clear and try again.');
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Position the QR code within the camera view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden bg-muted min-h-[300px]"
          />

          {!scanning && (
            <div className="space-y-2">
              <Button
                onClick={startScanning}
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                size="lg"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload QR Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Trouble scanning?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure the code is well-lit</li>
              <li>Hold your device steady</li>
              <li>Try entering the code manually</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
