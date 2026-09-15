import React, { useState, useEffect } from 'react';
import { Award, PlusCircle, Edit2, Trash2, X, Package } from 'lucide-react';
import { planesApi, productosApi } from '../services/api';
import toast from 'react-hot-toast';

interface Producto {
  id: number;
  descripcion: string;
  tipo?: string;
  precio: number;
}

interface PlanProducto {
  id_producto: number;
  producto: Producto;
}

interface Plan {
  id: number;
  descripcion: string;
  precio_original: number | string;
  descuento_porcentaje: number | string;
  precio: number | string;
  id_categoria_plan?: number;
  categoriaPlan?: { id: number; descripcion: string };
  productos?: PlanProducto[];
}

export const PlanesPage: React.FC = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [catalogoProductos, setCatalogoProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [desc, setDesc] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number>(0);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [planesData, productosData] = await Promise.all([
        planesApi.getAll(),
        productosApi.getAll().catch(() => [])
      ]);
      setPlanes(planesData);
      setCatalogoProductos(productosData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setDesc('');
    setSelectedProductIds([]);
    setDescuentoPorcentaje(0);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setDesc(p.descripcion);
    setDescuentoPorcentaje(Number(p.descuento_porcentaje) || 0);
    setSelectedProductIds(p.productos?.map(prod => prod.id_producto) || []);
    setIsModalOpen(true);
  };

  const toggleProducto = (id: number) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // Calcular totales en tiempo real
  const precioOriginalCalculado = selectedProductIds.reduce((sum, pid) => {
    const prod = catalogoProductos.find(p => p.id === pid);
    return sum + (prod ? Number(prod.precio) : 0);
  }, 0);
  const precioFinalCalculado = precioOriginalCalculado * (1 - (descuentoPorcentaje / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        descripcion: desc.trim(),
        descuento_porcentaje: descuentoPorcentaje,
        productosIds: selectedProductIds
      };

      if (editingPlan) {
        await planesApi.update(editingPlan.id, payload);
        toast.success('Plan actualizado con éxito');
      } else {
        await planesApi.create(payload);
        toast.success('Plan creado con éxito');
      }
      setIsModalOpen(false);
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar plan');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Desea eliminar este plan/paquete?')) return;
    try {
      await planesApi.delete(id);
      toast.success('Plan eliminado con éxito');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar plan');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Planes y Paquetes de Servicio</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Crea paquetes combinando productos del catálogo y asigna un descuento.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <PlusCircle size={18} /> Armar Nuevo Paquete
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando planes...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Paquete</th>
                <th>Productos Incluidos</th>
                <th style={{ textAlign: 'right' }}>Precio Base</th>
                <th style={{ textAlign: 'center' }}>% Dscto</th>
                <th style={{ textAlign: 'right' }}>Precio Final</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay planes registrados</td>
                </tr>
              ) : (
                planes.map(pl => {
                  const tieneDescuento = Number(pl.descuento_porcentaje) > 0;
                  return (
                    <tr key={pl.id}>
                      <td>#{pl.id}</td>
                      <td style={{ fontWeight: 600 }}>{pl.descripcion}</td>
                      <td>
                        {pl.productos && pl.productos.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {pl.productos.map(p => (
                              <span key={p.id_producto} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                {p.producto?.descripcion}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin productos</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', color: tieneDescuento ? '#94a3b8' : 'inherit', textDecoration: tieneDescuento ? 'line-through' : 'none' }}>
                        S/ {Number(pl.precio_original).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {tieneDescuento ? (
                          <span className="badge badge-success">-{Number(pl.descuento_porcentaje)}%</span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>0%</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0369a1' }}>
                        S/ {Number(pl.precio).toFixed(2)}
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => openEditModal(pl)}
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button className="btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleEliminar(pl.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{editingPlan ? `Editar Paquete #${editingPlan.id}` : 'Armar Nuevo Paquete'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Plan / Paquete</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. Combo Mega Full (Internet + Disney+)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <Package size={16} style={{ display: 'inline', marginBottom: '-3px' }}/> 1. Selecciona los Servicios a Incluir
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {catalogoProductos.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: 'span 2' }}>
                      No hay productos en el catálogo. Registra primero productos en la sección "Catálogo".
                    </div>
                  ) : (
                    catalogoProductos.map(prod => (
                      <label key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer', backgroundColor: selectedProductIds.includes(prod.id) ? '#e0f2fe' : '#ffffff', borderColor: selectedProductIds.includes(prod.id) ? '#7dd3fc' : '#cbd5e1' }}>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(prod.id)}
                          onChange={() => toggleProducto(prod.id)}
                          style={{ accentColor: 'var(--accent-blue)', width: '1rem', height: '1rem' }}
                        />
                        <div style={{ flex: 1, fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>
                            {prod.descripcion}
                            <span style={{ marginLeft: '6px', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', fontSize: '0.65rem', backgroundColor: prod.tipo === 'SERVICIO' ? '#e0e7ff' : '#fef3c7', color: prod.tipo === 'SERVICIO' ? '#3730a3' : '#92400e' }}>
                              {prod.tipo === 'SERVICIO' ? 'Servicio' : 'Artículo'}
                            </span>
                          </div>
                          <div style={{ color: '#64748b' }}>S/ {Number(prod.precio).toFixed(2)}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
                  2. Estructura de Precios
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Total de los Servicios</label>
                    <div style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#f1f5f9', fontWeight: 600, color: '#64748b' }}>
                      S/ {precioOriginalCalculado.toFixed(2)}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Descuento Paquete (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="form-input"
                      style={{ fontWeight: 700, color: '#059669', borderColor: '#86efac' }}
                      value={descuentoPorcentaje}
                      onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>PRECIO FINAL DEL PLAN</label>
                    <div style={{ padding: '0.5rem', border: '2px solid #0369a1', borderRadius: '0.375rem', backgroundColor: '#e0f2fe', fontWeight: 800, color: '#0369a1', fontSize: '1.2rem', textAlign: 'center' }}>
                      S/ {precioFinalCalculado.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" className="btn-danger" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={selectedProductIds.length === 0}>
                  {editingPlan ? 'Guardar Cambios' : 'Crear Paquete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
