import React, { useState, useEffect } from 'react';
import { UserCheck, PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { empleadosApi } from '../services/api';

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  tipo_doc?: string;
  num_doc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
}

export const EmpleadosPage: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Empleado | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_doc: 'DNI',
    num_doc: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const data = await empleadosApi.getAll();
      setEmpleados(data);
    } catch (err: any) {
      console.error('Error al cargar empleados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const openCreateModal = () => {
    setEditingEmp(null);
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

  const openEditModal = (emp: Empleado) => {
    setEditingEmp(emp);
    setFormData({
      nombre: emp.nombre || '',
      apellido: emp.apellido || '',
      tipo_doc: emp.tipo_doc || 'DNI',
      num_doc: emp.num_doc || '',
      telefono: emp.telefono || '',
      email: emp.email || '',
      direccion: emp.direccion || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await empleadosApi.update(editingEmp.id, formData);
      } else {
        await empleadosApi.create(formData);
      }
      setIsModalOpen(false);
      await cargarEmpleados();
    } catch (err: any) {
      alert(err.message || 'Error al guardar empleado');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Desea eliminar este empleado?')) return;
    try {
      await empleadosApi.delete(id);
      await cargarEmpleados();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar empleado');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Empleados y Personal</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <PlusCircle size={18} /> Registrar Empleado
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando empleados...</div>
        ) : (
          <div className="table-responsive">
                <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empleado</th>
                <th>Doc Identidad</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay empleados registrados</td>
                </tr>
              ) : (
                empleados.map(e => (
                  <tr key={e.id}>
                    <td>#{e.id}</td>
                    <td>{e.nombre} {e.apellido}</td>
                    <td>{e.tipo_doc ? `${e.tipo_doc}: ${e.num_doc}` : e.num_doc || '-'}</td>
                    <td>{e.telefono || '-'}</td>
                    <td>{e.email || '-'}</td>
                    <td>{e.direccion || '-'}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        onClick={() => openEditModal(e)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger" onClick={() => handleEliminar(e.id)}>
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
              <h3>{editingEmp ? `Editar Empleado #${editingEmp.id}` : 'Registrar Nuevo Empleado'}</h3>
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
                  {editingEmp ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
