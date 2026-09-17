import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X, UserCheck, FileText, PlusCircle } from 'lucide-react';
import { suscriptoresApi, sucursalesApi, ubigeoApi, contratosApi, planesApi, pedidosApi, decodificadoresApi } from '../services/api';
import toast from 'react-hot-toast';
import { confirmDialog } from '../utils/confirmDialog';

export const SuscriptoresPage: React.FC = () => {
  const [suscriptores, setSuscriptores] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modales de Contratos
  const [isContratosModalOpen, setIsContratosModalOpen] = useState(false);
  const [selectedSuscriptor, setSelectedSuscriptor] = useState<any>(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [pedidosSuscriptor, setPedidosSuscriptor] = useState<any[]>([]);
  const [equiposSuscriptor, setEquiposSuscriptor] = useState<any[]>([]);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    ruc_dni: '',
    detalles: '',
    dia_pago: '',
    nombre: '',
    apellido: '',
    id_departamento: '',
    id_distrito: '',
    direccion: '',
    telefonos: '',
    id_sucursal: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suscData, sucData, depData, planesData] = await Promise.all([
        suscriptoresApi.getAll(),
        sucursalesApi.getAll(),
        ubigeoApi.getDepartamentos(),
        planesApi.getAll()
      ]);
      setSuscriptores(suscData);
      setSucursales(sucData);
      setDepartamentos(depData);
      setPlanes(planesData);
    } catch (err: any) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setFormData({
      ruc_dni: s.ruc_dni || '',
      detalles: s.detalles || '',
      dia_pago: s.dia_pago ? String(s.dia_pago) : '',
      nombre: s.nombre || '',
      apellido: s.apellido || '',
      id_departamento: s.id_departamento ? String(s.id_departamento) : '',
      id_provincia: s.id_provincia ? String(s.id_provincia) : '',
      id_distrito: s.id_distrito ? String(s.id_distrito) : '',
      direccion: s.direccion || '',
      telefonos: s.telefonos || '',
      id_sucursal: s.id_sucursal ? String(s.id_sucursal) : ''
    });

    if (s.id_departamento) cargarProvincias(s.id_departamento);
    if (s.id_provincia) cargarDistritos(s.id_provincia);

    setIsModalOpen(true);
  };

  // ----- LOGICA DE CONTRATOS -----
  const openContratosModal = async (s: any) => {
    setSelectedSuscriptor(s);
    setIsContratosModalOpen(true);
    setShowContratoForm(false);
    cargarContratosSuscriptor(s.id);
    cargarPedidosSuscriptor(s.id_cliente); // Assuming pedidios still mapped by id_cliente
    cargarEquiposSuscriptor(s.id);
  };

  const cargarEquiposSuscriptor = async (id_suscriptor: number) => {
    try {
      const allEquipos = await decodificadoresApi.getAll();
      setEquiposSuscriptor(allEquipos.filter((e: any) => e.id_suscriptor === id_suscriptor));
      setDisponibles(allEquipos.filter((e: any) => e.estado === 'EN_ALMACEN'));
    } catch (err) {
      console.error(err);
    }
  };

  const cargarPedidosSuscriptor = async (id_cliente?: number) => {
    if (!id_cliente) {
      setPedidosSuscriptor([]);
      return;
    }
    try {
      const allPedidos = await pedidosApi.getAll();
      const filtrados = allPedidos.filter((p: any) => p.id_cliente === id_cliente);
      setPedidosSuscriptor(filtrados);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarContratosSuscriptor = async (id_suscriptor: number) => {
    try {
      const data = await contratosApi.getBySuscriptor(id_suscriptor);
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
    if (!selectedSuscriptor) return;
    try {
      await contratosApi.create({
        id_suscriptor: selectedSuscriptor.id,
        direccion_servicio: contratoFormData.direccion_servicio || selectedSuscriptor.direccion,
        dia_cobro: Number(contratoFormData.dia_cobro),
        id_plan: Number(contratoFormData.id_plan),
        precio_acordado: Number(contratoFormData.precio_acordado),
        id_pedido: contratoFormData.id_pedido ? Number(contratoFormData.id_pedido) : undefined,
        fecha_inicio: contratoFormData.fecha_inicio
      });
      setShowContratoForm(false);
      toast.success('Contrato creado con éxito');
      await cargarContratosSuscriptor(selectedSuscriptor.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear contrato');
    }
  };

  const actualizarFechaInicioContrato = async (idContrato: number, nuevaFecha: string) => {
    try {
      await contratosApi.update(idContrato, { fecha_inicio: nuevaFecha });
      toast.success('Fecha de inicio de suscripción actualizada');
      if (selectedSuscriptor) cargarContratosSuscriptor(selectedSuscriptor.id);
    } catch (err: any) {
      toast.error('Error al actualizar fecha de inicio');
    }
  };

  const eliminarContrato = async (id: number) => {
    if(!confirm('¿Eliminar esta suscripción/contrato? (Se perderá la matriz de cobros asociada)')) return;
    try {
      await contratosApi.delete(id);
      toast.success('Contrato eliminado con éxito');
      if (selectedSuscriptor) cargarContratosSuscriptor(selectedSuscriptor.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const asignarEquipoASuscriptor = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idEquipo = Number(e.target.value);
    if (!idEquipo || !selectedSuscriptor) return;
    try {
      // Pasamos la fecha actual (hoy) en formato ISO (YYYY-MM-DD)
      const fechaHoy = new Date().toISOString().split('T')[0];
      await decodificadoresApi.asignar(idEquipo, selectedSuscriptor.id, 'suscriptor', fechaHoy);
      toast.success('Equipo asignado correctamente');
      cargarEquiposSuscriptor(selectedSuscriptor.id);
      cargarContratosSuscriptor(selectedSuscriptor.id);
      e.target.value = ''; // Reset select
    } catch (err: any) {
      toast.error('Error al asignar equipo');
    }
  };

  const actualizarFechaAsignacionEquipo = async (idEquipo: number, nuevaFecha: string) => {
    try {
      await decodificadoresApi.update(idEquipo, { fecha_asignacion: nuevaFecha });
      toast.success('Fecha de instalación actualizada');
      if (selectedSuscriptor) cargarEquiposSuscriptor(selectedSuscriptor.id);
    } catch (err: any) {
      toast.error('Error al actualizar fecha');
    }
  };

  const desvincularEquipo = async (idEquipo: number) => {
    if(!confirm('¿Desvincular este equipo y devolver a almacén?')) return;
    try {
      await decodificadoresApi.asignar(idEquipo, null);
      toast.success('Equipo devuelto a almacén');
      if (selectedSuscriptor) {
        cargarEquiposSuscriptor(selectedSuscriptor.id);
        cargarContratosSuscriptor(selectedSuscriptor.id);
      }
    } catch (err: any) {
      toast.error('Error al desvincular');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData,
        id_sucursal: formData.id_sucursal ? Number(formData.id_sucursal) : undefined,
        id_departamento: formData.id_departamento ? Number(formData.id_departamento) : undefined,
        id_provincia: formData.id_provincia ? Number(formData.id_provincia) : undefined,
        id_distrito: formData.id_distrito ? Number(formData.id_distrito) : undefined,
        dia_pago: formData.dia_pago ? Number(formData.dia_pago) : undefined
      };
      if (editingId) {
        await suscriptoresApi.update(editingId, payload);
        toast.success('Suscriptor actualizado');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog('¿Desea eliminar este suscriptor?'))) return;
    try {
      await suscriptoresApi.delete(id);
      toast.success('Suscriptor eliminado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const filtered = suscriptores.filter(s => 
    (s.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (s.apellido?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.ruc_dni?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><UserCheck size={24} style={{ display: 'inline', marginRight: '8px' }}/> Lista de Suscriptores</h1>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellido, DNI o código..." 
            className="form-input" 
            style={{ paddingLeft: '35px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando suscriptores...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Suscriptor</th>
                  <th>RUC/DNI</th>
                  <th>Día de Pago</th>
                  <th>Teléfono</th>
                  <th>Plan Actual</th>
                  <th>Equipos</th>
                  <th>Sucursal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron suscriptores</td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{s.codigo}</td>
                      <td style={{ fontWeight: 600 }}>{s.nombre} {s.apellido}</td>
                      <td>{s.ruc_dni || '-'}</td>
                      <td style={{ fontWeight: 800, color: '#10b981' }}>Día {s.dia_pago || '-'}</td>
                      <td>{s.telefonos || '-'}</td>
                      <td>
                        {(() => {
                          const total = s.contratos?.reduce((sum: number, c: any) => sum + Number(c.precio_acordado || 0), 0) || 0;
                          return <span className={total > 0 ? 'badge badge-success' : ''}>{total > 0 ? `S/ ${total.toFixed(2)}` : 'S/ 0.00'}</span>;
                        })()}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.decodificadores?.length || 0}</td>
                      <td>{s.sucursal?.descripcion || '-'}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#0284c7' }}
                          onClick={() => openContratosModal(s)}
                          title="Gestionar planes de cable"
                        >
                          <FileText size={14} />
                        </button>
                        <button className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#475569' }} onClick={() => openEditModal(s)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-danger" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleDelete(s.id)} title="Eliminar">
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Editar Suscriptor</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>RUC/DNI*</label>
                  <input type="text" required className="form-input" value={formData.ruc_dni} onChange={e => setFormData({...formData, ruc_dni: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Día de Pago</label>
                  <input type="number" min="1" max="31" required className="form-input" value={formData.dia_pago} onChange={e => setFormData({...formData, dia_pago: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Nombres*</label>
                  <input type="text" required className="form-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Apellidos*</label>
                  <input type="text" required className="form-input" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Dirección*</label>
                  <input type="text" required className="form-input" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Teléfonos*</label>
                  <input type="text" required className="form-input" value={formData.telefonos} onChange={e => setFormData({...formData, telefonos: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Detalles</label>
                  <input type="text" className="form-input" value={formData.detalles} onChange={e => setFormData({...formData, detalles: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Asignar a (Sucursal)*</label>
                  <select className="form-select" required value={formData.id_sucursal} onChange={e => setFormData({...formData, id_sucursal: e.target.value})}>
                    <option value="">--SELECCIONAR--</option>
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIONAR CONTRATOS */}
      {isContratosModalOpen && selectedSuscriptor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}><FileText size={20} style={{ display: 'inline', marginRight: '8px' }} /> Suscripciones y Servicios</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suscriptor: {selectedSuscriptor.nombre} {selectedSuscriptor.apellido}</p>
              </div>
              <button className="close-btn" onClick={() => { setIsContratosModalOpen(false); fetchData(); }}>
                <X size={20} />
              </button>
            </div>

            {!showContratoForm ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className="btn-primary" onClick={() => {
                    setContratoFormData({
                      direccion_servicio: selectedSuscriptor.direccion || '',
                      dia_cobro: selectedSuscriptor.dia_pago || 15,
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
                              Este suscriptor no tiene ningún servicio contratado aún.
                            </td>
                          </tr>
                        ) : (
                          contratos.map(c => (
                            <tr key={c.id}>
                              <td>C-{c.id} {c.id_pedido && <small style={{display:'block', color:'var(--text-muted)'}}>(Ped N°{c.id_pedido})</small>}</td>
                              <td>{c.direccion_servicio}</td>
                              <td style={{ fontWeight: 600 }}>{c.plan ? `${c.plan.descripcion} (S/ ${Number(c.plan.precio).toFixed(2)})` : 'Sin Plan'}</td>
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
                    <select className="form-select" style={{ width: '300px', fontSize: '0.85rem', padding: '0.4rem' }} onChange={asignarEquipoASuscriptor} defaultValue="">
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
                            <th>Plan Asignado</th>
                            <th>Monto (S/)</th>
                            <th>Proveedor</th>
                            <th>F. Instalación</th>
                            <th>Estado</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {equiposSuscriptor.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No tiene equipos instalados</td>
                            </tr>
                          ) : (
                            equiposSuscriptor.map(eq => (
                              <tr key={eq.id}>
                                <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{eq.serial_ird}</td>
                                <td>{eq.sticker || '-'}</td>
                                <td style={{ fontWeight: 600 }}>{eq.plan?.descripcion || 'Sin Plan'}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>S/ {Number(eq.plan?.precio || 0).toFixed(2)}</td>
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
                    {pedidosSuscriptor.map(p => (
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
