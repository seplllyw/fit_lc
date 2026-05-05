import { Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import BottomTabLayout from './layouts/BottomTabLayout';
import SidebarLayout from './layouts/SidebarLayout';
import SettingsLayout from './layouts/SettingsLayout';
import ToastContainer from './components/Toast';
import AppTipBanner from './components/AppTipBanner';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import History from './pages/History';
import Trends from './pages/Trends';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import PlanGenerate from './pages/PlanGenerate';
import PlanDetail from './pages/PlanDetail';
import PlanExecute from './pages/PlanExecute';
import Muscles from './pages/Muscles';
import Exercises from './pages/Exercises';
import Measurements from './pages/Measurements';
import AdminExercises from './pages/admin/Exercises';
import AdminMuscles from './pages/admin/Muscles';
import Badges from './pages/Badges';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Security from './pages/Security';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-primary">
          <div className="text-accent-red font-heading text-xl">加载失败，请刷新页面</div>
        </div>
      );
    }
    return this.props.children;
  }
}

function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return { isAuthenticated };
}

// 用户端布局（Bottom Tab）
function UserLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return (
    <div className="min-h-screen flex flex-col">
      <AppTipBanner />
      <Outlet />
    </div>
  );
}

// 管理端布局（Sidebar）
function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user?.roles?.includes('admin')) {
    return <Navigate to="/chat" />;
  }
  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-primary">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* 用户端路由 - Bottom Tab 布局 */}
            <Route element={<UserLayout />}>
              <Route element={<BottomTabLayout />}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/history" element={<History />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/new" element={<PlanGenerate />} />
                <Route path="/plans/:id" element={<PlanDetail />} />
                <Route path="/plans/:id/execute" element={<PlanExecute />} />
                <Route path="/muscles" element={<Muscles />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/measurements" element={<Measurements />} />
                <Route path="/dashboard" element={<Navigate to="/history?tab=dashboard" />} />
                <Route path="/badges" element={<Badges />} />
                <Route path="/" element={<Navigate to="/chat" />} />
              </Route>
            </Route>

            {/* 设置页面布局 - 无底部导航栏 */}
            <Route element={<SettingsLayout />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/security" element={<Security />} />
              <Route path="/calendar" element={<Calendar />} />
            </Route>

            {/* 管理端路由 - Sidebar 布局 */}
            <Route element={<AdminLayout />}>
              <Route element={<SidebarLayout />}>
                <Route path="/admin/exercises" element={<AdminExercises />} />
                <Route path="/admin/muscles" element={<AdminMuscles />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;