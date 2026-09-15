import React, { useState, useEffect } from 'react';
import { PlusCircle, Tag, Trash2, Edit2, X } from 'lucide-react';
import { categoriasApi } from '../services/api';

interface Categoria {
  id: number;
  descripcion: string;
  tipo: string;
}

export const CategoriasPage: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [nueva, setNueva] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('ARTICULO');
  
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editTipo, setEditTipo] = useState('ARTICULO');

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasApi.getAll();
      setCategorias(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nueva.trim()) return;
    try {
      await categoriasApi.create(nueva.trim(), nuevoTipo);
      setNueva('');
      setNuevoTipo('ARTICULO');
      await cargarCategorias();
    } catch (err: any) {
      alert(err.message || 'Error al crear categoría');
    }
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCat(cat);
    setEditDesc(cat.descripcion);
    setEditTipo(cat.tipo || 'ARTICULO');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editDesc.trim()) return;
    try {
      await categoriasApi.update(editingCat.id, editDesc.trim(), editTipo);
      setEditingCat(null);
      await cargarCategorias();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar categoría');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;
    try {
      await categoriasApi.delete(id);
      await cargarCategorias();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar categoría');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categorías de Producto</h1>
      </div>

      {error && (
        <div className="edit-status-alert" style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}>
          {error} (Verifica la conexión con el servidor MySQL/Backend)
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={18} /> Nueva Categoría
          </h3>
          <form onSubmit={handleCrear}>
            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Herramientas, Trabajos"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Tipo de Elemento</label>
              <select
                className="form-select"
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value)}
              >
                <option value="ARTICULO">ARTÍCULO (Bienes Físicos)</option>
                <option value="SERVICIO">SERVICIO (Trabajos/Proyectos)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <PlusCircle size={18} /> Crear Categoría
            </button>
          </form>
        </div>

        <div className="table-card">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando categorías...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay categorías registradas</td>
                  </tr>
                ) : (
                  categorias.map(cat => (
                    <tr key={cat.id}>
                      <td>#{cat.id}</td>
                      <td>{cat.descripcion}</td>
                      <td>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: cat.tipo === 'SERVICIO' ? '#e0e7ff' : '#fef3c7', color: cat.tipo === 'SERVICIO' ? '#3730a3' : '#92400e' }}>
                          {cat.tipo || 'ARTICULO'}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleEliminar(cat.id)}
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {editingCat && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Categoría #{editingCat.id}</h3>
              <button className="close-btn" onClick={() => setEditingCat(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Elemento</label>
                <select
                  className="form-select"
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                >
                  <option value="ARTICULO">ARTÍCULO (Bienes Físicos)</option>
                  <option value="SERVICIO">SERVICIO (Trabajos/Proyectos)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-danger" onClick={() => setEditingCat(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
