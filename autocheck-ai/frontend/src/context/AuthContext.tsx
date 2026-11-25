import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface Usuario {
  id: number;
  email: string;
  nombre_completo: string;
  rol: 'PROPIETARIO' | 'OPERADOR' | 'ADMINISTRADOR';
  rol_display: string;
  bloqueado?: boolean;
}

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (nombre: string, email: string, password: string, rol: string) => Promise<any>;
  logout: () => void;
  updateUser: (updatedUser: Usuario) => void;
  refreshProfile: () => Promise<Usuario | null>;
  isAdmin: boolean;
  isOperador: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (): Promise<Usuario | null> => {
    try {
      const res = await api.get('/auth/perfil/');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('autocheck_user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (e: any) {
      if (e.response?.status === 401) {
        logout();
      }
    }
    return null;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('autocheck_token');
    const savedUser = localStorage.getItem('autocheck_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        api.get('/auth/perfil/')
          .then((res) => {
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('autocheck_user', JSON.stringify(res.data));
            }
          })
          .catch((err) => {
            if (err.response?.status === 401) {
              logout();
            }
          });
      } catch (e) {
        localStorage.removeItem('autocheck_token');
        localStorage.removeItem('autocheck_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    const { user: userData, access } = response.data;

    const ultimoUsuario = localStorage.getItem('autocheck_ultimo_logout_usuario');
    const ultimoTiempo = localStorage.getItem('autocheck_ultimo_logout_tiempo');
    if (ultimoUsuario && ultimoTiempo && userData?.id) {
      const mismoUsuario = ultimoUsuario === String(userData.id);
      const tiempoPasado = Date.now() - parseInt(ultimoTiempo, 10);
      if (mismoUsuario && tiempoPasado < 30 * 60 * 1000) {
        sessionStorage.setItem('autocheck_reingreso_reciente', 'true');
      }
    }
    localStorage.removeItem('autocheck_ultimo_logout');
    localStorage.removeItem('autocheck_ultimo_logout_usuario');
    localStorage.removeItem('autocheck_ultimo_logout_tiempo');

    setUser(userData);
    setToken(access);
    localStorage.setItem('autocheck_token', access);
    localStorage.setItem('autocheck_user', JSON.stringify(userData));
    return response.data;
  };

  const register = async (nombre_completo: string, email: string, password: string, rol: string) => {
    const response = await api.post('/auth/registro/', {
      nombre_completo,
      email,
      password,
      rol,
    });
    sessionStorage.setItem('autocheck_usuario_nuevo', 'true');
    return response.data;
  };

  const logout = () => {
    if (user?.id) {
      localStorage.setItem('autocheck_ultimo_logout_usuario', String(user.id));
      localStorage.setItem('autocheck_ultimo_logout_tiempo', Date.now().toString());
    }
    localStorage.removeItem('autocheck_ultimo_logout');
    setUser(null);
    setToken(null);
    localStorage.removeItem('autocheck_token');
    localStorage.removeItem('autocheck_user');
    sessionStorage.clear();
  };

  const updateUser = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem('autocheck_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const isOperador = user?.rol === 'OPERADOR' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
        isAdmin,
        isOperador,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
