import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const folderId = "1HR_9G765lsNOUle6JfPxIqH-WVe6UbId"; // ID de tu carpeta de Drive

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`,
      fields: 'files(id, name, createdTime, webViewLink)',
      orderBy: 'createdTime desc',
    });

    const archivosPdf = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime ? file.createdTime.split('T')[0] : 'Desconocida',
      estado: 'Pendiente',
      webViewLink: `https://drive.google.com/file/d/${file.id}/preview`,
      nombreProveedor: 'Proveedor por verificar',
      nFactura: file.name.replace(/\.[^/.]+$/, ""),
      nitProveedor: '000000000',
      fechaFactura: new Date().toISOString().split('T')[0],
      items: [
        { id: 1, descripcion: 'Ítem detectado en PDF de Drive', cantidad: 1, unidad: 'unidades', iva: '19%', valorTotal: 0 }
      ]
    }));

    return NextResponse.json({ success: true, files: archivosPdf });
  } catch (error) {
    console.error('Error sincronizando Google Drive:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
