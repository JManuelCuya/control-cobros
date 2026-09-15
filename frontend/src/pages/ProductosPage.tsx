import React, { useState, useEffect } from 'react';
import { Package, PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import { productosApi, categoriasApi } from '../services/api';
import toast from 'react-hot-toast';

interface Producto {
  id: number;
  descripcion: string;
  tipo: string;
  precio: number | string;
  stock: number;
  id_categoria_producto?: number;
  categoriaProducto?: { id: number; descripcion: string };
}

export const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Producto | null>(null);

  const [formDesc, setFormDesc] = useState('');
  const [formTipo, setFormTipo] = useState('ARTICULO');
  const [formPrecio, setFormPrecio] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formCategoriaId, setFormCategoriaId] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productosApi.getAll(),
        categoriasApi.getAll().catch(() => [])
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const openCreateModal = () => {
    setFormDesc('');
    setFormTipo('ARTICULO');
    setFormPrecio('0.00');
    setFormStock('0');
    setFormCategoriaId(categorias[0]?.id ? String(categorias[0].id) : '');
    setIsCreateOpen(true);
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productosApi.create({
        descripcion: formDesc.trim(),
        tipo: formTipo,
        precio: parseFloat(formPrecio) || 0,
        stock: formTipo === 'SERVICIO' ? 0 : (parseInt(formStock, 10) || 0),
        id_categoria_producto: formCategoriaId ? parseInt(formCategoriaId, 10) : undefined
      });
      setIsCreateOpen(false);
      toast.success('Producto creado exitosamente');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear producto');
    }
  };

  const openEditModal = (prod: Producto) => {
    setEditingProd(prod);
    setFormDesc(prod.descripcion);
    setFormTipo(prod.tipo || 'ARTICULO');
    setFormPrecio(String(prod.precio));
    setFormStock(String(prod.stock));
    setFormCategoriaId(prod.id_categoria_producto ? String(prod.id_categoria_producto) : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    try {
      await productosApi.update(editingProd.id, {
        descripcion: formDesc.trim(),
        tipo: formTipo,
        precio: parseFloat(formPrecio) || 0,
        stock: formTipo === 'SERVICIO' ? 0 : (parseInt(formStock, 10) || 0),
        id_categoria_producto: formCategoriaId ? parseInt(formCategoriaId, 10) : undefined
      });
      setEditingProd(null);
      toast.success('Producto actualizado exitosamente');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar producto');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Desea eliminar este producto?')) return;
    try {
      await productosApi.delete(id);
      toast.success('Producto eliminado exitosamente');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar producto');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Catálogo de Productos y Servicios</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <PlusCircle size={18} /> Agregar
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando catálogo...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay elementos registrados en el catálogo</td>
                </tr>
              ) : (
                productos.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.descripcion}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: p.tipo === 'SERVICIO' ? '#e0e7ff' : '#fef3c7', color: p.tipo === 'SERVICIO' ? '#3730a3' : '#92400e' }}>
                        {p.tipo || 'ARTICULO'}
                      </span>
                    </td>
                    <td>{p.categoriaProducto?.descripcion || 'Sin categoría'}</td>
                    <td>S/ {Number(p.precio).toFixed(2)}</td>
                    <td>
                      {p.tipo === 'SERVICIO' ? (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>No aplica</span>
                      ) : (
                        <span className={`badge ${p.stock > 10 ? 'badge-success' : 'badge-warning'}`}>
                          {p.stock} unidades
                        </span>
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => openEditModal(p)}
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                      <button className="btn-danger" onClick={() => handleEliminar(p.id)}>
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

      {/* Modal Crear / Editar */}
      {(isCreateOpen || editingProd) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isCreateOpen ? 'Nuevo Elemento del Catálogo' : `Editar Elemento #${editingProd?.id}`}</h3>
              <button className="close-btn" onClick={() => { setIsCreateOpen(false); setEditingProd(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={isCreateOpen ? handleCrear : handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tipo de Elemento</label>
                  <select
                    className="form-select"
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value)}
                  >
                    <option value="ARTICULO">ARTÍCULO (Requiere Stock)</option>
                    <option value="SERVICIO">SERVICIO (Intangible)</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Categoría</label>
                  <select
                    className="form-select"
                    value={formCategoriaId}
                    onChange={(e) => setFormCategoriaId(e.target.value)}
                  >
                    <option value="">-- Sin categoría --</option>
                    {categorias.filter(cat => cat.tipo === formTipo || !cat.tipo || (cat.tipo === 'ARTICULO' && !cat.tipo)).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción / Nombre</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={formTipo === 'SERVICIO' ? 'Ej. Instalación de Cableado' : 'Ej. Control Remoto Universal'}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Precio Unitario (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={formPrecio}
                    onChange={(e) => setFormPrecio(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ opacity: formTipo === 'SERVICIO' ? 0.5 : 1 }}>
                  <label>Stock {formTipo === 'SERVICIO' && '(No aplica)'}</label>
                  <input
                    type="number"
                    required={formTipo === 'ARTICULO'}
                    disabled={formTipo === 'SERVICIO'}
                    className="form-input"
                    value={formTipo === 'SERVICIO' ? 0 : formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  className="btn-danger" 
                  onClick={() => { setIsCreateOpen(false); setEditingProd(null); }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {isCreateOpen ? 'Crear en Catálogo' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
