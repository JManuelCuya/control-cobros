import React from 'react';
import { LogOut, Tv, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isCollapsed, onToggleSidebar, onToggleMobileSidebar }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          title="Abrir menú"
        >
          <Menu size={24} />
        </button>
        <button
          className="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          title={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
          <Tv size={20} />
          <span>CABLE TV <span className="hide-on-mobile">- Sistema de Control de Ventas e Inventario</span></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            border: '1px solid #7dd3fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7',
            fontWeight: 700
          }}>
            {(user?.correo?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.descripcion || user?.correo || 'Usuario'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.correo}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn-danger"
          style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          title="Cerrar Sesión"
        >
          <LogOut size={16} /> Salir
        </button>
      </div>
    </header>
  );
};
