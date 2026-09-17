import React, { useState, useEffect } from 'react';
import { Cpu, PlusCircle, Trash2, Edit2, Search, Link2, X, Check, Save } from 'lucide-react';
import { decodificadoresApi, productosApi, proveedoresApi, clientesApi, planesApi, sucursalesApi } from '../services/api';
import toast from 'react-hot-toast';
import { confirmDialog } from '../utils/confirmDialog';

export const DecodificadoresPage: React.FC = () => {
  const [decodificadores, setDecodificadores] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(null);
  const [assignClientId, setAssignClientId] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    sticker: '',
    id_proveedor: '',
    serial_ird: '',
    tarjeta_sc: '',
    fecha_fabricacion: '',
    costo: '',
    id_plan_mensual: '',
    id_sucursal: '',
    detalles: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eqData, prData, provData, cliData, plData, sucData] = await Promise.all([
        decodificadoresApi.getAll(),
        productosApi.getAll(),
        proveedoresApi.getAll(),
        clientesApi.getAll(),
        planesApi.getAll(),
        sucursalesApi.getAll()
      ]);
      setDecodificadores(eqData);
      setProductos(prData);
      setProveedores(provData);
      setClientes(cliData);
      setPlanes(plData);
      setSucursales(sucData);
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ 
      sticker: '', id_proveedor: '', serial_ird: '', tarjeta_sc: '', 
      fecha_fabricacion: '', costo: '', id_plan_mensual: '', id_sucursal: '', detalles: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dec: any) => {
    setEditingId(dec.id);
    setFormData({
      sticker: dec.sticker || '',
      id_proveedor: dec.id_proveedor ? String(dec.id_proveedor) : '',
      serial_ird: dec.serial_ird || '',
      tarjeta_sc: dec.tarjeta_sc || '',
      fecha_fabricacion: dec.fecha_fabricacion ? new Date(dec.fecha_fabricacion).toISOString().split('T')[0] : '',
      costo: dec.costo ? String(dec.costo) : '',
      id_plan_mensual: dec.id_plan_mensual ? String(dec.id_plan_mensual) : '',
      id_sucursal: dec.id_sucursal ? String(dec.id_sucursal) : '',
      detalles: dec.detalles || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        id_proveedor: formData.id_proveedor ? Number(formData.id_proveedor) : undefined,
        id_plan_mensual: formData.id_plan_mensual ? Number(formData.id_plan_mensual) : undefined,
        id_sucursal: formData.id_sucursal ? Number(formData.id_sucursal) : undefined,
      };
      
      if (editingId) {
        await decodificadoresApi.update(editingId, payload);
        toast.success('Decodificador actualizado');
      } else {
        await decodificadoresApi.create(payload);
        toast.success('Decodificador registrado');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar decodificador');
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog('¿Desea eliminar este decodificador?'))) return;
    try {
      await decodificadoresApi.delete(id);
      toast.success('Decodificador eliminado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const openAssignModal = (id: number, currentClient: any) => {
    setSelectedEquipoId(id);
    setAssignClientId(currentClient ? String(currentClient.id) : '');
    setIsAssignModalOpen(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipoId) return;
    try {
      const clientId = assignClientId ? Number(assignClientId) : null;
      await decodificadoresApi.asignar(selectedEquipoId, clientId);
      toast.success(clientId ? 'Decodificador asignado al cliente' : 'Decodificador devuelto a almacén');
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al asignar decodificador');
    }
  };

  const filteredDecodificadores = decodificadores.filter(e => 
    e.serial_ird?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.sticker && e.sticker.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lista de Decodificadores</h1>
        </div>
        <button className="btn-primary" onClick={openNewModal}>
          <PlusCircle size={18} /> Agregar Decodificador
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por Sticker o Serial IRD..." 
            className="form-input" 
            style={{ paddingLeft: '35px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando decodificadores...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sticker</th>
                  <th>Proveedor</th>
                  <th>Serial IRD</th>
                  <th>Costo</th>
                  <th>Plan Mensual</th>
                  <th>Estado</th>
                  <th>Asignado A</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredDecodificadores.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>No hay decodificadores registrados</td>
                  </tr>
                ) : (
                  filteredDecodificadores.map((e, index) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.sticker || '-'}</td>
                      <td>{proveedores.find(p => p.id === e.id_proveedor)?.razon_social || proveedores.find(p => p.id === e.id_proveedor)?.nombre || '-'}</td>
                      <td style={{ color: 'var(--accent-blue)' }}>{e.serial_ird}</td>
                      <td>S/ {Number(e.costo).toFixed(2)}</td>
                      <td>{e.plan?.descripcion || '-'}</td>
                      <td>
                        <span className={`badge ${e.estado === 'EN_ALMACEN' ? 'badge-success' : 'badge-warning'}`}>
                          {e.estado === 'EN_ALMACEN' ? 'Activo' : e.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {e.suscriptor ? (
                          <div style={{ fontWeight: 500 }}>{e.suscriptor.nombre} {e.suscriptor.apellido}</div>
                        ) : e.cliente ? (
                          <div style={{ fontWeight: 500 }}>{e.cliente.nombre} {e.cliente.apellido}</div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>No asignado</span>
                        )}
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.75rem', backgroundColor: '#475569' }} onClick={() => openEditModal(e)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-danger" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => handleDelete(e.id)} title="Eliminar">
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
              <h3>{editingId ? 'Editar Decodificador' : 'Ingresar Nuevo Decodificador'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label>Proveedor</label>
                  <select className="form-select" value={formData.id_proveedor} onChange={e => setFormData({...formData, id_proveedor: e.target.value})}>
                    <option value="">-- PROVEEDOR --</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.razon_social || `${p.nombre} ${p.apellido}`}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>SERIAL IRD (Obligatorio)</label>
                  <input type="text" required placeholder="SERIAL IRD (Obligatorio)" className="form-input" value={formData.serial_ird} onChange={e => setFormData({...formData, serial_ird: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>TARJETA SC</label>
                  <input type="text" placeholder="TARJETA SC" className="form-input" value={formData.tarjeta_sc} onChange={e => setFormData({...formData, tarjeta_sc: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>F. Fabricación</label>
                  <input type="date" title="Fecha de Fabricación" className="form-input" value={formData.fecha_fabricacion} onChange={e => setFormData({...formData, fecha_fabricacion: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Costo S/</label>
                  <input type="number" step="0.01" placeholder="Costo S/" className="form-input" value={formData.costo} onChange={e => setFormData({...formData, costo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Plan Mensual</label>
                  <select className="form-select" value={formData.id_plan_mensual} onChange={e => setFormData({...formData, id_plan_mensual: e.target.value})}>
                    <option value="">-- PLAN MENSUAL --</option>
                    {planes.map(p => (
                      <option key={p.id} value={p.id}>{p.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sucursal</label>
                  <select className="form-select" value={formData.id_sucursal} onChange={e => setFormData({...formData, id_sucursal: e.target.value})}>
                    <option value="">-- SUCURSAL --</option>
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Detalles</label>
                  <textarea className="form-input" placeholder="Detalles adicionales" value={formData.detalles} onChange={e => setFormData({...formData, detalles: e.target.value})} rows={3}></textarea>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', backgroundColor: '#ef4444', color: '#fff', fontSize: '1rem' }} onClick={() => setIsModalOpen(false)} title="Cancelar">
                  <X size={18} /> Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', backgroundColor: '#10b981', color: '#fff', fontSize: '1rem' }} title={editingId ? 'Actualizar Decodificador' : 'Agregar Decodificador'}>
                  <Save size={18} /> {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
