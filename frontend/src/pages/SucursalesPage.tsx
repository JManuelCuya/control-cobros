import React, { useState, useEffect } from 'react';
import { Plus, X, Store, Edit2, Trash2 } from 'lucide-react';
import { sucursalesApi } from '../api/sucursales.api';
import toast from 'react-hot-toast';
import { confirmDialog } from '../utils/confirmDialog';

export const SucursalesPage = () => {
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    direccion: '',
    distrito: '',
    provincia: '',
    departamento: ''
  });

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      const data = await sucursalesApi.getAll();
      setSucursales(data);
    } catch (error) {
      toast.error('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await sucursalesApi.update(editingId, formData);
        toast.success('Sucursal actualizada');
      } else {
        await sucursalesApi.create(formData);
        toast.success('Sucursal creada');
      }
      setShowModal(false);
      fetchSucursales();
    } catch (error) {
      toast.error('Error al guardar sucursal');
    }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      descripcion: s.descripcion,
      direccion: s.direccion || '',
      distrito: s.distrito || '',
      provincia: s.provincia || '',
      departamento: s.departamento || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog('¿Está seguro de eliminar esta sucursal?'))) return;
    try {
      await sucursalesApi.delete(id);
      toast.success('Sucursal eliminada');
      fetchSucursales();
    } catch (error) {
      toast.error('Error al eliminar sucursal');
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      descripcion: '',
      direccion: '',
      distrito: '',
      provincia: '',
      departamento: ''
    });
    setShowModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Sucursales</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Administra las sedes de la empresa</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} /> Nueva Sucursal
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Dirección</th>
                  <th>Ubicación</th>
                  <th style={{ width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay sucursales registradas
                    </td>
                  </tr>
                ) : (
                  sucursales.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <Store size={16} color="var(--accent-blue)" /> {s.descripcion}
                        </div>
                      </td>
                      <td>{s.direccion || '-'}</td>
                      <td>{[s.distrito, s.provincia, s.departamento].filter(Boolean).join(' - ') || '-'}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary"
                          style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                          onClick={() => handleEdit(s)}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-danger"
                          style={{ padding: '0.4rem' }}
                          onClick={() => handleDelete(s.id)}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descripción / Nombre de Sucursal</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Ej: Sede Principal"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Distrito</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.distrito}
                    onChange={e => setFormData({...formData, distrito: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Provincia</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.provincia}
                    onChange={e => setFormData({...formData, provincia: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Departamento</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.departamento}
                    onChange={e => setFormData({...formData, departamento: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
