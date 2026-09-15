import React, { useState, useEffect } from 'react';
import { Receipt, PlusCircle, Eye, Printer, X, Trash2, CheckCircle2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { facturacionApi, clientesApi, contratosApi, productosApi, pedidosApi } from '../services/api';
import toast from 'react-hot-toast';

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

interface Comprobante {
  id: number;
  tipo_comprobante: string;
  tipo_pago?: string;
  periodo_mes?: number;
  periodo_anio?: number;
  serie: string;
  numero: number;
  cliente_nombre: string;
  cliente_num_doc: string;
  empresa_emisora: string;
  fecha_emision: string;
  total: number | string;
  estado: string;
  estado_pago?: string;
  detalles?: any[];
}

interface FacturacionProps {
  onNavigate?: (tab: string) => void;
}

const SearchableSelect = ({ options, value, onChange, placeholder }: { options: {id: number, label: string}[], value: number | '', onChange: (id: number) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedOption = options.find(o => o.id === value);
  const displayValue = isOpen ? search : (selectedOption ? selectedOption.label : '');

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
      <input
        type="text"
        className="form-input"
        style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', cursor: isOpen ? 'text' : 'pointer' }}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => { setIsOpen(true); setSearch(''); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {filteredOptions.length === 0 ? <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#666' }}>Sin resultados</div> : null}
          {filteredOptions.map(o => (
            <div 
              key={o.id} 
              style={{ padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
              onMouseDown={(e) => { e.preventDefault(); onChange(o.id); setIsOpen(false); }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const FacturacionPage: React.FC<FacturacionProps> = ({ onNavigate }) => {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productosCat, setProductosCat] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
  const [isEmitirOpen, setIsEmitirOpen] = useState(false);
  const [previewComp, setPreviewComp] = useState<Comprobante | null>(null);

  // Formulario Cabecera
  const [tipoComprobante, setTipoComprobante] = useState<'FACTURA' | 'BOLETA' | 'NOTA_CREDITO' | 'NOTA_DEBITO'>('BOLETA');
  const [tipoPago, setTipoPago] = useState<'PAGO_PLAN_MENSUAL' | 'VENTA_PRODUCTO'>('PAGO_PLAN_MENSUAL');
  const [estadoPago, setEstadoPago] = useState<'PAGADO' | 'POR_PAGAR'>('PAGADO');
  
  const [periodoMes, setPeriodoMes] = useState<number>(new Date().getMonth() + 1);
  const [periodoAnio, setPeriodoAnio] = useState<number>(new Date().getFullYear());

  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteNumDoc, setClienteNumDoc] = useState('');
  const [empresaEmisora, setEmpresaEmisora] = useState('CABLE TV S.A.C.');

  // Contratos del cliente seleccionado
  const [clienteContratos, setClienteContratos] = useState<any[]>([]);
  const [selectedContratoId, setSelectedContratoId] = useState('');

  // Pedidos del cliente seleccionado (para VENTA_PRODUCTO)
  const [clientePedidos, setClientePedidos] = useState<any[]>([]);
  const [selectedPedidoId, setSelectedPedidoId] = useState('');

  // Formulario Detalle
  const [detalles, setDetalles] = useState<{ tipoItem?: string; id_producto?: number; descripcion_item: string; cantidad: number; precio_unitario: number; searchTerm?: string }[]>([
    { descripcion_item: `Servicio de Cable Mensual - ${MESES[new Date().getMonth()]} ${new Date().getFullYear()}`, cantidad: 1, precio_unitario: 50.00 }
  ]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [comps, clis, prods] = await Promise.all([
        facturacionApi.getAll(),
        clientesApi.getAll().catch(() => []),
        productosApi.getAll().catch(() => [])
      ]);
      setComprobantes(comps);
      setClientes(clis);
      setProductosCat(prods);
    } catch (err) {
      console.error('Error al cargar comprobantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleTipoPagoChange = (nuevoTipo: 'PAGO_PLAN_MENSUAL' | 'VENTA_PRODUCTO') => {
    setTipoPago(nuevoTipo);
    if (nuevoTipo === 'PAGO_PLAN_MENSUAL') {
      const mesNombre = MESES[periodoMes - 1];
      let precio = 50.00;
      let descPlan = 'Servicio de Cable Mensual';
      if (selectedContratoId) {
        const contrato = clienteContratos.find(c => c.id === Number(selectedContratoId));
        if (contrato) {
          precio = Number(contrato.precio_acordado);
          if (contrato.plan) descPlan = `Pago Plan ${contrato.plan.descripcion}`;
        }
      }
      setDetalles([
        { descripcion_item: `${descPlan} - ${mesNombre} ${periodoAnio}`, cantidad: 1, precio_unitario: precio }
      ]);
    } else {
      // Venta producto
      setDetalles([{ descripcion_item: '', cantidad: 1, precio_unitario: 0 }]);
    }
  };

  const handlePeriodoChange = (mes: number, anio: number) => {
    setPeriodoMes(mes);
    setPeriodoAnio(anio);
    if (tipoPago === 'PAGO_PLAN_MENSUAL') {
      const mesNombre = MESES[mes - 1];
      let descPlan = 'Servicio de Cable Mensual';
      if (selectedContratoId) {
        const contrato = clienteContratos.find(c => c.id === Number(selectedContratoId));
        if (contrato && contrato.plan) descPlan = `Pago Plan ${contrato.plan.descripcion}`;
      }
      setDetalles(prev => prev.map((item, idx) => idx === 0 ? {
        ...item,
        descripcion_item: `${descPlan} - ${mesNombre} ${anio}`
      } : item));
    }
  };

  const handleSelectCliente = async (idStr: string) => {
    setSelectedClienteId(idStr);
    setSelectedContratoId('');
    setSelectedPedidoId('');
    setClienteContratos([]);
    setClientePedidos([]);

    if (!idStr) {
      setClienteNombre('');
      setClienteNumDoc('');
      return;
    }
    const cli = clientes.find(c => c.id === Number(idStr));
    if (cli) {
      setClienteNombre(`${cli.nombre} ${cli.apellido}`);
      setClienteNumDoc(cli.num_doc || '00000000');

      // Cargar sus contratos activos
      try {
        const contratos = await contratosApi.getByCliente(cli.id);
        setClienteContratos(contratos);
        if (contratos.length > 0 && tipoPago === 'PAGO_PLAN_MENSUAL') {
          handleSelectContrato(String(contratos[0].id), contratos);
        }
      } catch (err) {
        console.error(err);
      }

      // Cargar sus pedidos pendientes
      try {
        const allPedidos = await pedidosApi.getAll();
        const cPedidos = allPedidos.filter((p: any) => p.id_cliente === cli.id && p.estado === 'PENDIENTE');
        setClientePedidos(cPedidos);
      } catch(err) {}
    }
  };

  const handleSelectContrato = (contratoId: string, listaContratos = clienteContratos) => {
    setSelectedContratoId(contratoId);
    if (tipoPago === 'PAGO_PLAN_MENSUAL' && contratoId) {
      const contrato = listaContratos.find(c => c.id === Number(contratoId));
      if (contrato) {
        const precio = Number(contrato.precio_acordado);
        let descPlan = 'Servicio de Cable Mensual';
        if (contrato.plan) descPlan = `Pago Plan ${contrato.plan.descripcion}`;
        const mesNombre = MESES[periodoMes - 1];
        setDetalles(prev => prev.map((item, idx) => idx === 0 ? { 
          ...item, 
          precio_unitario: precio,
          descripcion_item: `${descPlan} - ${mesNombre} ${periodoAnio}`
        } : item));
      }
    }
  };

  const handleSelectPedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    if (pedidoId) {
      const pedido = clientePedidos.find(p => p.id === Number(pedidoId));
      if (pedido && pedido.detallesPedido) {
        const nuevosDetalles = pedido.detallesPedido.map((d: any) => ({
          tipoItem: 'ARTICULO',
          id_producto: d.id_producto,
          descripcion_item: d.producto ? d.producto.descripcion : `Producto #${d.id_producto}`,
          cantidad: d.cantidad,
          precio_unitario: Number(d.precio_unit)
        }));
        setDetalles(nuevosDetalles.length > 0 ? nuevosDetalles : [{ descripcion_item: '', cantidad: 1, precio_unitario: 0 }]);
      }
    }
  };

  const handleAddDetalleRow = () => {
    setDetalles([...detalles, { descripcion_item: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const handleRemoveDetalleRow = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleDetalleChange = (index: number, field: string, value: any) => {
    const nuevos = [...detalles];
    (nuevos[index] as any)[field] = value;
    setDetalles(nuevos);
  };

  const totalGeneralCabecera = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

  const handleEmitirComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre.trim() || !clienteNumDoc.trim()) {
      toast.error('Ingrese los datos del cliente (Nombre y DNI/RUC)');
      return;
    }
    if (detalles.length === 0) {
      toast.error('Debe agregar al menos un ítem al detalle del comprobante');
      return;
    }

    try {
      const nuevo = await facturacionApi.create({
        tipo_comprobante: tipoComprobante,
        tipo_pago: tipoPago,
        periodo_mes: tipoPago === 'PAGO_PLAN_MENSUAL' ? periodoMes : undefined,
        periodo_anio: tipoPago === 'PAGO_PLAN_MENSUAL' ? periodoAnio : undefined,
        id_cliente: selectedClienteId ? Number(selectedClienteId) : undefined,
        id_contrato: selectedContratoId && tipoPago === 'PAGO_PLAN_MENSUAL' ? Number(selectedContratoId) : undefined,
        cliente_nombre: clienteNombre.trim(),
        cliente_num_doc: clienteNumDoc.trim(),
        empresa_emisora: empresaEmisora.trim() || 'CABLE TV S.A.C.',
        estado_pago: estadoPago,
        detalles
      });

      setIsEmitirOpen(false);
      toast.success(`Comprobante ${nuevo.serie}-${nuevo.numero} emitido con éxito`);
      await cargarDatos();
      setPreviewComp(nuevo);
    } catch (err: any) {
      toast.error(err.message || 'Error al emitir el comprobante');
    }
  };

  const handleMarcarPagado = async (id: number) => {
    if (!window.confirm('¿Confirmar el cobro de este comprobante? Esto actualizará la ganancia real.')) return;
    try {
      await facturacionApi.cambiarEstadoPago(id, 'PAGADO');
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al registrar el pago');
    }
  };

  // Cálculos de KPIs Financieros
  let totalCuentasPorCobrar = 0;
  let totalGananciaReal = 0;
  let totalGeneralEmitido = 0;

  comprobantes.forEach(c => {
    if (c.estado !== 'ANULADO') {
      const monto = Number(c.total);
      totalGeneralEmitido += monto;
      if (c.estado_pago === 'POR_PAGAR') {
        totalCuentasPorCobrar += monto;
      } else if (c.estado_pago === 'PAGADO') {
        totalGananciaReal += monto;
      }
    }
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Módulo de Facturación y Cobranza</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Control de cuentas por cobrar, ganancias y emisión de comprobantes
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsEmitirOpen(true)}>
          <PlusCircle size={18} /> Emitir Nuevo Comprobante
        </button>
      </div>

      {/* DASHBOARD DE KPIs FINANCIEROS */}
      <div className="cards-grid">
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cuentas por Cobrar</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b45309' }}>S/ {totalCuentasPorCobrar.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>Comprobantes emitidos pendientes de pago</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Pagado / Ganancia Real</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857' }}>S/ {totalGananciaReal.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.25rem' }}>Dinero efectivamente recaudado</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Receipt size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total General Facturado</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1d4ed8' }}>S/ {totalGeneralEmitido.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', color: '#1e3a8a', marginTop: '0.25rem' }}>Suma de todo lo emitido</div>
          </div>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando comprobantes...</div>
        ) : (
          <div className="table-responsive">
                <table className="data-table">
            <thead>
              <tr>
                <th>Comprobante N°</th>
                <th>Tipo Pago</th>
                <th>Cliente</th>
                <th>DNI / RUC</th>
                <th>Fecha Emisión</th>
                <th>Total Facturado</th>
                <th>Estado Comercial</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se han emitido comprobantes aún.
                  </td>
                </tr>
              ) : (
                comprobantes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#0284c7' }}>
                      {c.serie}-{String(c.numero).padStart(6, '0')}
                      <br/>
                      <span className={`badge ${c.tipo_comprobante === 'FACTURA' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                        {c.tipo_comprobante}
                      </span>
                    </td>
                    <td>
                      {c.tipo_pago === 'PAGO_PLAN_MENSUAL' ? (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                          PLAN MENSUAL ({MESES[(c.periodo_mes || 1) - 1]} {c.periodo_anio})
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                          VENTA PRODUCTO
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.cliente_nombre}</td>
                    <td>{c.cliente_num_doc}</td>
                    <td>{new Date(c.fecha_emision).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 800, color: '#1e293b' }}>S/ {Number(c.total).toFixed(2)}</td>
                    <td>
                      {c.estado === 'ANULADO' ? (
                        <span className="badge badge-danger">ANULADO</span>
                      ) : (
                        c.estado_pago === 'PAGADO' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <CheckCircle size={12} /> PAGADO
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <AlertCircle size={12} /> POR PAGAR
                          </span>
                        )
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#475569' }}
                          onClick={() => setPreviewComp(c)}
                        >
                          <Eye size={14} /> Ver
                        </button>
                        {c.estado_pago === 'POR_PAGAR' && c.estado !== 'ANULADO' && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#10b981' }}
                            onClick={() => handleMarcarPagado(c.id)}
                            title="Registrar el cobro en caja y sumarlo a Ganancia Real"
                          >
                            <DollarSign size={14} /> Cobrar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
              </div>
        )}
      </div>

      {/* Modal Emitir Comprobante */}
      {isEmitirOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3><Receipt size={20} style={{ display: 'inline', marginRight: '8px' }} /> Emitir Comprobante Electrónico</h3>
              <button className="close-btn" onClick={() => setIsEmitirOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEmitirComprobante}>
              {/* Selector de Tipo Comprobante */}
              <div className="form-group">
                <label>Tipo de Comprobante</label>
                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {(['BOLETA', 'FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'] as const).map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      className={`btn-primary ${tipoComprobante === tipo ? '' : 'btn-danger'}`}
                      style={{
                        padding: '0.5rem 0.2rem',
                        fontSize: '0.8rem',
                        justifyContent: 'center',
                        backgroundColor: tipoComprobante === tipo ? 'var(--accent-blue)' : '#f1f5f9',
                        color: tipoComprobante === tipo ? '#fff' : '#64748b',
                        border: '1px solid #cbd5e1'
                      }}
                      onClick={() => setTipoComprobante(tipo)}
                    >
                      {tipo.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Selector de Tipo de Pago */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tipo de Ingreso / Origen</label>
                  <select
                    className="form-select"
                    style={{ fontWeight: 600, color: 'var(--accent-blue)' }}
                    value={tipoPago}
                    onChange={(e) => handleTipoPagoChange(e.target.value as any)}
                  >
                    <option value="PAGO_PLAN_MENSUAL">PAGO PLAN MENSUAL (Sábana Cobros)</option>
                    <option value="VENTA_PRODUCTO">VENTA DE EQUIPOS / PRODUCTOS</option>
                  </select>
                </div>

                {/* Selector de Estado Comercial de Pago */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Estado del Cobro</label>
                  <select
                    className="form-select"
                    style={{ fontWeight: 700, color: estadoPago === 'PAGADO' ? '#059669' : '#d97706', backgroundColor: estadoPago === 'PAGADO' ? '#f0fdf4' : '#fffbeb' }}
                    value={estadoPago}
                    onChange={(e) => setEstadoPago(e.target.value as any)}
                  >
                    <option value="PAGADO">PAGADO (Al Contado / Suma a Ganancia)</option>
                    <option value="POR_PAGAR">POR PAGAR (Crédito / Cuenta por Cobrar)</option>
                  </select>
                </div>
              </div>

              {/* DATOS DE CABECERA */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  1. Datos de Cabecera del Comprobante
                </h4>

                <div className="form-group">
                  <label>Seleccionar Cliente Registrado</label>
                  <select
                    className="form-select"
                    value={selectedClienteId}
                    onChange={(e) => handleSelectCliente(e.target.value)}
                  >
                    <option value="">-- Cliente Eventual / Manual --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido} - DNI/RUC: {c.num_doc || 'Sin Doc'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Si es plan mensual y el cliente está seleccionado, mostrar selector de Contratos */}
                {tipoPago === 'PAGO_PLAN_MENSUAL' && selectedClienteId && clienteContratos.length > 0 && (
                  <div className="form-group" style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '0.5rem', border: '1px solid #7dd3fc' }}>
                    <label style={{ color: '#0369a1', fontWeight: 700 }}><CheckCircle2 size={16} style={{ display: 'inline', marginBottom: '-3px' }}/> Seleccionar Instalación / Contrato a pagar</label>
                    <select
                      className="form-select"
                      style={{ marginTop: '0.5rem', borderColor: '#bae6fd' }}
                      value={selectedContratoId}
                      onChange={(e) => handleSelectContrato(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccione el Contrato --</option>
                      {clienteContratos.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.direccion_servicio} - Día de Pago: {c.dia_cobro} - (S/ {Number(c.precio_acordado).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {tipoPago === 'VENTA_PRODUCTO' && selectedClienteId && clientePedidos.length > 0 && (
                  <div className="form-group" style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '0.5rem', border: '1px solid #7dd3fc' }}>
                    <label style={{ color: '#0369a1', fontWeight: 700 }}>Importar desde Pedido</label>
                    <select 
                      className="form-select"
                      style={{ marginTop: '0.5rem', borderColor: '#bae6fd' }}
                      value={selectedPedidoId}
                      onChange={(e) => handleSelectPedido(e.target.value)}
                    >
                      <option value="">-- No vincular pedido --</option>
                      {clientePedidos.map(p => {
                        const esServicio = p.detallesPedido?.some((d: any) => d.producto?.tipo === 'SERVICIO');
                        const tipoTexto = esServicio ? 'Servicio' : 'Artículo';
                        return (
                          <option key={p.id} value={p.id}>
                            Pedido #{p.id} ({tipoTexto}) - S/ {Number(p.total).toFixed(2)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {tipoPago === 'PAGO_PLAN_MENSUAL' && selectedClienteId && clienteContratos.length === 0 && (
                  <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca', marginBottom: '1rem' }}>
                    <div style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <AlertCircle size={14} style={{ display: 'inline', marginBottom: '-2px' }} /> Este cliente no tiene contratos activos registrados.
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        console.log('Navigating to clientes...', onNavigate);
                        setIsEmitirOpen(false);
                        localStorage.setItem('autoOpenContratosCliente', selectedClienteId);
                        if (onNavigate) onNavigate('clientes');
                      }} 
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Ir a Gestión de Clientes
                    </button>
                  </div>
                )}

                {/* Periodo de Cobro (si es PAGO_PLAN_MENSUAL) */}
                {tipoPago === 'PAGO_PLAN_MENSUAL' && (
                  <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label>Mes del Servicio</label>
                      <select
                        className="form-select"
                        value={periodoMes}
                        onChange={(e) => handlePeriodoChange(parseInt(e.target.value, 10), periodoAnio)}
                      >
                        {MESES.map((m, idx) => (
                          <option key={idx} value={idx + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Año</label>
                      <input
                        type="number"
                        className="form-input"
                        value={periodoAnio}
                        onChange={(e) => handlePeriodoChange(periodoMes, parseInt(e.target.value, 10) || new Date().getFullYear())}
                      />
                    </div>
                  </div>
                )}

                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Nombre del Cliente</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Ej. Juan Pérez Rosales"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>DNI / RUC del Cliente</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="10728192031"
                      value={clienteNumDoc}
                      onChange={(e) => setClienteNumDoc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Empresa Emisora</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={empresaEmisora}
                      onChange={(e) => setEmpresaEmisora(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Fecha Emisión</label>
                    <input
                      type="text"
                      disabled
                      className="form-input"
                      value={new Date().toLocaleDateString()}
                    />
                  </div>
                </div>
              </div>

              {/* DATOS DE DETALLE */}
              <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                    2. Detalle de Ítems / Servicios
                  </h4>
                  <button type="button" className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }} onClick={handleAddDetalleRow}>
                    + Agregar Ítem
                  </button>
                </div>

                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Descripción del Ítem</th>
                      <th style={{ width: '80px' }}>Cant</th>
                      <th style={{ width: '110px' }}>P. Unit (S/)</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Total (S/)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((det, idx) => (
                      <tr key={idx}>
                        <td>
                          {tipoPago === 'VENTA_PRODUCTO' ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <select 
                                className="form-select"
                                style={{ width: '110px', padding: '0.35rem', fontSize: '0.8rem' }}
                                value={det.tipoItem || 'ARTICULO'}
                                onChange={(e) => {
                                  const tipo = e.target.value;
                                  const nuevos = [...detalles];
                                  nuevos[idx].tipoItem = tipo;
                                  nuevos[idx].id_producto = undefined;
                                  nuevos[idx].descripcion_item = '';
                                  nuevos[idx].precio_unitario = 0;
                                  nuevos[idx].searchTerm = '';
                                  setDetalles(nuevos);
                                }}
                              >
                                <option value="ARTICULO">ARTÍCULO</option>
                                <option value="SERVICIO">SERVICIO</option>
                              </select>
                              <SearchableSelect
                                placeholder="Buscar o Seleccionar Elemento..."
                                value={det.id_producto || ''}
                                options={productosCat
                                  .filter(p => (p.tipo || 'ARTICULO') === (det.tipoItem || 'ARTICULO'))
                                  .map(p => ({ id: p.id, label: `${p.descripcion} (S/ ${Number(p.precio).toFixed(2)})` }))}
                                onChange={(id) => {
                                  const prod = productosCat.find(p => p.id === id);
                                  const nuevos = [...detalles];
                                  nuevos[idx].id_producto = id;
                                  nuevos[idx].descripcion_item = prod ? prod.descripcion : '';
                                  nuevos[idx].precio_unitario = prod ? Number(prod.precio) : 0;
                                  setDetalles(nuevos);
                                }}
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              required
                              className="form-input"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                              placeholder="Ej. Servicio Cable Mensual Marzo"
                              value={det.descripcion_item}
                              onChange={(e) => handleDetalleChange(idx, 'descripcion_item', e.target.value)}
                            />
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            required
                            className="form-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                            value={det.cantidad}
                            onChange={(e) => handleDetalleChange(idx, 'cantidad', parseInt(e.target.value, 10) || 1)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="form-input"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                            value={det.precio_unitario}
                            onChange={(e) => handleDetalleChange(idx, 'precio_unitario', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                          S/ {(det.cantidad * det.precio_unitario).toFixed(2)}
                        </td>
                        <td>
                          {detalles.length > 1 && (
                            <button type="button" className="btn-danger" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleRemoveDetalleRow(idx)}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTAL CABECERA Y ACCIONES */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  Total General en Cabecera: S/ {totalGeneralCabecera.toFixed(2)}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-danger" onClick={() => setIsEmitirOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={tipoPago === 'PAGO_PLAN_MENSUAL' && selectedClienteId && !selectedContratoId ? true : false}>
                    Emitir {tipoComprobante.replace('_', ' ')} {estadoPago === 'POR_PAGAR' ? 'como Crédito' : 'Pagada'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa / Impresión de Comprobante Electrónico */}
      {previewComp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', backgroundColor: '#ffffff' }}>
            <div className="modal-header">
              <h3>Vista Previa del Comprobante</h3>
              <button className="close-btn" onClick={() => setPreviewComp(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Formato de Comprobante Físico/Virtual */}
            <div style={{ border: '2px dashed #0284c7', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>{previewComp.empresa_emisora}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Servicios de Televisión por Cable e Internet</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>RUC: 20601234567</div>
                </div>
                <div style={{ border: '1px solid #0284c7', padding: '0.5rem 1rem', borderRadius: '0.375rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{previewComp.tipo_comprobante.replace('_', ' ')} ELECTRÓNICA</div>
                  <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.1rem' }}>
                    {previewComp.serie}-{String(previewComp.numero).padStart(6, '0')}
                  </div>
                </div>
              </div>

              {/* Cabecera */}
              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div><strong>Cliente:</strong> {previewComp.cliente_nombre}</div>
                <div><strong>DNI / RUC:</strong> {previewComp.cliente_num_doc}</div>
                <div><strong>Fecha de Emisión:</strong> {new Date(previewComp.fecha_emision).toLocaleDateString()}</div>
                <div>
                  <strong>Estado Comercial:</strong> 
                  <span style={{ marginLeft: '4px', fontWeight: 700, color: previewComp.estado_pago === 'PAGADO' ? '#059669' : '#d97706' }}>
                    {previewComp.estado_pago?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Detalle */}
              <table className="data-table" style={{ fontSize: '0.85rem', marginBottom: '1rem', backgroundColor: '#ffffff' }}>
                <thead>
                  <tr>
                    <th>Ítem / Descripción</th>
                    <th style={{ textAlign: 'center' }}>Cant</th>
                    <th style={{ textAlign: 'right' }}>P. Unit</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewComp.detalles?.map((d: any, i: number) => (
                    <tr key={i}>
                      <td>{d.descripcion_item}</td>
                      <td style={{ textAlign: 'center' }}>{d.cantidad}</td>
                      <td style={{ textAlign: 'right' }}>S/ {Number(d.precio_unitario).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>S/ {Number(d.precio_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                </table>

              <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem' }}>
                Total General: S/ {Number(previewComp.total).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => window.print()}>
                <Printer size={16} /> Imprimir Comprobante
              </button>
              <button className="btn-danger" onClick={() => setPreviewComp(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
