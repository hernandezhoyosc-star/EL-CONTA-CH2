import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const facturaAuditada = await request.json();

    // 1. Autenticación en Siigo API
    const authResponse = await fetch('https://api.siigo.com/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Partner-Id': 'ContaCH'
      },
      body: JSON.stringify({
        username: process.env.SIIGO_API_USER,
        access_key: process.env.SIIGO_ACCESS_KEY
      })
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      throw new Error(authData.Message || 'Error al autenticar con Siigo');
    }

    const accessToken = authData.access_token;

    // 2. Estructura de la compra para Siigo Nube
    const payloadSiigo = {
      document: { id: 1234 }, // Reemplaza con el ID de tu comprobante de compras en Siigo
      date: facturaAuditada.fechaFactura,
      provider: {
        identification: facturaAuditada.nitProveedor,
        branch_office: 0
      },
      payments: [
        {
          id: 56, // ID de la forma de pago en Siigo
          value: facturaAuditada.items.reduce((acc, item) => acc + item.valorTotal, 0)
        }
      ],
      items: facturaAuditada.items.map(item => ({
        code: "5195", // Código de la cuenta PUC de gastos
        description: item.descripcion,
        quantity: item.cantidad,
        price: item.valorTotal / item.cantidad,
        taxes: []
      }))
    };

    // 3. Envío oficial a Siigo
    const siigoRes = await fetch('https://api.siigo.com/v1/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Partner-Id': 'ContaCH',
        'Idempotency-Key': facturaAuditada.nFactura
      },
      body: JSON.stringify(payloadSiigo)
    });

    const resultadoSiigo = await siigoRes.json();

    if (!siigoRes.ok) {
      return NextResponse.json({ success: false, error: resultadoSiigo }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resultadoSiigo });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
