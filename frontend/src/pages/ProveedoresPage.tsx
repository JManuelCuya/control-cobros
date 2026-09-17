import React, { useState, useEffect } from 'react';
import { confirmDialog } from '../utils/confirmDialog';
import { Truck, PlusCircle, Edit2, Trash2, X, ArrowLeft, Tv, Save, Check } from 'lucide-react';
import { proveedoresApi, ubigeoApi, planesApi, decodificadoresApi } from '../services/api';
import toast from 'react-hot-toast';

export const ProveedoresPage: React.FC = () => {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [decodificadores, setDecodificadores] = useState<any[]>([]);

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<'datos' | 'decodificadores'>('datos');
  
  const [editingProv, setEditingProv] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    razon_social: '',
    num_doc: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    id_departamento: '',
    id_provincia: '',
    id_distrito: '',
    direccion: '',
    telefono: '',
    id_plan: '',
    precio: '',
    email: '',
    password: '',
    fecha_final_promocion: ''
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [provData, deptData, planData, decosData] = await Promise.all([
        proveedoresApi.getAll(),
        ubigeoApi.getDepartamentos(),
        planesApi.getAll(),
        decodificadoresApi.getAll()
      ]);
      setProveedores(provData);
      setDepartamentos(deptData);
      setPlanes(planData);
      setDecodificadores(decosData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleDepartamentoChange = async (id_departamento: number) => {
    setFormData(prev => ({ ...prev, id_departamento: String(id_departamento), id_provincia: '', id_distrito: '' }));
    if (!id_departamento) {
      setProvincias([]);
      setDistritos([]);
      return;
    }
    try {
      const data = await ubigeoApi.getProvincias(id_departamento);
      setProvincias(data);
      setDistritos([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProvinciaChange = async (id_provincia: number) => {
    setFormData(prev => ({ ...prev, id_provincia: String(id_provincia), id_distrito: '' }));
    if (!id_provincia) {
      setDistritos([]);
      return;
    }
    try {
      const data = await ubigeoApi.getDistritos(id_provincia);
      setDistritos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateView = () => {
    setEditingProv(null);
    setFormData({
      codigo: '',
      razon_social: '',
      num_doc: '',
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      id_departamento: '',
      id_provincia: '',
      id_distrito: '',
      direccion: '',
      telefono: '',
      id_plan: '',
      precio: '',
      email: '',
      password: '',
      fecha_final_promocion: ''
    });
    setProvincias([]);
    setDistritos([]);
    setActiveTab('datos');
    setViewMode('detail');
  };

  const openEditView = async (p: any) => {
    setEditingProv(p);
    
    if (p.id_departamento) {
      const provs = await ubigeoApi.getProvincias(p.id_departamento);
      setProvincias(provs);
      if (p.id_provincia) {
        const dists = await ubigeoApi.getDistritos(p.id_provincia);
        setDistritos(dists);
      }
    } else {
      setProvincias([]);
      setDistritos([]);
    }

    setFormData({
      codigo: p.codigo || '',
      razon_social: p.razon_social || '',
      num_doc: p.num_doc || '',
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      fecha_nacimiento: p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toISOString().split('T')[0] : '',
      id_departamento: p.id_departamento ? String(p.id_departamento) : '',
      id_provincia: p.id_provincia ? String(p.id_provincia) : '',
      id_distrito: p.id_distrito ? String(p.id_distrito) : '',
      direccion: p.direccion || '',
      telefono: p.telefono || '',
      id_plan: p.id_plan ? String(p.id_plan) : '',
      precio: p.precio ? String(p.precio) : '',
      email: p.email || p.correo || '',
      password: p.password || '',
      fecha_final_promocion: p.fecha_final_promocion ? new Date(p.fecha_final_promocion).toISOString().split('T')[0] : ''
    });
    setActiveTab('datos');
    setViewMode('detail');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (editingProv) {
        result = await proveedoresApi.update(editingProv.id, formData);
        toast.success('Proveedor actualizado');
      } else {
        result = await proveedoresApi.create(formData);
        toast.success('Proveedor registrado');
        setEditingProv(result); // Set as editing to allow adding decos
      }
      await cargarDatos();
      if (!editingProv) {
        openEditView(result); // stay in detail view but now it has ID
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar proveedor');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!(await confirmDialog('¿Desea eliminar este proveedor?'))) return;
    try {
      await proveedoresApi.delete(id);
      toast.success('Proveedor eliminado');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar proveedor');
    }
  };

  const decosProveedor = decodificadores.filter(d => editingProv && d.id_proveedor === editingProv.id);

  if (viewMode === 'detail') {
    return (
      <div className="page-container">
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <button className="btn-secondary" onClick={() => setViewMode('list')} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Volver a la lista
            </button>
            <h1 className="page-title">{editingProv ? `Perfil del Proveedor: ${editingProv.razon_social || editingProv.nombre}` : 'Registrar Nuevo Proveedor'}</h1>
          </div>
        </div>

        <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button 
            className={`tab ${activeTab === 'datos' ? 'active' : ''}`}
            onClick={() => setActiveTab('datos')}
            style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'datos' ? '2px solid var(--accent-blue)' : '2px solid transparent', color: activeTab === 'datos' ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: activeTab === 'datos' ? 600 : 400, cursor: 'pointer' }}
          >
            Datos del Proveedor
          </button>
          <button 
            className={`tab ${activeTab === 'decodificadores' ? 'active' : ''}`}
            onClick={() => {
              if(!editingProv) {
                toast.error('Primero debes guardar el proveedor');
                return;
              }
              setActiveTab('decodificadores');
            }}
            style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'decodificadores' ? '2px solid var(--accent-blue)' : '2px solid transparent', color: activeTab === 'decodificadores' ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: activeTab === 'decodificadores' ? 600 : 400, cursor: 'pointer' }}
          >
            Decodificadores ({decosProveedor.length})
          </button>
        </div>

        {activeTab === 'datos' && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label>Código*</label>
                <input type="text" disabled className="form-input" placeholder={editingProv ? 'Código' : 'Código (Se autogenerará)'} value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>RUC/DNI*</label>
                <input type="text" required placeholder="RUC/DNI*" className="form-input" value={formData.num_doc} onChange={(e) => setFormData({ ...formData, num_doc: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Razón Social</label>
                <input type="text" placeholder="Razón Social" className="form-input" value={formData.razon_social} onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label>Nombres*</label>
                <input type="text" required placeholder="Nombres*" className="form-input" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Apellidos*</label>
                <input type="text" required placeholder="Apellidos*" className="form-input" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Nacimiento*</label>
                <input type="date" required title="Fecha de Nacimiento*" className="form-input" value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Departamento*</label>
                <select required className="form-select" value={formData.id_departamento} onChange={e => handleDepartamentoChange(Number(e.target.value))}>
                  <option value="">-- DEPARTAMENTO* --</option>
                  {departamentos.map(d => <option key={d.id} value={d.id}>{d.descripcion}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Provincia*</label>
                <select required className="form-select" value={formData.id_provincia} onChange={e => handleProvinciaChange(Number(e.target.value))}>
                  <option value="">-- PROVINCIA* --</option>
                  {provincias.map(p => <option key={p.id} value={p.id}>{p.descripcion}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Distrito*</label>
                <select required className="form-select" value={formData.id_distrito} onChange={e => setFormData({ ...formData, id_distrito: e.target.value })}>
                  <option value="">-- DISTRITO* --</option>
                  {distritos.map(d => <option key={d.id} value={d.id}>{d.descripcion}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Dirección*</label>
                <input type="text" required placeholder="Dirección*" className="form-input" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Teléfonos*</label>
                <input type="text" required placeholder="Teléfonos*" className="form-input" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" placeholder="Correo Electrónico" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Plan*</label>
                <select required className="form-select" value={formData.id_plan} onChange={e => setFormData({ ...formData, id_plan: e.target.value })}>
                  <option value="">-- PLAN* --</option>
                  {planes.map(p => <option key={p.id} value={p.id}>{p.descripcion}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Precio S/*</label>
                <input type="number" step="0.01" required placeholder="Precio S/*" className="form-input" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha Promoción</label>
                <input type="date" title="Fecha Promoción" className="form-input" value={formData.fecha_final_promocion} onChange={(e) => setFormData({ ...formData, fecha_final_promocion: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: '#fff', padding: '0.6rem 1.5rem', fontSize: '1rem' }}>
                {editingProv ? <><Save size={18} /> Actualizar Proveedor</> : <><Check size={18} /> Guardar Proveedor</>}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'decodificadores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Decodificadores Registrados</h3>
              {/* It just informs the user to go to the decos page to register and select the provider for now */}
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Para registrar nuevos decodificadores a este proveedor, ve a la vista de Decodificadores.</p>
            </div>
            
            <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sticker</th>
                      <th>Serial IRD</th>
                      <th>Tarjeta SC</th>
                      <th>Estado</th>
                      <th>Suscriptor (Cliente)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decosProveedor.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Este proveedor no tiene decodificadores registrados.</td>
                      </tr>
                    ) : (
                      decosProveedor.map(d => (
                        <tr key={d.id}>
                          <td>{d.sticker || '-'}</td>
                          <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{d.serial_ird}</td>
                          <td>{d.tarjeta_sc || '-'}</td>
                          <td>
                            <span className={`badge ${d.estado === 'EN_ALMACEN' ? 'badge-success' : 'badge-warning'}`}>
                              {d.estado === 'EN_ALMACEN' ? 'Activo' : d.estado.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            {d.suscriptor ? (
                              <div style={{ fontWeight: 500 }}>{d.suscriptor.nombre} {d.suscriptor.apellido}</div>
                            ) : d.cliente ? (
                              <div style={{ fontWeight: 500 }}>{d.cliente.nombre} {d.cliente.apellido}</div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>No asignado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Proveedores</h1>
        <button className="btn-primary" onClick={openCreateView}>
          <PlusCircle size={18} /> Registrar Proveedor
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando proveedores...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Razón Social</th>
                  <th>RUC / DNI</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Teléfono</th>
                  <th>Plan</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay proveedores registrados</td>
                  </tr>
                ) : (
                  proveedores.map(p => (
                    <tr key={p.id}>
                      <td>{p.codigo || '-'}</td>
                      <td style={{ fontWeight: 500, color: 'var(--accent-blue)', cursor: 'pointer' }} onClick={() => openEditView(p)}>{p.razon_social || '-'}</td>
                      <td>{p.num_doc || '-'}</td>
                      <td>{p.nombre || '-'}</td>
                      <td>{p.apellido || '-'}</td>
                      <td>{p.telefono || '-'}</td>
                      <td>{planes.find(pl => pl.id === p.id_plan)?.descripcion || '-'}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#475569' }}
                          onClick={() => openEditView(p)}
                          title="Perfil"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-danger" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleEliminar(p.id)} title="Eliminar">
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
    </div>
  );
};
