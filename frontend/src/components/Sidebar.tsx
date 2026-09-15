import React, { useState } from 'react';
import { 
  Tv,
  ShoppingBag, 
  Tag, 
  Users, 
  UserCheck, 
  Package, 
  Truck, 
  Award, 
  Shield,
  CalendarCheck,
  Receipt,
  ChevronDown,
  ChevronRight,
  Briefcase,
  ShoppingCart,
  Archive,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  isCollapsed 
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ ventas: true, socios: true, inventario: true, gestion: true });

  const allMenuItems = [
    { 
      id: 'ventas', 
      label: 'Ventas', 
      icon: ShoppingCart,
      children: [
        { id: 'facturacion', label: 'Facturación Electrónica', icon: Receipt },
        { id: 'pedidos', label: 'Pedidos / Ventas', icon: ShoppingBag },
      ]
    },
    { 
      id: 'inventario', 
      label: 'Inventario', 
      icon: Archive,
      children: [
        { id: 'productos', label: 'Productos', icon: Package },
        { id: 'categorias', label: 'Categorías', icon: Tag },
        { id: 'planes', label: 'Planes', icon: Award },
      ]
    },
    { 
      id: 'socios', 
      label: 'Socios de Negocio', 
      icon: Briefcase,
      children: [
        { id: 'clientes', label: 'Clientes', icon: Users },
        { id: 'empleados', label: 'Empleados', icon: UserCheck },
        { id: 'proveedores', label: 'Proveedores', icon: Truck },
      ]
    },
    { 
      id: 'gestion', 
      label: 'Gestión', 
      icon: Settings,
      children: [
        { id: 'cobros', label: 'Control de Cobros', icon: CalendarCheck },
        { id: 'usuarios', label: 'Usuarios / Roles', icon: Shield }
      ]
    }
  ];

  const vistasPermitidas: string[] = user?.vistasPermitidas || [
    'facturacion', 'cobros', 'pedidos', 'productos', 'categorias', 'clientes', 'empleados', 'proveedores', 'planes', 'usuarios'
  ];

  const filteredItems = allMenuItems.filter(item => {
    if (item.children) {
      return item.children.some(child => vistasPermitidas.includes(child.id));
    }
    return vistasPermitidas.includes(item.id);
  });

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <Tv size={28} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
        <span>CABLE TV</span>
      </div>

      <ul className="nav-list">
        {filteredItems.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {!isCollapsed && 'No tienes vistas autorizadas asignadas aún para tus roles.'}
          </div>
        ) : (
          allMenuItems.map((item) => {
            // Check if item or its children are permitted
            let isItemPermitted = false;
            let permittedChildren: any[] = [];
            
            if (item.children) {
              permittedChildren = item.children.filter(child => vistasPermitidas.includes(child.id));
              if (permittedChildren.length > 0) isItemPermitted = true;
            } else {
              if (vistasPermitidas.includes(item.id)) isItemPermitted = true;
            }

            if (!isItemPermitted) return null;

            const Icon = item.icon;
            
            if (item.children && permittedChildren.length > 0) {
              const isOpen = openGroups[item.id];
              const isChildActive = permittedChildren.some(child => child.id === activeTab);
              
              return (
                <li key={item.id} style={{ marginBottom: '0.25rem' }}>
                  <button
                    className={`nav-item ${isChildActive ? 'active' : ''}`}
                    onClick={() => setOpenGroups(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    title={isCollapsed ? item.label : undefined}
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={20} style={{ flexShrink: 0 }} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  </button>
                  {isOpen && !isCollapsed && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0.25rem 0 0 1rem', borderLeft: '2px solid var(--border-color)' }}>
                      {permittedChildren.map(child => {
                        const ChildIcon = child.icon;
                        return (
                          <li key={child.id}>
                            <button
                              className={`nav-item ${activeTab === child.id ? 'active' : ''}`}
                              onClick={() => setActiveTab(child.id)}
                              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.9rem', minHeight: '38px' }}
                            >
                              <ChildIcon size={18} style={{ flexShrink: 0 }} />
                              <span>{child.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
};
