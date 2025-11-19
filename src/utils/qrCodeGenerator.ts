import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate a QR code data URL for class enrollment
 */
export async function generateClassQR(
  classCode: string,
  options?: QRCodeOptions
): Promise<string> {
  const joinUrl = `${window.location.origin}/classes/join?code=${classCode}`;
  
  const qrDataUrl = await QRCode.toDataURL(joinUrl, {
    width: options?.width || 400,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
  });
  
  return qrDataUrl;
}

/**
 * Download QR code as PNG
 */
export async function downloadQRCode(
  classCode: string,
  className: string
): Promise<void> {
  const qrDataUrl = await generateClassQR(classCode, { width: 800 });
  
  const link = document.createElement('a');
  link.href = qrDataUrl;
  link.download = `${className.replace(/[^a-z0-9]/gi, '_')}_QR_Code.png`;
  link.click();
}

/**
 * Generate QR code as canvas (for printing)
 */
export async function generateQRCanvas(
  classCode: string,
  canvasElement: HTMLCanvasElement
): Promise<void> {
  const joinUrl = `${window.location.origin}/classes/join?code=${classCode}`;
  
  await QRCode.toCanvas(canvasElement, joinUrl, {
    width: 400,
    margin: 2,
  });
}
