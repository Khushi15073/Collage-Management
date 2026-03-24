import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';

// ── Layout ──
import DashboardLayout from './layouts/adminLayout';

// ── 3 Separate Login Pages ──
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';

// ── Dashboard Pages ──
import Dashboard        from './components/Dashboard';
import ManageStudents   from './pages/ManageStudent';
import ManageFaculty    from './pages/ManageFaculty';
import ManageCourses    from './pages/ManageCourses';
import RolesPermissions from './pages/RolesPermissions';
import HelpGuide        from './pages/Helpguide';

// ✅ ProtectedRoute: if not logged in → redirect to login
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const user = useSelector((state: any) => state.auth.user);
//   return user ? <>{children}</> : <Navigate to="/login/admin" />;
// }

// ✅ All routes
function AppRoutes() {
  return (
    <Routes>

      {/* ── Default redirect ── */}
      <Route path="/"      element={<Navigate to="/login/admin" />} />
      <Route path="/login" element={<Navigate to="/login/admin" />} />

      {/* ── 3 Separate Login Pages ── */}
      <Route path="/login/admin"   element={<AdminLogin />} />
      <Route path="/login/faculty" element={<FacultyLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />

      {/* ── Protected Pages ── */}
      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/students"  element={<DashboardLayout><ManageStudents /></DashboardLayout>} />
      <Route path="/faculty"   element={<DashboardLayout><ManageFaculty /></DashboardLayout>} />
      <Route path="/courses"   element={<DashboardLayout><ManageCourses /></DashboardLayout>} />
      <Route path="/roles"     element={<DashboardLayout><RolesPermissions /></DashboardLayout>} />
      <Route path="/help"      element={<DashboardLayout><HelpGuide /></DashboardLayout>} />

      {/* ── 404 ── */}
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-200">404</h1>
            <p className="text-gray-500 mt-2">Page not found</p>
          </div>
        </div>
      } />

    </Routes>
  );
}

// ✅ Provider wraps everything
function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;