import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, X, Search, FileText } from 'lucide-react';
import { clientesApi, contratosApi, planesApi, pedidosApi, sucursalesApi, decodificadoresApi, suscriptoresApi, ubigeoApi } from '../services/api';
import toast from 'react-hot-toast';
import { confirmDialog } from '../utils/confirmDialog';

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  tipo_doc?: string;
  num_doc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  id_sucursal?: number;
  sucursal?: any;
  id_departamento?: number;
  id_provincia?: number;
  id_distrito?: number;
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
  fecha_inicio?: string;
}

export const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Modales de Contratos
  const [isContratosModalOpen, setIsContratosModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pedidosCliente, setPedidosCliente] = useState<any[]>([]);
  const [equiposCliente, setEquiposCliente] = useState<any[]>([]);
  const [disponibles, setDisponibles] = useState<any[]>([]);
  
  const [showContratoForm, setShowContratoForm] = useState(false);
  const [contratoFormData, setContratoFormData] = useState({
    direccion_servicio: '',
    id_plan: '',
    dia_cobro: '15',
    id_pedido: '',
    precio_acordado: 50.00,
    fecha_inicio: new Date().toISOString().split('T')[0]
  });

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertFormData, setConvertFormData] = useState({
    ruc_dni: '',
    detalles: '',
    dia_pago: '',
    nombre: '',
    apellido: '',
    id_departamento: '',
    id_provincia: '',
    id_distrito: '',
    direccion: '',
    telefonos: '',
    id_sucursal: '',
    id_cliente: ''
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_doc: 'DNI',
    num_doc: '',
    telefono: '',
    email: '',
    direccion: '',
    id_sucursal: '',
    id_departamento: '',
    id_provincia: '',
    id_distrito: ''
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

  
  const cargarSucursales = async () => {
    try {
      const data = await sucursalesApi.getAll();
      setSucursales(data);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
    }
  };

  const cargarDepartamentos = async () => {
    try {
      const data = await ubigeoApi.getDepartamentos();
      setDepartamentos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarProvincias = async (idDep: number) => {
    try {
      const data = await ubigeoApi.getProvincias(idDep);
      setProvincias(data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarDistritos = async (idProv: number) => {
    try {
      const data = await ubigeoApi.getDistritos(idProv);
      setDistritos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarSucursales();
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
      direccion: '',
      id_sucursal: '',
      id_departamento: '',
      id_provincia: '',
      id_distrito: ''
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
      direccion: c.direccion || '',
      id_sucursal: c.id_sucursal ? String(c.id_sucursal) : '',
      id_departamento: c.id_departamento ? String(c.id_departamento) : '',
      id_provincia: c.id_provincia ? String(c.id_provincia) : '',
      id_distrito: c.id_distrito ? String(c.id_distrito) : ''
    });

    if (c.id_departamento) cargarProvincias(c.id_departamento);
    if (c.id_provincia) cargarDistritos(c.id_provincia);

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_sucursal: formData.id_sucursal ? Number(formData.id_sucursal) : undefined,
        id_departamento: formData.id_departamento ? Number(formData.id_departamento) : undefined,
        id_provincia: formData.id_provincia ? Number(formData.id_provincia) : undefined,
        id_distrito: formData.id_distrito ? Number(formData.id_distrito) : undefined
      };
      
      if (editingCliente) {
        await clientesApi.update(editingCliente.id, payload);
        toast.success('Cliente actualizado con éxito');
      } else {
        await clientesApi.create(payload);
        toast.success('Cliente registrado con éxito');
      }
      setIsModalOpen(false);
      await cargarClientes();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cliente');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!(await confirmDialog('¿Desea eliminar este cliente?'))) return;
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
    cargarEquiposCliente(cliente.id);
  };

  const cargarEquiposCliente = async (id_cliente: number) => {
    try {
      const allEquipos = await decodificadoresApi.getAll();
      setEquiposCliente(allEquipos.filter((e: any) => e.id_cliente === id_cliente));
      setDisponibles(allEquipos.filter((e: any) => e.estado === 'EN_ALMACEN'));
    } catch (err) {
      console.error(err);
    }
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
        id_pedido: contratoFormData.id_pedido ? Number(contratoFormData.id_pedido) : undefined,
        fecha_inicio: contratoFormData.fecha_inicio
      });
      setShowContratoForm(false);
      toast.success('Contrato creado con éxito');
      await cargarContratosCliente(selectedCliente.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear contrato');
    }
  };

  const actualizarFechaInicioContrato = async (idContrato: number, nuevaFecha: string) => {
    try {
      await contratosApi.update(idContrato, { fecha_inicio: nuevaFecha });
      toast.success('Fecha de inicio de suscripción actualizada');
      if (selectedCliente) cargarContratosCliente(selectedCliente.id);
    } catch (err: any) {
      toast.error('Error al actualizar fecha de inicio');
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

  const asignarEquipoACliente = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idEquipo = Number(e.target.value);
    if (!idEquipo || !selectedCliente) return;
    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      await decodificadoresApi.asignar(idEquipo, selectedCliente.id, 'cliente', fechaHoy);
      toast.success('Equipo asignado correctamente');
      cargarEquiposCliente(selectedCliente.id);
      cargarContratosCliente(selectedCliente.id);
      e.target.value = ''; // Reset select
    } catch (err: any) {
      toast.error('Error al asignar equipo');
    }
  };

  const actualizarFechaAsignacionEquipo = async (idEquipo: number, nuevaFecha: string) => {
    try {
      await decodificadoresApi.update(idEquipo, { fecha_asignacion: nuevaFecha });
      toast.success('Fecha de instalación actualizada');
      if (selectedCliente) cargarEquiposCliente(selectedCliente.id);
    } catch (err: any) {
      toast.error('Error al actualizar fecha');
    }
  };

  const desvincularEquipo = async (idEquipo: number) => {
    if(!confirm('¿Desvincular este equipo y devolver a almacén?')) return;
    try {
      await decodificadoresApi.asignar(idEquipo, null);
      toast.success('Equipo devuelto a almacén');
      if (selectedCliente) {
        cargarEquiposCliente(selectedCliente.id);
        cargarContratosCliente(selectedCliente.id);
      }
    } catch (err: any) {
      toast.error('Error al desvincular');
    }
  };

  const openConvertModal = (c: Cliente) => {
    setSelectedCliente(c);
    setConvertFormData({
      ruc_dni: c.num_doc || '',
      detalles: '',
      dia_pago: '15',
      nombre: c.nombre || '',
      apellido: c.apellido || '',
      id_departamento: c.id_departamento ? String(c.id_departamento) : '',
      id_provincia: c.id_provincia ? String(c.id_provincia) : '',
      id_distrito: c.id_distrito ? String(c.id_distrito) : '',
      direccion: c.direccion || '',
      telefonos: c.telefono || '',
      id_sucursal: c.id_sucursal ? String(c.id_sucursal) : '',
      id_cliente: String(c.id)
    });
    
    if (c.id_departamento) cargarProvincias(c.id_departamento);
    if (c.id_provincia) cargarDistritos(c.id_provincia);

    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...convertFormData,
        id_sucursal: convertFormData.id_sucursal ? Number(convertFormData.id_sucursal) : undefined,
        id_departamento: convertFormData.id_departamento ? Number(convertFormData.id_departamento) : undefined,
        id_provincia: convertFormData.id_provincia ? Number(convertFormData.id_provincia) : undefined,
        id_distrito: convertFormData.id_distrito ? Number(convertFormData.id_distrito) : undefined,
        dia_pago: convertFormData.dia_pago ? Number(convertFormData.dia_pago) : undefined
      };
      await suscriptoresApi.create(payload);
      toast.success('Convertido a Suscriptor exitosamente');
      setIsConvertModalOpen(false);
      // Optional: Maybe refresh the list or show a link
    } catch (err: any) {
      toast.error(err.message || 'Error al convertir a suscriptor');
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
          <div className="table-responsive">
                <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Doc Identidad</th>
                <th>Sucursal</th>
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
                    <td>{c.sucursal ? c.sucursal.descripcion : '-'}</td>
                    <td>
                      {c.telefono ? (
                        <a 
                          href={`https://wa.me/${c.telefono.replace(/\D/g,'')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#25D366', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Enviar WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          {c.telefono}
                        </a>
                      ) : '-'}
                    </td>
                    <td>{c.direccion || '-'}</td>
                    <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#10b981' }}
                        onClick={() => openConvertModal(c)}
                        title="Convertir a Suscriptor"
                      >
                        <PlusCircle size={14} />
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#0284c7' }}
                        onClick={() => openContratosModal(c)}
                        title="Gestionar planes de cable"
                      >
                        <FileText size={14} />
                      </button>
                      <button 
                        className="btn-primary"  
                        style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#475569' }}
                        onClick={() => openEditModal(c)}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                        onClick={() => handleEliminar(c.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
              </div>
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
              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
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

              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sucursal</label>
                  <select
                    className="form-select"
                    value={formData.id_sucursal}
                    onChange={(e) => setFormData({ ...formData, id_sucursal: e.target.value })}
                  >
                    <option value="">-- Sin Sucursal --</option>
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Departamento</label>
                  <select 
                    className="form-select" 
                    value={formData.id_departamento} 
                    onChange={e => {
                      setFormData({...formData, id_departamento: e.target.value, id_provincia: '', id_distrito: ''});
                      if (e.target.value) cargarProvincias(Number(e.target.value));
                      else setProvincias([]);
                    }}
                  >
                    <option value="">--Seleccionar--</option>
                    {departamentos.map(d => (
                      <option key={d.id} value={d.id}>{d.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Provincia</label>
                  <select 
                    className="form-select" 
                    value={formData.id_provincia} 
                    onChange={e => {
                      setFormData({...formData, id_provincia: e.target.value, id_distrito: ''});
                      if (e.target.value) cargarDistritos(Number(e.target.value));
                      else setDistritos([]);
                    }}
                    disabled={!formData.id_departamento}
                  >
                    <option value="">--Seleccionar--</option>
                    {provincias.map(p => (
                      <option key={p.id} value={p.id}>{p.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Distrito</label>
                  <select 
                    className="form-select" 
                    value={formData.id_distrito} 
                    onChange={e => setFormData({...formData, id_distrito: e.target.value})}
                    disabled={!formData.id_provincia}
                  >
                    <option value="">--Seleccionar--</option>
                    {distritos.map(d => (
                      <option key={d.id} value={d.id}>{d.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
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
              <button className="close-btn" onClick={() => { setIsContratosModalOpen(false); cargarClientes(); }}>
                <X size={20} />
              </button>
            </div>

            {!showContratoForm ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="btn-primary" onClick={() => {
                    setContratoFormData({
                      direccion_servicio: selectedCliente.direccion || '',
                      dia_cobro: '15',
                      id_plan: planes.length > 0 ? String(planes[0].id) : '',
                      id_pedido: '',
                      precio_acordado: planes.length > 0 ? Number(planes[0].precio) : 50.00,
                      fecha_inicio: new Date().toISOString().split('T')[0]
                    });
                    setShowContratoForm(true);
                  }}>
                    <PlusCircle size={16} /> Agregar Nueva Suscripción
                  </button>
                </div>

                <div className="table-card" style={{ marginBottom: 0 }}>
                  <div className="table-responsive">
                <table className="data-table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Dirección de Instalación</th>
                          <th>Plan</th>
                          <th>Día de Pago</th>
                          <th>Monto (S/)</th>
                          <th>F. Inicio</th>
                          <th>Estado</th>
                          <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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
                            <td>
                              <input 
                                type="date" 
                                className="form-input" 
                                style={{ padding: '0.2rem', fontSize: '0.8rem', width: '120px' }}
                                defaultValue={c.fecha_inicio ? new Date(c.fecha_inicio).toISOString().split('T')[0] : ''}
                                onBlur={(e) => {
                                  const oldVal = c.fecha_inicio ? new Date(c.fecha_inicio).toISOString().split('T')[0] : '';
                                  if (e.target.value !== oldVal) {
                                    actualizarFechaInicioContrato(c.id, e.target.value);
                                  }
                                }}
                              />
                            </td>
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
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                    Equipos Instalados (MAC / Serie / IRD)
                    <select className="form-select" style={{ width: '300px', fontSize: '0.85rem', padding: '0.4rem' }} onChange={asignarEquipoACliente} defaultValue="">
                      <option value="" disabled>+ Asignar equipo del almacén</option>
                      {disponibles.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.serial_ird} ({eq.sticker || 'Sin sticker'})</option>
                      ))}
                    </select>
                  </h4>
                  <div className="table-card" style={{ marginBottom: 0 }}>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>N° Serie / IRD</th>
                            <th>Sticker</th>
                            <th>Proveedor</th>
                            <th>F. Instalación</th>
                            <th>Estado</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {equiposCliente.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No tiene equipos instalados</td>
                            </tr>
                          ) : (
                            equiposCliente.map(eq => (
                              <tr key={eq.id}>
                                <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{eq.serial_ird}</td>
                                <td>{eq.sticker || '-'}</td>
                                <td>{eq.proveedor?.razon_social || '-'}</td>
                                <td>
                                  <input 
                                    type="date" 
                                    className="form-input" 
                                    style={{ padding: '0.2rem', fontSize: '0.8rem', width: '120px' }}
                                    defaultValue={eq.fecha_asignacion ? new Date(eq.fecha_asignacion).toISOString().split('T')[0] : ''}
                                    onBlur={(e) => {
                                      const oldVal = eq.fecha_asignacion ? new Date(eq.fecha_asignacion).toISOString().split('T')[0] : '';
                                      if (e.target.value !== oldVal) {
                                        actualizarFechaAsignacionEquipo(eq.id, e.target.value);
                                      }
                                    }}
                                  />
                                </td>
                                <td><span className="badge badge-success">{eq.estado.replace(/_/g, ' ')}</span></td>
                                <td>
                                  <button className="btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => desvincularEquipo(eq.id)} title="Desvincular">
                                    <X size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={submitContrato} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-blue)' }}>Registrar Nueva Suscripción</h4>
                
                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                  
                  <div className="form-group">
                    <label>Fecha de Inicio (Control de Cobros)</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={contratoFormData.fecha_inicio}
                      onChange={(e) => setContratoFormData({ ...contratoFormData, fecha_inicio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
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
                      onChange={(e) => setContratoFormData({ ...contratoFormData, dia_cobro: e.target.value })}
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
      {/* MODAL CONVERTIR A SUSCRIPTOR */}
      {isConvertModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Convertir a Suscriptor</h3>
              <button className="close-btn" onClick={() => setIsConvertModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleConvertSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Código*</label>
                  <input type="text" disabled className="form-input" placeholder="(Se autogenerará)" />
                </div>
                <div className="form-group">
                  <label>RUC/DNI*</label>
                  <input type="text" required className="form-input" value={convertFormData.ruc_dni} onChange={e => setConvertFormData({...convertFormData, ruc_dni: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Detalles</label>
                  <input type="text" className="form-input" value={convertFormData.detalles} onChange={e => setConvertFormData({...convertFormData, detalles: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Día de Pago</label>
                  <input type="number" min="1" max="31" required className="form-input" value={convertFormData.dia_pago} onChange={e => setConvertFormData({...convertFormData, dia_pago: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Nombres*</label>
                  <input type="text" required className="form-input" value={convertFormData.nombre} onChange={e => setConvertFormData({...convertFormData, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Apellidos*</label>
                  <input type="text" required className="form-input" value={convertFormData.apellido} onChange={e => setConvertFormData({...convertFormData, apellido: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Departamento</label>
                  <select 
                    className="form-select" 
                    value={convertFormData.id_departamento} 
                    onChange={e => {
                      setConvertFormData({...convertFormData, id_departamento: e.target.value, id_provincia: '', id_distrito: ''});
                      if (e.target.value) cargarProvincias(Number(e.target.value));
                      else setProvincias([]);
                    }}
                  >
                    <option value="">--Seleccionar--</option>
                    {departamentos.map(d => (
                      <option key={d.id} value={d.id}>{d.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Provincia</label>
                  <select 
                    className="form-select" 
                    value={convertFormData.id_provincia} 
                    onChange={e => {
                      setConvertFormData({...convertFormData, id_provincia: e.target.value, id_distrito: ''});
                      if (e.target.value) cargarDistritos(Number(e.target.value));
                      else setDistritos([]);
                    }}
                    disabled={!convertFormData.id_departamento}
                  >
                    <option value="">--Seleccionar--</option>
                    {provincias.map(p => (
                      <option key={p.id} value={p.id}>{p.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Distrito</label>
                  <select 
                    className="form-select" 
                    value={convertFormData.id_distrito} 
                    onChange={e => setConvertFormData({...convertFormData, id_distrito: e.target.value})}
                    disabled={!convertFormData.id_provincia}
                  >
                    <option value="">--Seleccionar--</option>
                    {distritos.map(d => (
                      <option key={d.id} value={d.id}>{d.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Dirección*</label>
                  <input type="text" required className="form-input" value={convertFormData.direccion} onChange={e => setConvertFormData({...convertFormData, direccion: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Teléfonos*</label>
                  <input type="text" required className="form-input" value={convertFormData.telefonos} onChange={e => setConvertFormData({...convertFormData, telefonos: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Asignar a (Sucursal)*</label>
                <select className="form-select" required value={convertFormData.id_sucursal} onChange={e => setConvertFormData({...convertFormData, id_sucursal: e.target.value})}>
                  <option value="">--SELECCIONAR--</option>
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.descripcion}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsConvertModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#10b981' }}>Agregar Suscriptor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
