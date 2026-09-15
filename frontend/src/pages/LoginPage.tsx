import React, { useState } from 'react';
import { Tv, Lock, Mail, LogIn } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const user = await authApi.login(correo, password);
      toast.success(`¡Bienvenido, ${user.nombre || 'Usuario'}!`);
      onLoginSuccess(user);
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e2e8f0',
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '1rem',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Tv size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', letterSpacing: '0.05em' }}>
            CABLE TV
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Sistema de Control de Ventas e Inventario
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} /> Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="usuario@empresa.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} /> Contraseña
            </label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.75rem',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            <LogIn size={18} /> {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
