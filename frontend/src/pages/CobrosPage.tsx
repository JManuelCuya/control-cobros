import React, { useState, useEffect } from 'react';
import { CalendarCheck, DollarSign, AlertTriangle, CheckCircle, X, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { cobrosApi, facturacionApi } from '../services/api';
import toast from 'react-hot-toast';

const NOMBRES_MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

interface MatrizContrato {
  id_contrato: number;
  id_cliente: number;
  nombre: string;
  apellido: string;
  num_doc?: string;
  telefono?: string;
  plan_desc?: string;
  direccion_servicio: string;
  dia_cobro: number;
  precio_acordado: number;
  meses: Record<number, any>; // 1..12
}

export const CobrosPage: React.FC = () => {
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [matriz, setMatriz] = useState<MatrizContrato[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [emitindoBoleta, setEmitindoBoleta] = useState<boolean>(false);

  // Modal para registrar o cambiar pago
  const [selectedCell, setSelectedCell] = useState<{
    contratoId: number;
    clienteId: number;
    clienteNombre: string;
    clienteNumDoc: string;
    precioAcordado: number;
    mesNum: number;
    mesNombre: string;
    cobroActual: any;
  } | null>(null);

  const [modalEstado, setModalEstado] = useState<'PAGADO' | 'DEUDA' | 'VACIO'>('PAGADO');
  const [modalMonto, setModalMonto] = useState<string>('50.00');
  const [modalObs, setModalObs] = useState<string>('');

  const cargarMatriz = async () => {
    try {
      setLoading(true);
      const data = await cobrosApi.getMatriz(anio);
      setMatriz(data);
    } catch (err) {
      console.error('Error al cargar matriz de cobros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMatriz();
  }, [anio]);

  const handleOpenModal = (contrato: MatrizContrato, mesNum: number) => {
    const cobro = contrato.meses[mesNum];
    setSelectedCell({
      contratoId: contrato.id_contrato,
      clienteId: contrato.id_cliente,
      clienteNombre: `${contrato.nombre} ${contrato.apellido}`,
      clienteNumDoc: contrato.num_doc || '00000000',
      precioAcordado: Number(contrato.precio_acordado) || 50.00,
      mesNum,
      mesNombre: NOMBRES_MESES[mesNum - 1],
      cobroActual: cobro
    });

    if (cobro) {
      setModalEstado(cobro.estado as any);
      setModalMonto(String(cobro.monto || contrato.precio_acordado));
      setModalObs(cobro.observacion || '');
    } else {
      setModalEstado('PAGADO');
      setModalMonto(String(contrato.precio_acordado));
      setModalObs('');
    }
  };

  const handleGuardarPagoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    try {
      await cobrosApi.registrar({
        id_contrato: selectedCell.contratoId,
        anio,
        mes: selectedCell.mesNum,
        estado: modalEstado,
        monto: parseFloat(modalMonto) || 0,
        observacion: modalObs
      });
      setSelectedCell(null);
      toast.success('Cobro registrado exitosamente');
      await cargarMatriz();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cobro');
    }
  };

  const handleEmitirBoletaYCobrar = async () => {
    if (!selectedCell) return;
    try {
      setEmitindoBoleta(true);
      const montoFinal = parseFloat(modalMonto) || selectedCell.precioAcordado;
      
      const comp = await facturacionApi.create({
        tipo_comprobante: 'BOLETA',
        tipo_pago: 'PAGO_PLAN_MENSUAL',
        periodo_mes: selectedCell.mesNum,
        periodo_anio: anio,
        id_cliente: selectedCell.clienteId,
        id_contrato: selectedCell.contratoId,
        cliente_nombre: selectedCell.clienteNombre,
        cliente_num_doc: selectedCell.clienteNumDoc,
        empresa_emisora: 'CABLE TV S.A.C.',
        estado_pago: 'PAGADO',
        detalles: [
          {
            descripcion_item: `Servicio Cable TV - ${selectedCell.mesNombre} ${anio}`,
            cantidad: 1,
            precio_unitario: montoFinal
          }
        ]
      });

      toast.success(`¡Boleta ${comp.serie}-${String(comp.numero).padStart(6, '0')} emitida con éxito!`);
      setSelectedCell(null);
      await cargarMatriz();
    } catch (err: any) {
      toast.error(err.message || 'Error al emitir boleta de cobro');
    } finally {
      setEmitindoBoleta(false);
    }
  };

  // Resumen estadístico
  let totalRecaudado = 0;
  let totalMontoDeuda = 0;
  let clientesAlDiaCount = 0;
  let clientesDeudoresCount = 0;

  matriz.forEach(c => {
    let tieneDeuda = false;
    let pagadosCount = 0;
    Object.values(c.meses).forEach(cob => {
      if (cob?.estado === 'PAGADO') {
        totalRecaudado += Number(cob.monto);
        pagadosCount++;
      } else if (cob?.estado === 'DEUDA') {
        tieneDeuda = true;
        totalMontoDeuda += Number(cob.monto || c.precio_acordado);
      }
    });

    if (tieneDeuda) clientesDeudoresCount++;
    else if (pagadosCount > 0) clientesAlDiaCount++;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sábana de Control de Cobros</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Matriz de seguimiento de mensualidades por instalación/contrato
          </p>
        </div>

        {/* Navegador de Año */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.25rem 0.75rem' }}>
          <button 
            className="close-btn" 
            style={{ padding: '0.2rem' }} 
            onClick={() => setAnio(anio - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-blue)' }}>Año {anio}</span>
          <button 
            className="close-btn" 
            style={{ padding: '0.2rem' }} 
            onClick={() => setAnio(anio + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Resumen Superior */}
      <div className="cards-grid">
        <div className="table-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Recaudado</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>S/ {totalRecaudado.toFixed(2)}</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Monto Total Deuda</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>S/ {totalMontoDeuda.toFixed(2)}</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Contratos al Día</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>{clientesAlDiaCount} servicios</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Contratos Morosos</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>{clientesDeudoresCount} servicios</div>
          </div>
        </div>
      </div>

      {/* Matriz Visual Sábana de Pagos */}
      <div className="table-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando sábana de cobros...</div>
        ) : (
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ width: '35px', textAlign: 'center' }}>N°</th>
                <th style={{ minWidth: '180px' }}>CLIENTE Y DIRECCIÓN</th>
                <th style={{ textAlign: 'center', width: '80px' }}>DÍA DEP.</th>
                <th style={{ textAlign: 'right', width: '80px' }}>PRECIO</th>
                <th style={{ textAlign: 'right', width: '100px', backgroundColor: '#fef2f2', color: '#991b1b' }}>MONTO DEUDA</th>
                <th style={{ textAlign: 'center', width: '60px' }}>WSP</th>
                {NOMBRES_MESES.map((mes, idx) => (
                  <th key={idx} style={{ textAlign: 'center', width: '65px', padding: '0.75rem 0.3rem' }}>
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriz.map((m, idx) => {
                let deudaCliente = 0;
                for (let i = 1; i <= 12; i++) {
                  if (m.meses[i]?.estado === 'DEUDA') {
                    deudaCliente += Number(m.meses[i].monto || m.precio_acordado);
                  }
                }

                return (
                  <tr key={m.id_contrato}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-color)' }}>{m.nombre} {m.apellido}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.direccion_servicio}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>
                      {m.dia_cobro}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      S/ {Number(m.precio_acordado).toFixed(0)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, backgroundColor: deudaCliente > 0 ? '#fef2f2' : 'transparent', color: deudaCliente > 0 ? '#dc2626' : 'inherit' }}>
                      {deudaCliente > 0 ? `S/ ${deudaCliente.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {deudaCliente > 0 && m.telefono && (
                        <a 
                          href={`https://wa.me/${m.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${m.nombre}, le escribimos de CABLE TV. Le recordamos que tiene un monto pendiente de S/ ${deudaCliente.toFixed(2)} correspondiente a su plan ${m.plan_desc} en la dirección ${m.direccion_servicio}.`)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ padding: '0.2rem 0.4rem', backgroundColor: '#25D366', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Enviar recordatorio por WhatsApp"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </a>
                      )}
                    </td>

                    {/* Celdas de meses */}
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(mesNum => {
                      const cobro = m.meses[mesNum];
                      let bgColor = 'transparent';
                      let content = '';
                      let textColor = '';

                      if (cobro?.estado === 'PAGADO') {
                        bgColor = '#d1fae5'; // Verde claro
                        textColor = '#047857'; // Verde oscuro
                        content = 'P';
                      } else if (cobro?.estado === 'DEUDA') {
                        bgColor = '#ef4444'; // Rojo fuerte
                        textColor = '#ffffff';
                        content = `1\nS/${Number(cobro.monto || m.precio_acordado).toFixed(0)}`;
                      }

                      return (
                        <td 
                          key={mesNum} 
                          onClick={() => handleOpenModal(m, mesNum)}
                          style={{ 
                            backgroundColor: bgColor, 
                            color: textColor,
                            textAlign: 'center', 
                            verticalAlign: 'middle',
                            cursor: 'pointer',
                            fontWeight: 800,
                            border: '1px solid #e2e8f0',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.2'
                          }}
                          className={!cobro ? 'hover-cell' : ''}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Editar/Registrar Cobro Manual o Emitir Comprobante */}
      {selectedCell && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Control de Cobro - {selectedCell.mesNombre}</h3>
              <button className="close-btn" onClick={() => setSelectedCell(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Cliente</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
                {selectedCell.clienteNombre}
              </div>
              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DNI/RUC:</span><br/>
                  <strong>{selectedCell.clienteNumDoc}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Precio Pactado:</span><br/>
                  <strong>S/ {selectedCell.precioAcordado.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleGuardarPagoManual}>
              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Estado del Mes</label>
                  <select
                    className="form-select"
                    style={{ 
                      fontWeight: 700, 
                      color: modalEstado === 'PAGADO' ? '#059669' : modalEstado === 'DEUDA' ? '#dc2626' : '#64748b',
                      backgroundColor: modalEstado === 'PAGADO' ? '#f0fdf4' : modalEstado === 'DEUDA' ? '#fef2f2' : '#f8fafc'
                    }}
                    value={modalEstado}
                    onChange={(e) => setModalEstado(e.target.value as any)}
                  >
                    <option value="VACIO">SIN REGISTRO (Blanco)</option>
                    <option value="PAGADO">PAGADO (Verde P)</option>
                    <option value="DEUDA">DEUDA (Rojo)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Monto a Cobrar (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={modalMonto}
                    onChange={(e) => setModalMonto(e.target.value)}
                    disabled={modalEstado === 'VACIO'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observación (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Pagó en Yape, Promesa de pago 15/05, etc."
                  value={modalObs}
                  onChange={(e) => setModalObs(e.target.value)}
                  disabled={modalEstado === 'VACIO'}
                />
              </div>

              {/* Botón rápido para Emitir Boleta y pagar */}
              {modalEstado !== 'PAGADO' && (
                <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px dashed #7dd3fc' }}>
                  <p style={{ fontSize: '0.8rem', color: '#0369a1', marginBottom: '0.5rem', fontWeight: 600 }}>
                    ¿El cliente desea su comprobante por este mes?
                  </p>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleEmitirBoletaYCobrar}
                    disabled={emitindoBoleta}
                  >
                    <Receipt size={18} />
                    {emitindoBoleta ? 'Emitiendo...' : 'Emitir Boleta del Mes (Auto-actualiza a Verde)'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn-danger" onClick={() => setSelectedCell(null)}>
                  Cerrar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Manualmente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .hover-cell:hover {
          background-color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};
