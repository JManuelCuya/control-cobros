import React, { useState, useEffect } from 'react';
import { Truck, PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { proveedoresApi } from '../services/api';

interface Proveedor {
  id: number;
  razon_social: string;
  tipo_doc?: string;
  num_doc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export const ProveedoresPage: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProv, setEditingProv] = useState<Proveedor | null>(null);

  const [formData, setFormData] = useState({
    razon_social: '',
    tipo_doc: 'RUC',
    num_doc: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const data = await proveedoresApi.getAll();
      setProveedores(data);
    } catch (err: any) {
      console.error('Error al cargar proveedores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const openCreateModal = () => {
    setEditingProv(null);
    setFormData({
      razon_social: '',
      tipo_doc: 'RUC',
      num_doc: '',
      telefono: '',
      email: '',
      direccion: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Proveedor) => {
    setEditingProv(p);
    setFormData({
      razon_social: p.razon_social || '',
      tipo_doc: p.tipo_doc || 'RUC',
      num_doc: p.num_doc || '',
      telefono: p.telefono || '',
      email: p.email || '',
      direccion: p.direccion || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProv) {
        await proveedoresApi.update(editingProv.id, formData);
      } else {
        await proveedoresApi.create(formData);
      }
      setIsModalOpen(false);
      await cargarProveedores();
    } catch (err: any) {
      alert(err.message || 'Error al guardar proveedor');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!(await confirmDialog('¿Desea eliminar este proveedor?'))) return;
    try {
      await proveedoresApi.delete(id);
      await cargarProveedores();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar proveedor');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proveedores</h1>
        <button className="btn-primary" onClick={openCreateModal}>
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
                <th>ID</th>
                <th>Razón Social</th>
                <th>RUC / Doc</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay proveedores registrados</td>
                </tr>
              ) : (
                proveedores.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.razon_social}</td>
                    <td>{p.num_doc || '-'}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>{p.email || '-'}</td>
                    <td>{p.direccion || '-'}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        onClick={() => openEditModal(p)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger" onClick={() => handleEliminar(p.id)}>
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
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProv ? `Editar Proveedor #${editingProv.id}` : 'Registrar Nuevo Proveedor'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Razón Social</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                />
              </div>

              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo Doc</label>
                  <select
                    className="form-select"
                    value={formData.tipo_doc}
                    onChange={(e) => setFormData({ ...formData, tipo_doc: e.target.value })}
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
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
                  {editingProv ? 'Guardar Cambios' : 'Registrar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
