import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Info, X, ShoppingCart, Trash2 } from 'lucide-react';
import { pedidosApi, clientesApi, productosApi } from '../services/api';
import toast from 'react-hot-toast';

interface Pedido {
  id: number;
  fecha: string;
  total: number | string;
  estado: string;
  cliente: { id: number; nombre: string; apellido: string; direccion?: string };
  detallesPedido?: any[];
}

export const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal Estado / Editar
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [editEstado, setEditEstado] = useState('PENDIENTE');

  // Modal Nuevo Pedido
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [items, setItems] = useState<{ id_producto: number; cantidad: number; precio_unit: number; descripcion: string }[]>([]);

  const [selectProdId, setSelectProdId] = useState('');
  const [cantInput, setCantInput] = useState('1');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pedList, cliList, prodList] = await Promise.all([
        pedidosApi.getAll(),
        clientesApi.getAll().catch(() => []),
        productosApi.getAll().catch(() => [])
      ]);
      setPedidos(pedList);
      setClientes(cliList);
      setProductos(prodList);
    } catch (err: any) {
      console.error('Error al cargar pedidos:', err);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const openCreateModal = () => {
    setSelectedCliente(clientes[0]?.id ? String(clientes[0].id) : '');
    setItems([]);
    setSelectProdId(productos[0]?.id ? String(productos[0].id) : '');
    setCantInput('1');
    setIsCreateOpen(true);
  };

  const handleAddItem = () => {
    if (!selectProdId) return;
    const prod = productos.find(p => p.id === Number(selectProdId));
    if (!prod) return;

    const cantidad = parseInt(cantInput, 10) || 1;
    setItems(prev => [
      ...prev,
      {
        id_producto: prod.id,
        cantidad,
        precio_unit: Number(prod.precio),
        descripcion: prod.descripcion
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCalculado = items.reduce((acc, curr) => acc + curr.cantidad * curr.precio_unit, 0);

  const handleCrearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) {
      toast.error('Debe seleccionar un cliente');
      return;
    }
    if (items.length === 0) {
      toast.error('Debe agregar al menos un producto al pedido');
      return;
    }

    try {
      await pedidosApi.create({
        id_cliente: Number(selectedCliente),
        detalles: items.map(it => ({
          id_producto: it.id_producto,
          cantidad: it.cantidad,
          precio_unit: it.precio_unit
        }))
      });
      setIsCreateOpen(false);
      toast.success('Pedido registrado con éxito');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar pedido');
    }
  };

  const handleOpenEdit = (p: Pedido) => {
    setEditingPedido(p);
    setEditEstado(p.estado);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPedido) return;
    try {
      await pedidosApi.updateEstado(editingPedido.id, editEstado);
      setEditingPedido(null);
      toast.success('Estado del pedido actualizado');
      await cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar pedido');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pedidos / Ventas</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <PlusCircle size={18} />
          Nuevo Pedido
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando pedidos...</div>
        ) : (
          <div className="table-responsive">
                <table className="data-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay pedidos registrados</td>
                </tr>
              ) : (
                pedidos.map(p => {
                  const esServicio = p.detallesPedido?.some((d: any) => d.producto?.tipo === 'SERVICIO');
                  const tipoTexto = esServicio ? 'Servicio' : 'Artículo';
                  return (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>{p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Cliente Desconocido'}</td>
                      <td>{new Date(p.fecha).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: esServicio ? '#dbeafe' : '#f3e8ff', color: esServicio ? '#1e40af' : '#6b21a8', borderRadius: '4px', fontWeight: 600 }}>
                          {tipoTexto}
                        </span>
                      </td>
                      <td>S/ {Number(p.total).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.estado === 'COMPLETADO' ? 'badge-success' : 'badge-warning'}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleOpenEdit(p)} 
                          className="btn-primary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        >
                          <Edit2 size={14} /> Editar Estado
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
              </div>
        )}
      </div>

      {/* Modal Nuevo Pedido */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3><ShoppingCart size={20} style={{ display: 'inline', marginRight: '8px' }} /> Registrar Nuevo Pedido de Venta</h3>
              <button className="close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearPedido}>
              <div className="form-group">
                <label>Cliente</label>
                <select
                  className="form-select"
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.num_doc || 'Sin Doc'})</option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Agregar Productos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Producto</label>
                    <select
                      className="form-select"
                      value={selectProdId}
                      onChange={(e) => setSelectProdId(e.target.value)}
                    >
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.descripcion} (S/ {Number(p.precio).toFixed(2)}) - Stock: {p.stock}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={cantInput}
                      onChange={(e) => setCantInput(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn-primary" onClick={handleAddItem} style={{ height: '38px', justifyContent: 'center' }}>
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Lista de ítems agregados */}
              <div style={{ marginBottom: '1rem' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant</th>
                      <th>P. Unit</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Ningún producto agregado aún</td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.descripcion}</td>
                          <td>{it.cantidad}</td>
                          <td>S/ {it.precio_unit.toFixed(2)}</td>
                          <td>S/ {(it.cantidad * it.precio_unit).toFixed(2)}</td>
                          <td>
                            <button type="button" className="btn-danger" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleRemoveItem(idx)}>
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  Total: S/ {totalCalculado.toFixed(2)}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn-danger" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Completar Pedido
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edición de Estado */}
      {editingPedido && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Estado del Pedido #{editingPedido.id}</h3>
              <button className="close-btn" onClick={() => setEditingPedido(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="edit-status-alert">
              <Info size={16} /> Modificando el estado del pedido de {editingPedido.cliente?.nombre}
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Estado del Pedido</label>
                <select
                  className="form-select"
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="COMPLETADO">COMPLETADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-danger" onClick={() => setEditingPedido(null)}>
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
