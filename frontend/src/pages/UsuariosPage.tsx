import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, Trash2, CheckCircle2, XCircle, X, ShieldAlert, UserCheck, Users, Truck } from 'lucide-react';
import { usuariosApi, empleadosApi, clientesApi, proveedoresApi } from '../services/api';

interface UsuariosPageProps {
  currentUser: any;
}

export const UsuariosPage: React.FC<UsuariosPageProps> = ({ currentUser }) => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal de creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  
  // Asignación de ID de Persona
  const [personaTipo, setPersonaTipo] = useState<'NINGUNO' | 'EMPLEADO' | 'CLIENTE' | 'PROVEEDOR'>('NINGUNO');
  const [selectedPersonaId, setSelectedPersonaId] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reglas de contraseña estricta
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const esAdmin = currentUser?.esAdministrador || currentUser?.rol?.descripcion === 'ADMINISTRADOR' || currentUser?.usuarioRoles?.some((r: any) => r.rol?.descripcion === 'ADMINISTRADOR');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [userList, roleList, empList, cliList, provList] = await Promise.all([
        usuariosApi.getAll(),
        usuariosApi.getRoles().catch(() => []),
        empleadosApi.getAll().catch(() => []),
        clientesApi.getAll().catch(() => []),
        proveedoresApi.getAll().catch(() => [])
      ]);
      setUsuarios(userList);
      setRoles(roleList);
      setEmpleados(empList);
      setClientes(cliList);
      setProveedores(provList);
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
    if (!esAdmin) {
      alert('Acceso restringido: Solo el rol ADMINISTRADOR puede crear nuevos usuarios en el sistema.');
      return;
    }
    setNombre('');
    setCorreo('');
    setPassword('');
    // Seleccionar por defecto ADMINISTRADOR si existe
    const adminRol = roles.find(r => r.descripcion === 'ADMINISTRADOR');
    setSelectedRoleIds(adminRol ? [adminRol.id] : []);
    setPersonaTipo('NINGUNO');
    setSelectedPersonaId('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const toggleRoleSelection = (roleId: number) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPasswordValid) {
      setErrorMsg('La contraseña debe cumplir obligatoriamente todos los estándares de seguridad (12+ caracteres, mayúscula, minúscula, número y símbolo).');
      return;
    }

    if (selectedRoleIds.length === 0) {
      setErrorMsg('Debe seleccionar al menos un rol para el usuario.');
      return;
    }

    try {
      const payload: any = {
        descripcion: nombre.trim(),
        correo: correo.trim(),
        password,
        id_roles: selectedRoleIds
      };

      if (personaTipo === 'EMPLEADO' && selectedPersonaId) payload.id_empleado = Number(selectedPersonaId);
      if (personaTipo === 'CLIENTE' && selectedPersonaId) payload.id_cliente = Number(selectedPersonaId);
      if (personaTipo === 'PROVEEDOR' && selectedPersonaId) payload.id_proveedor = Number(selectedPersonaId);

      await usuariosApi.create(payload);
      setIsModalOpen(false);
      await cargarDatos();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear usuario');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!esAdmin) {
      alert('Solo un Administrador puede eliminar usuarios.');
      return;
    }
    if (!confirm('¿Desea eliminar este usuario?')) return;
    try {
      await usuariosApi.delete(id);
      await cargarDatos();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar usuario');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios y Asignación de Roles</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Permite la asignación de múltiples roles por usuario y su vinculación con Empleados, Clientes o Proveedores.
          </p>
        </div>
        {esAdmin && (
          <button className="btn-primary" onClick={openCreateModal}>
            <PlusCircle size={18} /> Crear Nuevo Usuario
          </button>
        )}
      </div>

      {!esAdmin && (
        <div className="edit-status-alert" style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)', backgroundColor: '#fffbeb' }}>
          <ShieldAlert size={18} /> Tu usuario actual no es <strong>ADMINISTRADOR</strong>. La creación de usuarios está restringida exclusivamente a Administradores.
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando usuarios...</div>
        ) : (
          <div className="table-responsive">
                <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario / Nombre</th>
                <th>Correo Electrónico</th>
                <th>Roles Asignados</th>
                <th>Persona Vinculada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay usuarios registrados</td>
                </tr>
              ) : (
                usuarios.map(u => {
                  const rolesList = u.usuarioRoles?.map((ur: any) => ur.rol?.descripcion).filter(Boolean) || [];
                  let personaInfo = 'Ninguna';
                  if (u.empleado) personaInfo = `Empleado: ${u.empleado.nombre} ${u.empleado.apellido}`;
                  else if (u.cliente) personaInfo = `Cliente: ${u.cliente.nombre} ${u.cliente.apellido}`;
                  else if (u.proveedor) personaInfo = `Proveedor: ${u.proveedor.razon_social}`;

                  return (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.descripcion || 'Sin Nombre'}</td>
                      <td>{u.correo}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {rolesList.length === 0 ? (
                            <span className="badge badge-warning">SIN ROL</span>
                          ) : (
                            rolesList.map((rName: string, i: number) => (
                              <span key={i} className={`badge ${rName === 'ADMINISTRADOR' ? 'badge-success' : 'badge-warning'}`}>
                                {rName}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {personaInfo}
                        </span>
                      </td>
                      <td>
                        {esAdmin && (
                          <button className="btn-danger" onClick={() => handleEliminar(u.id)}>
                            <Trash2 size={14} /> Eliminar
                          </button>
                        )}
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

      {/* Modal de Creación de Usuario */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3><Shield size={20} style={{ display: 'inline', marginRight: '8px' }} /> Registrar Usuario (Asignación de Múltiples Roles)</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="edit-status-alert" style={{ borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)', backgroundColor: '#fef2f2' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCrearUsuario}>
              <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre del Usuario</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej. José Cuya"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="usuario@empresa.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </div>

              {/* Selección de Múltiples Roles */}
              <div className="form-group">
                <label>Roles de Permiso (Puedes marcar múltiples)</label>
                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  {roles.map(r => (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(r.id)}
                        onChange={() => toggleRoleSelection(r.id)}
                      />
                      {r.descripcion}
                    </label>
                  ))}
                </div>
              </div>

              {/* Vinculación de Persona (Empleado, Cliente, Proveedor) */}
              <div style={{ backgroundColor: '#f0f9ff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1', display: 'block', marginBottom: '0.5rem' }}>
                  Vincular con Entidad (Empleado / Cliente / Proveedor)
                </label>
                <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select
                    className="form-select"
                    value={personaTipo}
                    onChange={(e) => {
                      setPersonaTipo(e.target.value as any);
                      setSelectedPersonaId('');
                    }}
                  >
                    <option value="NINGUNO">Sin Vinculación Directa</option>
                    <option value="EMPLEADO">Empleado</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="PROVEEDOR">Proveedor</option>
                  </select>

                  {personaTipo === 'EMPLEADO' && (
                    <select className="form-select" value={selectedPersonaId} onChange={(e) => setSelectedPersonaId(e.target.value)}>
                      <option value="">-- Seleccionar Empleado --</option>
                      {empleados.map(e => <option key={e.id} value={e.id}>ID #{e.id}: {e.nombre} {e.apellido}</option>)}
                    </select>
                  )}

                  {personaTipo === 'CLIENTE' && (
                    <select className="form-select" value={selectedPersonaId} onChange={(e) => setSelectedPersonaId(e.target.value)}>
                      <option value="">-- Seleccionar Cliente --</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>ID #{c.id}: {c.nombre} {c.apellido}</option>)}
                    </select>
                  )}

                  {personaTipo === 'PROVEEDOR' && (
                    <select className="form-select" value={selectedPersonaId} onChange={(e) => setSelectedPersonaId(e.target.value)}>
                      <option value="">-- Seleccionar Proveedor --</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>ID #{p.id}: {p.razon_social}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Contraseña con Checklist Estricto */}
              <div className="form-group">
                <label>Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="password-requirements">
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem' }}>
                    Requisitos Estrictos de Contraseña (12+ Caracteres):
                  </div>
                  <div className={`req-item ${hasMinLength ? 'valid' : ''}`}>
                    {hasMinLength ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Mínimo 12 caracteres</span>
                  </div>
                  <div className={`req-item ${hasUpper ? 'valid' : ''}`}>
                    {hasUpper ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Al menos una letra mayúscula (A-Z)</span>
                  </div>
                  <div className={`req-item ${hasLower ? 'valid' : ''}`}>
                    {hasLower ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Al menos una letra minúscula (a-z)</span>
                  </div>
                  <div className={`req-item ${hasNumber ? 'valid' : ''}`}>
                    {hasNumber ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Al menos un número (0-9)</span>
                  </div>
                  <div className={`req-item ${hasSpecial ? 'valid' : ''}`}>
                    {hasSpecial ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Al menos un carácter especial (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-danger" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
