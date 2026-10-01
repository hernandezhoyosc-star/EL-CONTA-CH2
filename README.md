# EL-CONTA-CH2
CONTABILIDAD CONECTADA = INFORMACION SEGURA Y FIDEDIGNA
'use client';

import React, { useState } from 'react';

export default function ContaCHApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [pdfs, setPdfs] = useState([]);

  const sincronizarGoogleDrive = async () => {
    setLoading(true);
    setMensaje('Conectando con Google Drive y buscando PDFs...');
    
    try {
      const res = await fetch('/api/drive-sync');
      const data = await res.json();
      
      if (data.success) {
        setPdfs(data.files);
        setMensaje(`¡Sincronización exitosa! Se encontraron ${data.files.length} archivo(s) PDF.`);
      } else {
        setMensaje('Error al sincronizar Drive: ' + data.error);
      }
    } catch (err) {
      setMensaje('Error de red al conectar con Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    sincronizarGoogleDrive();
  };

  const handleItemChange = (index, campo, valor) => {
    const nuevosItems = [...facturaSeleccionada.items];
    nuevosItems[index][campo] = valor;
    setFacturaSeleccionada({ ...facturaSeleccionada, items: nuevosItems });
  };

  const agregarItem = () => {
    setFacturaSeleccionada({
      ...facturaSeleccionada,
      items: [
        ...facturaSeleccionada.items,
        { id: Date.now(), descripcion: '', cantidad: 1, unidad: 'unidades', iva: '19%', valorTotal: 0 }
      ]
    });
  };

  const eliminarItem = (index) => {
    const nuevosItems = facturaSeleccionada.items.filter((_, i) => i !== index);
    setFacturaSeleccionada({ ...facturaSeleccionada, items: nuevosItems });
  };

  const handleCausarEnSiigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('Autenticando en Siigo y registrando la factura de compra...');

    try {
      const res = await fetch('/api/siigo/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facturaSeleccionada)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPdfs(pdfs.map(p => p.id === facturaSeleccionada.id ? { ...facturaSeleccionada, estado: 'Causado en Siigo ✓' } : p));
        setMensaje(`¡Factura N° ${facturaSeleccionada.nFactura} de ${facturaSeleccionada.nombreProveedor} causada con éxito en Siigo!`);
        setFacturaSeleccionada(null);
      } else {
        setMensaje('Error en Siigo: ' + (data.error?.Message || JSON.stringify(data.error)));
      }
    } catch (err) {
      setMensaje('Error de conexión con la API de Siigo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 z-0" style={{ backgroundImage: `url('/Gemini_Generated_Image_yljt98yljt98yljt.jpg')` }}></div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-xl text-orange-500 font-bold">➔</div>
          <h1 className="text-2xl font-bold tracking-tight text-white text-center">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1 mb-8 text-center">Log in to your Conta CH account</p>

          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
            <button type="button" onClick={handleLogin} className="w-full bg-white hover:bg-slate-100 text-slate-900 text-sm font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm">
              Continue with Google
            </button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">OR</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
              </div>
              <button type="submit" className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-md mt-2">Log in</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-100 font-sans flex flex-col justify-between">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url('/Gemini_Generated_Image_yljt98yljt98yljt.jpg')` }}>
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full p-6 lg:p-8">
        <div className="flex justify-between items-center border-b border-orange-500/30 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 drop-shadow-md">
              🏎️ EL CONTACH <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/40 font-semibold">Siigo Conectado</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">Sincronizado con Google Drive y pasarela de causación Siigo Nube</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={sincronizarGoogleDrive} disabled={loading} className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg border border-orange-400/30 disabled:opacity-50">
              {loading ? 'Sincronizando...' : '🔄 Sincronizar PDFs del Drive'}
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="bg-slate-900 text-slate-400 hover:text-white text-xs px-3 py-2.5 rounded-xl border border-slate-800">Salir ⎋</button>
          </div>
        </div>

        {mensaje && (
          <div className="mb-6 p-4 bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 text-sm rounded-xl flex justify-between items-center shadow-lg backdrop-blur-md">
            <span>{mensaje}</span>
            <button onClick={() => setMensaje('')} className="text-emerald-400 font-bold hover:text-white">✕</button>
          </div>
        )}

        {facturaSeleccionada ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-orange-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="lg:col-span-5 flex flex-col h-[750px] bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden sticky top-6">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 text-xs font-semibold text-orange-400">📄 Papel a la vista (Drive): {facturaSeleccionada.name}</div>
              <iframe src={facturaSeleccionada.webViewLink} className="w-full h-full border-0" title="Visor PDF"></iframe>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">✏️️ Edición Manual & Auditoría</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Modifica los campos libremente antes de enviarlo a Siigo Contador.</p>
                  </div>
                  <button onClick={() => setFacturaSeleccionada(null)} className="text-slate-300 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">← Volver a la lista</button>
                </div>

                <form onSubmit={handleCausarEnSiigo} className="space-y-6">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Proveedor</label>
                      <input type="text" value={facturaSeleccionada.nombreProveedor} onChange={(e) => setFacturaSeleccionada({...facturaSeleccionada, nombreProveedor: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">N° de la factura</label>
                        <input type="text" value={facturaSeleccionada.nFactura} onChange={(e) => setFacturaSeleccionada({...facturaSeleccionada, nFactura: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">NIT del proveedor</label>
                        <input type="text" value={facturaSeleccionada.nitProveedor} onChange={(e) => setFacturaSeleccionada({...facturaSeleccionada, nitProveedor: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Fecha de la factura</label>
                        <input type="date" value={facturaSeleccionada.fechaFactura} onChange={(e) => setFacturaSeleccionada({...facturaSeleccionada, fechaFactura: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-400">Líneas de Productos / Servicios</h3>
                      <button type="button" onClick={agregarItem} className="text-xs bg-orange-600/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-md">+ Agregar línea manual</button>
                    </div>

                    {facturaSeleccionada.items.map((item, index) => (
                      <div key={item.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                        {facturaSeleccionada.items.length > 1 && (
                          <button type="button" onClick={() => eliminarItem(index)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-xs font-bold">✕</button>
                        )}
                        <input type="text" value={item.descripcion} onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)} placeholder="Descripción del producto o servicio" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500" required />
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Cantidad</label>
                            <input type="number" value={item.cantidad} onChange={(e) => handleItemChange(index, 'cantidad', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" required />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Unidad</label>
                            <select value={item.unidad} onChange={(e) => handleItemChange(index, 'unidad', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white">
                              <option value="unidades">unidades</option>
                              <option value="servicio">servicio</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Impuesto / IVA</label>
                            <select value={item.iva} onChange={(e) => handleItemChange(index, 'iva', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white">
                              <option value="19%">IVA 19%</option>
                              <option value="5%">IVA 5%</option>
                              <option value="0%">Excluido / 0%</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Valor Total ($)</label>
                            <input type="number" value={item.valorTotal} onChange={(e) => handleItemChange(index, 'valorTotal', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" required />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                    <button type="button" onClick={() => setFacturaSeleccionada(null)} className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg shadow-lg">
                      {loading ? 'Transmitiendo a Siigo...' : '⚡ Confirmar y Causar en Siigo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-slate-800 text-sm font-semibold text-slate-300 bg-slate-950/40 flex justify-between items-center">
              <span>PDFs encontrados en Google Drive (Carpeta raíz)</span>
              <span className="text-xs text-orange-400 font-mono">ID: 1HR_9G765lsNOUle6JfPxIqH-WVe6UbId</span>
            </div>
            
            <div className="divide-y divide-slate-800/80">
              {pdfs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No hay archivos cargados. Haz clic en <strong className="text-orange-400">"🔄 Sincronizar PDFs del Drive"</strong> para escanear tus carpetas.
                </div>
              ) : (
                pdfs.map((pdf) => (
                  <div key={pdf.id} className="p-5 flex items-center justify-between hover:bg-slate-850/60 transition">
                    <div>
                      <div className="font-medium text-white text-sm flex items-center gap-2">📄 {pdf.name}</div>
                      <div className="text-xs text-slate-400 mt-1 flex gap-4">
                        <span>Fecha: {pdf.createdTime}</span>
                        <span>Estado: <strong className={pdf.estado.includes('Causado') ? 'text-emerald-400' : 'text-amber-400'}>{pdf.estado}</strong></span>
                      </div>
                    </div>
                    <button onClick={() => setFacturaSeleccionada(pdf)} className="px-4 py-2 text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md border border-orange-400/30">
                      🔍 Corregir con el papel a la vista
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-900/50">Conta CH • Motor de Causación Inteligente con Siigo</div>
    </div>
  );
}
