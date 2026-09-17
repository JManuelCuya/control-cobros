import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { FacturacionPage } from './pages/FacturacionPage';
import { CobrosPage } from './pages/CobrosPage';
import { PedidosPage } from './pages/PedidosPage';
import { ProductosPage } from './pages/ProductosPage';
import { CategoriasPage } from './pages/CategoriasPage';
import { ClientesPage } from './pages/ClientesPage';
import { EmpleadosPage } from './pages/EmpleadosPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { PlanesPage } from './pages/PlanesPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { SucursalesPage } from './pages/SucursalesPage';
import { DecodificadoresPage } from './pages/DecodificadoresPage';
import { SuscriptoresPage } from './pages/SuscriptoresPage';

import { Toaster } from 'react-hot-toast';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('facturacion');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('usuario_sistema');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('usuario_sistema');
      }
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('usuario_sistema', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('usuario_sistema');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!currentUser) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'facturacion':
        return <FacturacionPage onNavigate={setActiveTab} />;
      case 'cobros':
        return <CobrosPage />;
      case 'pedidos':
        return <PedidosPage />;
      case 'productos':
        return <ProductosPage />;
      case 'categorias':
        return <CategoriasPage />;
      case 'clientes':
        return <ClientesPage />;
      case 'empleados':
        return <EmpleadosPage />;
      case 'proveedores':
        return <ProveedoresPage />;
      case 'planes':
        return <PlanesPage />;
      case 'usuarios':
        return <UsuariosPage currentUser={currentUser} />;
      case 'sucursales':
        return <SucursalesPage />;
      case 'decodificadores':
        return <DecodificadoresPage />;
      case 'suscriptores':
        return <SuscriptoresPage />;
      default:
        return <FacturacionPage onNavigate={setActiveTab} />;
    }
  };

  const handleMobileSidebarClose = () => setIsMobileSidebarOpen(false);

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      {/* Overlay para móvil */}
      <div 
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        onClick={handleMobileSidebarClose}
      ></div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          handleMobileSidebarClose();
        }} 
        user={currentUser} 
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />
      <div className="main-content">
        <Navbar 
          user={currentUser} 
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="page-container">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
