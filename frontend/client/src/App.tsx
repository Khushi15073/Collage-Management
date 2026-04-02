import './App.css';
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/authSlice';
import { canAccessPath, getLandingPath } from './access/appAccess';

// ── Layouts ──
import AdminLayout   from './layouts/adminLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentLayout from './layouts/studentLayout';

// ── Login Pages ──
import AdminLogin   from './pages/AdminLogin';
import FacultyLogin from './pages/FacultyLogin';
import StudentLogin from './pages/StudentLogin';

// ── Admin Pages ──
import Dashboard        from './components/Dashboard';
import ManageAdmin      from './pages/admin/ManageAdmin';
import ManageStudents   from './pages/admin/ManageStudent';
import ManageFaculty    from './pages/admin/ManageFaculty';
import ManageCourses    from './pages/admin/ManageCourses';
import ManageDegrees    from './pages/admin/ManageDegrees';
import RolesPermissions from './pages/admin/RolesPermissions';
import HelpGuide        from './pages/admin/Helpguide';

// ── Faculty Pages ──
import FacultyDashboard from './components/FacultyDashboad';
import MyClasses        from './pages/faculty/MyClasses';
import StudentList      from './pages/faculty/StudentList';
import MarkAttendance   from './pages/faculty/MarkAttendance';

// ── Student Pages ──                                  // ✅ new
import StudentDashboard from './components/studentDashboard';
import MyCourses        from './pages/student/MyCourses';
import MyAttendance     from './pages/student/Myattendance ';


// ─────────────────────────────────────────
// ✅ ProtectedRoute
// Redirects to login if user is not logged in
// ─────────────────────────────────────────
function ProtectedRoute({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const { user, initialized } = useSelector((state: any) => state.auth);
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Restoring session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login/admin" />;
  }

  return canAccessPath(user, path) ? <>{children}</> : <Navigate to={getLandingPath(user)} />;
}

// ─────────────────────────────────────────
// ✅ RoleRedirect
// After login redirects to correct dashboard
// based on role returned from your backend
// ─────────────────────────────────────────
function RoleRedirect() {
  const { user, initialized } = useSelector((state: any) => state.auth);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Restoring session...
      </div>
    );
  }

  if (!user) return <Navigate to="/login/admin" />;

  return <Navigate to={getLandingPath(user)} />;
}

// ─────────────────────────────────────────
// ✅ All routes
// ─────────────────────────────────────────
function AppRoutes() {
  const dispatch = useDispatch();
  const initialized = useSelector((state: any) => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth() as any);
    }
  }, [dispatch, initialized]);

  return (
    <Routes>

      {/* ── Default: redirect based on role ── */}
      <Route path="/"      element={<RoleRedirect />} />
      <Route path="/login" element={<Navigate to="/login/admin" />} />

      {/* ── Login Pages (public) ── */}
      <Route path="/login/admin"   element={<AdminLogin />} />
      <Route path="/login/faculty" element={<FacultyLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />

      {/* ── Admin Protected Pages ── */}
      <Route path="/admin/dashboard" element={<ProtectedRoute path="/admin/dashboard"><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admins"          element={<ProtectedRoute path="/admins"><AdminLayout><ManageAdmin /></AdminLayout></ProtectedRoute>} />
      <Route path="/students"        element={<ProtectedRoute path="/students"><AdminLayout><ManageStudents /></AdminLayout></ProtectedRoute>} />
      <Route path="/faculty"         element={<ProtectedRoute path="/faculty"><AdminLayout><ManageFaculty /></AdminLayout></ProtectedRoute>} />
      <Route path="/courses"         element={<ProtectedRoute path="/courses"><AdminLayout><ManageCourses /></AdminLayout></ProtectedRoute>} />
      <Route path="/degrees"         element={<ProtectedRoute path="/degrees"><AdminLayout><ManageDegrees /></AdminLayout></ProtectedRoute>} />
      <Route path="/roles"           element={<ProtectedRoute path="/roles"><AdminLayout><RolesPermissions /></AdminLayout></ProtectedRoute>} />
      <Route path="/help"            element={<ProtectedRoute path="/help"><AdminLayout><HelpGuide /></AdminLayout></ProtectedRoute>} />

      {/* ── Faculty Protected Pages ── */}
      <Route path="/faculty/dashboard"  element={<ProtectedRoute path="/faculty/dashboard"><FacultyLayout><FacultyDashboard /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/classes"    element={<ProtectedRoute path="/faculty/classes"><FacultyLayout><MyClasses /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/students"   element={<ProtectedRoute path="/faculty/students"><FacultyLayout><StudentList /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/attendance" element={<ProtectedRoute path="/faculty/attendance"><FacultyLayout><MarkAttendance /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/help"       element={<ProtectedRoute path="/faculty/help"><FacultyLayout><HelpGuide /></FacultyLayout></ProtectedRoute>} />

      {/* ── Student Protected Pages ── */}
      <Route path="/student/dashboard"   element={<ProtectedRoute path="/student/dashboard"><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
      <Route path="/student/courses"     element={<ProtectedRoute path="/student/courses"><StudentLayout><MyCourses /></StudentLayout></ProtectedRoute>} />
      <Route path="/student/attendance"  element={<ProtectedRoute path="/student/attendance"><StudentLayout><MyAttendance /></StudentLayout></ProtectedRoute>} />
      <Route path="/student/help"        element={<ProtectedRoute path="/student/help"><StudentLayout><HelpGuide /></StudentLayout></ProtectedRoute>} />

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

function App() {
  return <AppRoutes />;
}

export default App;
