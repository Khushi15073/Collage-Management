import './App.css';
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/authSlice';

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
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useSelector((state: any) => state.auth);
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Restoring session...
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login/admin" />;
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

  // role can be object { name: "admin" } or plain string "admin"
  const role = user?.role?.name || user?.role || "";

  if (role === "admin")   return <Navigate to="/admin/dashboard" />;
  if (role === "faculty") return <Navigate to="/faculty/dashboard" />;
  if (role === "student") return <Navigate to="/student/dashboard" />;

  return <Navigate to="/login/admin" />;
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
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admins"          element={<ProtectedRoute><AdminLayout><ManageAdmin /></AdminLayout></ProtectedRoute>} />
      <Route path="/students"        element={<ProtectedRoute><AdminLayout><ManageStudents /></AdminLayout></ProtectedRoute>} />
      <Route path="/faculty"         element={<ProtectedRoute><AdminLayout><ManageFaculty /></AdminLayout></ProtectedRoute>} />
      <Route path="/courses"         element={<ProtectedRoute><AdminLayout><ManageCourses /></AdminLayout></ProtectedRoute>} />
      <Route path="/degrees"         element={<ProtectedRoute><AdminLayout><ManageDegrees /></AdminLayout></ProtectedRoute>} />
      <Route path="/roles"           element={<ProtectedRoute><AdminLayout><RolesPermissions /></AdminLayout></ProtectedRoute>} />
      <Route path="/help"            element={<ProtectedRoute><AdminLayout><HelpGuide /></AdminLayout></ProtectedRoute>} />

      {/* ── Faculty Protected Pages ── */}
      <Route path="/faculty/dashboard"  element={<ProtectedRoute><FacultyLayout><FacultyDashboard /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/classes"    element={<ProtectedRoute><FacultyLayout><MyClasses /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/students"   element={<ProtectedRoute><FacultyLayout><StudentList /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/attendance" element={<ProtectedRoute><FacultyLayout><MarkAttendance /></FacultyLayout></ProtectedRoute>} />
      <Route path="/faculty/help"       element={<ProtectedRoute><FacultyLayout><HelpGuide /></FacultyLayout></ProtectedRoute>} />

      {/* ── Student Protected Pages ── */}
      <Route path="/student/dashboard"   element={<ProtectedRoute><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
      <Route path="/student/courses"     element={<ProtectedRoute><StudentLayout><MyCourses /></StudentLayout></ProtectedRoute>} />
      <Route path="/student/attendance"  element={<ProtectedRoute><StudentLayout><MyAttendance /></StudentLayout></ProtectedRoute>} />
      <Route path="/student/help"        element={<ProtectedRoute><StudentLayout><HelpGuide /></StudentLayout></ProtectedRoute>} />

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
