import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { RegisterUser } from './pages/RegisterUser';
import { Dashboard } from './pages/Dashboard';
import { VehiclesList } from './pages/VehiclesList';
import { VehicleForm } from './pages/VehicleForm';
import { UploadPhotos } from './pages/UploadPhotos';
import { AnalysisResult } from './pages/AnalysisResult';
import { AnalysisError } from './pages/AnalysisError';
import { InspectionHistory } from './pages/InspectionHistory';
import { CompareInspections } from './pages/CompareInspections';
import { GenerateReport } from './pages/GenerateReport';
import { UsersRoles } from './pages/UsersRoles';

interface NavHistoryItem {
  page: string;
  params: any;
}

const MainNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const saved = sessionStorage.getItem('autocheck_current_page');
    const token = localStorage.getItem('autocheck_token');
    if (!token) {
      return saved === 'register' ? 'register' : 'login';
    }
    return saved && saved !== 'login' ? saved : 'dashboard';
  });
  const [navigationParams, setNavigationParams] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('autocheck_nav_params');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [historyStack, setHistoryStack] = useState<NavHistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('autocheck_history_stack');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    if (currentPage && currentPage !== 'login') {
      sessionStorage.setItem('autocheck_current_page', currentPage);
    } else {
      sessionStorage.removeItem('autocheck_current_page');
    }
  }, [currentPage]);

  React.useEffect(() => {
    sessionStorage.setItem('autocheck_nav_params', JSON.stringify(navigationParams));
  }, [navigationParams]);

  React.useEffect(() => {
    sessionStorage.setItem('autocheck_history_stack', JSON.stringify(historyStack));
  }, [historyStack]);

  React.useEffect(() => {
    if (user && currentPage === 'login') {
      setCurrentPage('dashboard');
      setHistoryStack([]);
    }
  }, [user]);

  const goBack = (fallbackPage: string = 'dashboard', fallbackParams: any = {}) => {
    if (historyStack.length > 0) {
      const nextStack = [...historyStack];
      const prevItem = nextStack.pop()!;
      setHistoryStack(nextStack);
      setCurrentPage(prevItem.page);
      setNavigationParams(prevItem.params || {});
    } else {
      setCurrentPage(fallbackPage);
      setNavigationParams(fallbackParams);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (page: string, params: any = {}) => {
    if (page === 'back') {
      goBack(params.fallback || 'dashboard', params.fallbackParams || {});
      return;
    }

    if (page === 'dashboard') {
      setHistoryStack([]);
    } else {

      const existingIndex = historyStack.findIndex((item) => item.page === page);
      if (existingIndex !== -1) {
        setHistoryStack((prev) => prev.slice(0, existingIndex));
      } else if (currentPage !== page && currentPage !== 'login') {

        setHistoryStack((prev) => [
          ...prev,
          { page: currentPage, params: navigationParams },
        ]);
      }
    }

    const paramsConOrigen = {
      ...params,
      from: params.from || currentPage,
    };
    setNavigationParams(paramsConOrigen);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Iniciando AutoCheck AI...</p>
        </div>
      </div>
    );
  }

  if (!user && currentPage !== 'register') {
    return <Login onNavigate={navigate} />;
  }

  switch (currentPage) {
    case 'login':
      return <Login onNavigate={navigate} />;
    case 'register':
      return <RegisterUser onNavigate={navigate} from={navigationParams.from} onBack={() => goBack(navigationParams.from === 'users' ? 'users' : 'login')} />;
    case 'dashboard':
      return <Dashboard onNavigate={navigate} />;
    case 'vehicles':
    case 'vehicles_list':
      return <VehiclesList onNavigate={navigate} onBack={() => goBack('dashboard')} />;
    case 'vehicle_form':
      return (
        <VehicleForm
          key={navigationParams.vehiculo ? `edit-${navigationParams.vehiculo.id}` : 'create'}
          vehiculo={navigationParams.vehiculo || null}
          onNavigate={navigate}
          onBack={() => goBack('vehicles')}
        />
      );
    case 'upload_photos':
    case 'new_inspection':
      if (user?.rol === 'PROPIETARIO') {
        return <VehiclesList onNavigate={navigate} onBack={() => goBack('dashboard')} />;
      }
      return (
        <UploadPhotos
          key={navigationParams.vehiculo ? `veh-${navigationParams.vehiculo.id}` : 'selector'}
          vehiculo={navigationParams.vehiculo || null}
          inspeccion={navigationParams.inspeccion || null}
          from={navigationParams.from}
          origenPrevio={navigationParams.origenPrevio}
          origenSecundario={navigationParams.origenSecundario}
          onNavigate={navigate}
          onBack={() => {
            if (navigationParams.from === 'analysis_result') {
              navigate('analysis_result', {
                vehiculo: navigationParams.vehiculo,
                inspeccion: navigationParams.inspeccion,
                from: navigationParams.origenSecundario || 'history',
                origenPrevio: navigationParams.origenPrevio,
              });
            } else if (navigationParams.from === 'vehicles') {
              navigate('vehicles');
            } else if (navigationParams.from === 'history') {
              navigate('history', { vehiculo: navigationParams.vehiculo, from: navigationParams.origenPrevio });
            } else {
              goBack('dashboard');
            }
          }}
        />
      );
    case 'analysis_result':
      return (
        <AnalysisResult
          vehiculo={navigationParams.vehiculo}
          inspeccion={navigationParams.inspeccion}
          from={navigationParams.from}
          origenPrevio={navigationParams.origenPrevio}
          onNavigate={navigate}
          onBack={() => {
            if (navigationParams.from === 'upload_photos') {
              navigate('upload_photos', {
                vehiculo: navigationParams.vehiculo,
                from: navigationParams.origenPrevio,
              });
            } else if (navigationParams.from === 'history' || navigationParams.origenPrevio === 'history') {
              navigate('history', {
                vehiculo: navigationParams.vehiculo,
                from: navigationParams.origenPrevio === 'vehicles' ? 'vehicles' : undefined,
              });
            } else if (navigationParams.from === 'vehicles' || navigationParams.origenPrevio === 'vehicles') {
              navigate('vehicles');
            } else {
              goBack('dashboard');
            }
          }}
        />
      );
    case 'analysis_error':
      return (
        <AnalysisError
          vehiculo={navigationParams.vehiculo}
          motivo={navigationParams.motivo}
          onNavigate={navigate}
          onBack={() => goBack('upload_photos')}
        />
      );
    case 'history':
    case 'inspection_history':
      return (
        <InspectionHistory
          key={navigationParams.vehiculo?.id ? `history-${navigationParams.vehiculo.id}` : 'history-all'}
          vehiculo={navigationParams.vehiculo || null}
          from={navigationParams.from}
          onNavigate={navigate}
          onBack={() => goBack(navigationParams.from === 'vehicles' ? 'vehicles' : 'dashboard')}
        />
      );
    case 'compare':
    case 'compare_inspections':
      return (
        <CompareInspections
          vehiculo={navigationParams.vehiculo}
          inspeccion_1_id={navigationParams.inspeccion_1_id}
          inspeccion_2_id={navigationParams.inspeccion_2_id}
          from={navigationParams.from}
          onNavigate={navigate}
          onBack={() => navigate('history', { vehiculo: navigationParams.vehiculo, from: navigationParams.from })}
        />
      );
    case 'reports':
    case 'generate_report':
      if (user?.rol !== 'ADMINISTRADOR') {
        return <Dashboard onNavigate={navigate} />;
      }
      return (
        <GenerateReport
          vehiculo={navigationParams.vehiculo || null}
          inspeccionId={navigationParams.inspeccionId}
          tipoReporte={navigationParams.tipoReporte}
          fechaDesdeInicial={navigationParams.fechaDesde}
          fechaHastaInicial={navigationParams.fechaHasta}
          from={navigationParams.from}
          onNavigate={navigate}
          onBack={() => {
            if (navigationParams.from === 'compare') {
              navigate('compare_inspections', {
                vehiculo: navigationParams.vehiculo,
                inspeccion_1_id: navigationParams.inspeccion_1_id,
                inspeccion_2_id: navigationParams.inspeccion_2_id,
              });
            } else if (navigationParams.from === 'history') {
              navigate('history', { vehiculo: navigationParams.vehiculo });
            } else {
              goBack('dashboard');
            }
          }}
        />
      );
    case 'users':
    case 'users_roles':
      if (user?.rol !== 'ADMINISTRADOR') {
        return <Dashboard onNavigate={navigate} />;
      }
      return <UsersRoles onNavigate={navigate} onBack={() => goBack('dashboard')} />;
    default:
      return <Dashboard onNavigate={navigate} />;
  }
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
