const API_BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || json.message || 'Error en la petición API');
  }

  return json.data;
}

// 0. Auth API
export const authApi = {
  login: (correo: string, pass: string) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ correo, password: pass }) }),
};

// 1. Categorías API
export const categoriasApi = {
  getAll: () => request<any[]>('/categorias'),
  getById: (id: number) => request<any>(`/categorias/${id}`),
  create: (descripcion: string, tipo?: string) => request<any>('/categorias', { method: 'POST', body: JSON.stringify({ descripcion, tipo }) }),
  update: (id: number, descripcion: string, tipo?: string) => request<any>(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify({ descripcion, tipo }) }),
  delete: (id: number) => request<any>(`/categorias/${id}`, { method: 'DELETE' }),
};

// 2. Productos API
export const productosApi = {
  getAll: () => request<any[]>('/productos'),
  getById: (id: number) => request<any>(`/productos/${id}`),
  create: (data: { descripcion: string; tipo?: string; precio: number; stock: number; id_categoria_producto?: number }) =>
    request<any>('/productos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ descripcion: string; tipo: string; precio: number; stock: number; id_categoria_producto: number }>) =>
    request<any>(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/productos/${id}`, { method: 'DELETE' }),
};

// 3. Clientes API
export const clientesApi = {
  getAll: () => request<any[]>('/clientes'),
  getById: (id: number) => request<any>(`/clientes/${id}`),
  create: (data: any) => request<any>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/clientes/${id}`, { method: 'DELETE' }),
};

// 4. Cobros API (Sábana de pagos)
export const cobrosApi = {
  getMatriz: (anio: number) => request<any[]>(`/cobros/matriz?anio=${anio}`),
  registrar: (data: { id_contrato: number; anio: number; mes: number; estado: string; monto?: number; observacion?: string }) => 
    request<any>('/cobros/registrar', { method: 'POST', body: JSON.stringify(data) }),
};

// 5. Facturación API
export const facturacionApi = {
  getAll: () => request<any[]>('/facturacion'),
  getById: (id: number) => request<any>(`/facturacion/${id}`),
  create: (data: {
    tipo_comprobante: string;
    tipo_pago?: string;
    periodo_mes?: number;
    periodo_anio?: number;
    id_cliente?: number;
    id_contrato?: number;
    cliente_nombre: string;
    cliente_num_doc: string;
    empresa_emisora?: string;
    estado_pago?: string;
    detalles: { descripcion_item: string; cantidad: number; precio_unitario: number }[];
  }) => request<any>('/facturacion', { method: 'POST', body: JSON.stringify(data) }),
  cambiarEstadoPago: (id: number, estado_pago: string) => 
    request<any>(`/facturacion/${id}/pago`, { method: 'PATCH', body: JSON.stringify({ estado_pago }) }),
};

// 6. Empleados API
export const empleadosApi = {
  getAll: () => request<any[]>('/empleados'),
  getById: (id: number) => request<any>(`/empleados/${id}`),
  create: (data: any) => request<any>('/empleados', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/empleados/${id}`, { method: 'DELETE' }),
};

// 7. Contratos API
export const contratosApi = {
  getAll: () => request<any[]>('/contratos'),
  getByCliente: (idCliente: number) => request<any[]>(`/contratos/cliente/${idCliente}`),
  getBySuscriptor: (idSuscriptor: number) => request<any[]>(`/contratos/suscriptor/${idSuscriptor}`),
  create: (data: any) => request<any>('/contratos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/contratos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/contratos/${id}`, { method: 'DELETE' }),
};

// 7. Proveedores API
export const proveedoresApi = {
  getAll: () => request<any[]>('/proveedores'),
  getById: (id: number) => request<any>(`/proveedores/${id}`),
  create: (data: any) => request<any>('/proveedores', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/proveedores/${id}`, { method: 'DELETE' }),
};

// 8. Planes API
export const planesApi = {
  getAll: () => request<any[]>('/planes'),
  getById: (id: number) => request<any>(`/planes/${id}`),
  create: (data: { descripcion: string; descuento_porcentaje?: number; id_categoria_plan?: number; productosIds?: number[] }) =>
    request<any>('/planes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/planes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/planes/${id}`, { method: 'DELETE' }),
};

// 9. Pedidos API
export const pedidosApi = {
  getAll: () => request<any[]>('/pedidos'),
  getById: (id: number) => request<any>(`/pedidos/${id}`),
  create: (data: { id_cliente: number; id_empleado?: number; detalles: { id_producto: number; cantidad: number; precio_unit: number }[] }) =>
    request<any>('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  updateEstado: (id: number, estado: string) => request<any>(`/pedidos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
};

// 10. Usuarios API
export const usuariosApi = {
  getAll: () => request<any[]>('/usuarios'),
  getRoles: () => request<any[]>('/usuarios/roles'),
  getById: (id: number) => request<any>(`/usuarios/${id}`),
  create: (data: any) => request<any>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/usuarios/${id}`, { method: 'DELETE' }),
};

// 11. Sucursales API
export const sucursalesApi = {
  getAll: () => request<any[]>('/sucursales'),
  getById: (id: number) => request<any>(`/sucursales/${id}`),
  create: (data: any) => request<any>('/sucursales', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/sucursales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/sucursales/${id}`, { method: 'DELETE' }),
};

// 12. Ubigeo API
export const ubigeoApi = {
  getDepartamentos: () => request<any[]>('/ubigeo/departamentos'),
  getProvincias: (idDepartamento: number) => request<any[]>(`/ubigeo/provincias/${idDepartamento}`),
  getDistritos: (idProvincia: number) => request<any[]>(`/ubigeo/distritos/${idProvincia}`),
};

// 13. Decodificadores API
export const decodificadoresApi = {
  getAll: () => request<any[]>('/decodificadores'),
  create: (data: any) => request<any>('/decodificadores', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/decodificadores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  asignar: (id: number, targetId: number | null, type: 'cliente' | 'suscriptor' = 'cliente', fecha_asignacion?: string) => request<any>(`/decodificadores/${id}/asignar`, { method: 'PATCH', body: JSON.stringify({ ...(type === 'cliente' ? { id_cliente: targetId } : { id_suscriptor: targetId }), fecha_asignacion }) }),
  delete: (id: number) => request<any>(`/decodificadores/${id}`, { method: 'DELETE' }),
};

// 14. Suscriptores API
export const suscriptoresApi = {
  getAll: () => request<any[]>('/suscriptores'),
  getById: (id: number) => request<any>(`/suscriptores/${id}`),
  create: (data: any) => request<any>('/suscriptores', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/suscriptores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/suscriptores/${id}`, { method: 'DELETE' }),
};


