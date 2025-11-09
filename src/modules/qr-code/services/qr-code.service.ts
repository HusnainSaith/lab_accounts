import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateZATCAQRCode(invoiceData: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    invoiceTotal: number;
    vatAmount: number;
  }): Promise<string> {
    // ZATCA QR Code format for KSA
    const qrData = [
      `1${invoiceData.sellerName}`,
      `2${invoiceData.vatNumber}`,
      `3${invoiceData.timestamp}`,
      `4${invoiceData.invoiceTotal.toFixed(2)}`,
      `5${invoiceData.vatAmount.toFixed(2)}`,
    ].join('');

    // Convert to Base64 TLV format
    const base64Data = Buffer.from(qrData, 'utf8').toString('base64');
    
    // Generate QR code as data URL
    return await QRCode.toDataURL(base64Data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  }

  async generateSimpleQRCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
    });
  }
}