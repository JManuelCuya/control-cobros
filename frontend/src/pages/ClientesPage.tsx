import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, X, Search, FileText } from 'lucide-react';
import { clientesApi, contratosApi, planesApi, pedidosApi } from '../services/api';
import toast from 'react-hot-toast';

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  tipo_doc?: string;
  num_doc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

interface Plan {
  id: number;
  descripcion: string;
  precio: string;
}

interface Contrato {
  id: number;
  id_cliente: number;
  direccion_servicio: string;
  dia_cobro: number;
  id_plan: number;
  id_pedido?: number;
  precio_acordado: string | number;
  estado: string;
  plan?: Plan;
}

export const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Modales de Contratos
  const [isContratosModalOpen, setIsContratosModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pedidosCliente, setPedidosCliente] = useState<any[]>([]);
  
  const [showContratoForm, setShowContratoForm] = useState(false);
  const [contratoFormData, setContratoFormData] = useState({
    direccion_servicio: '',
    dia_cobro: 15,
    id_plan: '',
    id_pedido: '',
    precio_acordado: 50.00
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_doc: 'DNI',
    num_doc: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesApi.getAll();
      setClientes(data);
      return data;
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const cargarPlanes = async () => {
    try {
      const data = await planesApi.getAll();
      setPlanes(data);
    } catch (err) {
      console.error('Error al cargar planes:', err);
    }
  };

  useEffect(() => {
    cargarClientes().then((data) => {
      const autoOpenId = localStorage.getItem('autoOpenContratosCliente');
      if (autoOpenId && data) {
        const cliente = data.find((c: Cliente) => c.id === Number(autoOpenId));
        if (cliente) {
          openContratosModal(cliente);
          setShowContratoForm(true); // Open the new contract form automatically too
        }
        localStorage.removeItem('autoOpenContratosCliente');
      }
    });
    cargarPlanes();
  }, []);

  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({
      nombre: '',
      apellido: '',
      tipo_doc: 'DNI',
      num_doc: '',
      telefono: '',
      email: '',
      direccion: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setFormData({
      nombre: c.nombre || '',
      apellido: c.apellido || '',
      tipo_doc: c.tipo_doc || 'DNI',
      num_doc: c.num_doc || '',
      telefono: c.telefono || '',
      email: c.email || '',
      direccion: c.direccion || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await clientesApi.update(editingCliente.id, formData);
        toast.success('Cliente actualizado con éxito');
      } else {
        await clientesApi.create(formData);
        toast.success('Cliente registrado con éxito');
      }
      setIsModalOpen(false);
      await cargarClientes();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cliente');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Desea eliminar este cliente?')) return;
    try {
      await clientesApi.delete(id);
      toast.success('Cliente eliminado');
      await cargarClientes();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar cliente');
    }
  };

  // ----- LOGICA DE CONTRATOS -----
  const openContratosModal = async (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsContratosModalOpen(true);
    setShowContratoForm(false);
    cargarContratosCliente(cliente.id);
    cargarPedidosCliente(cliente.id);
  };

  const cargarPedidosCliente = async (id_cliente: number) => {
    try {
      const allPedidos = await pedidosApi.getAll();
      const filtrados = allPedidos.filter((p: any) => p.id_cliente === id_cliente);
      setPedidosCliente(filtrados);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarContratosCliente = async (id_cliente: number) => {
    try {
      const data = await contratosApi.getByCliente(id_cliente);
      setContratos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanChange = (planId: string) => {
    const plan = planes.find(p => p.id === Number(planId));
    setContratoFormData({
      ...contratoFormData,
      id_plan: planId,
      precio_acordado: plan ? Number(plan.precio) : 0
    });
  };

  const submitContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;
    try {
      await contratosApi.create({
        id_cliente: selectedCliente.id,
        direccion_servicio: contratoFormData.direccion_servicio || selectedCliente.direccion,
        dia_cobro: Number(contratoFormData.dia_cobro),
        id_plan: Number(contratoFormData.id_plan),
        precio_acordado: Number(contratoFormData.precio_acordado),
        id_pedido: contratoFormData.id_pedido ? Number(contratoFormData.id_pedido) : undefined
      });
      setShowContratoForm(false);
      toast.success('Contrato creado con éxito');
      await cargarContratosCliente(selectedCliente.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear contrato');
    }
  };

  const eliminarContrato = async (id: number) => {
    if(!confirm('¿Eliminar esta suscripción/contrato? (Se perderá la matriz de cobros asociada)')) return;
    try {
      await contratosApi.delete(id);
      toast.success('Contrato eliminado con éxito');
      if (selectedCliente) cargarContratosCliente(selectedCliente.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestión de Clientes y Contratos</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <PlusCircle size={18} /> Registrar Cliente
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando clientes...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Doc Identidad</th>
                <th>Teléfono</th>
                <th>Dirección Principal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay clientes registrados</td>
                </tr>
              ) : (
                clientes.map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.nombre} {c.apellido}</td>
                    <td>{c.tipo_doc ? `${c.tipo_doc}: ${c.num_doc}` : c.num_doc || '-'}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.direccion || '-'}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#0284c7' }}
                        onClick={() => openContratosModal(c)}
                        title="Gestionar planes de cable"
                      >
                        <FileText size={14} /> Servicios
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#475569' }}
                        onClick={() => openEditModal(c)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleEliminar(c.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CREAR/EDITAR CLIENTE */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCliente ? `Editar Cliente #${editingCliente.id}` : 'Registrar Nuevo Cliente'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo Doc</label>
                  <select
                    className="form-select"
                    value={formData.tipo_doc}
                    onChange={(e) => setFormData({ ...formData, tipo_doc: e.target.value })}
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>N° Documento</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.num_doc}
                    onChange={(e) => setFormData({ ...formData, num_doc: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email / Correo</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-danger" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIONAR CONTRATOS */}
      {isContratosModalOpen && selectedCliente && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}><FileText size={20} style={{ display: 'inline', marginRight: '8px' }} /> Suscripciones y Servicios</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cliente: {selectedCliente.nombre} {selectedCliente.apellido}</p>
              </div>
              <button className="close-btn" onClick={() => setIsContratosModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {!showContratoForm ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="btn-primary" onClick={() => {
                    setContratoFormData({
                      direccion_servicio: selectedCliente.direccion || '',
                      dia_cobro: 15,
                      id_plan: planes.length > 0 ? String(planes[0].id) : '',
                      id_pedido: '',
                      precio_acordado: planes.length > 0 ? Number(planes[0].precio) : 50.00
                    });
                    setShowContratoForm(true);
                  }}>
                    <PlusCircle size={16} /> Agregar Nueva Instalación / Contrato
                  </button>
                </div>

                <div className="table-card" style={{ marginBottom: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Dirección de Instalación</th>
                        <th>Plan</th>
                        <th>Día de Pago</th>
                        <th>Monto (S/)</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Este cliente no tiene ningún servicio contratado aún.
                          </td>
                        </tr>
                      ) : (
                        contratos.map(c => (
                          <tr key={c.id}>
                            <td>C-{c.id} {c.id_pedido && <small style={{display:'block', color:'var(--text-muted)'}}>(Ped N°{c.id_pedido})</small>}</td>
                            <td>{c.direccion_servicio}</td>
                            <td style={{ fontWeight: 600 }}>{c.plan?.descripcion || 'Sin Plan'}</td>
                            <td style={{ color: '#0284c7', fontWeight: 800 }}>Día {c.dia_cobro}</td>
                            <td>S/ {Number(c.precio_acordado).toFixed(2)}</td>
                            <td><span className="badge badge-success">{c.estado}</span></td>
                            <td>
                              <button className="btn-danger" style={{ padding: '0.2rem 0.4rem' }} onClick={() => eliminarContrato(c.id)}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <form onSubmit={submitContrato} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-blue)' }}>Registrar Nuevo Contrato de Cable</h4>
                
                <div className="form-group">
                  <label>Dirección de la Instalación (Sede / Domicilio)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={contratoFormData.direccion_servicio}
                    onChange={(e) => setContratoFormData({ ...contratoFormData, direccion_servicio: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Plan Contratado</label>
                    <select
                      className="form-select"
                      required
                      value={contratoFormData.id_plan}
                      onChange={(e) => handlePlanChange(e.target.value)}
                    >
                      <option value="">-- Seleccionar Plan --</option>
                      {planes.map(p => (
                        <option key={p.id} value={p.id}>{p.descripcion} (S/ {Number(p.precio).toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Día de Cobro (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      className="form-input"
                      style={{ fontWeight: 800, color: '#0284c7' }}
                      value={contratoFormData.dia_cobro}
                      onChange={(e) => setContratoFormData({ ...contratoFormData, dia_cobro: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Precio Final (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={contratoFormData.precio_acordado}
                      onChange={(e) => setContratoFormData({ ...contratoFormData, precio_acordado: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Vincular a Pedido N° (Opcional)</label>
                  <select
                    className="form-select"
                    value={contratoFormData.id_pedido}
                    onChange={(e) => setContratoFormData({ ...contratoFormData, id_pedido: e.target.value })}
                  >
                    <option value="">-- Sin vinculación / Venta Directa --</option>
                    {pedidosCliente.map(p => (
                      <option key={p.id} value={p.id}>Pedido #{p.id} - {new Date(p.fecha).toLocaleDateString()} (Total: S/ {Number(p.total).toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-danger" onClick={() => setShowContratoForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar Contrato
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
