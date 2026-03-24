
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

// ✅ This component accepts a "role" prop so we can reuse
// it for Admin, Faculty, and Student login pages
type Role = "admin" | "faculty" | "student";

interface LoginPageProps {
  role: Role;
}

// ✅ Role-specific config (colors, labels, demo credentials)
const roleConfig = {
  admin: {
    label: "Admin",
    badge: "bg-red-500",
    btnColor: "bg-gray-900 hover:bg-gray-700",
    demoEmail: "admin@college.edu",
    demoPassword: "admin123",
    dashboardPath: "/",
  },
  faculty: {
    label: "Faculty",
    badge: "bg-blue-500",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    demoEmail: "faculty@college.edu",
    demoPassword: "faculty123",
    dashboardPath: "/faculty",
  },
  student: {
    label: "Student",
    badge: "bg-green-500",
    btnColor: "bg-green-600 hover:bg-green-700",
    demoEmail: "student@college.edu",
    demoPassword: "student123",
    dashboardPath: "/student",
  },
};

function LoginPage({ role }: LoginPageProps) {
  const navigate = useNavigate();
  const config = roleConfig[role];

  // ✅ Form state
  const [email, setEmail]       = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [error, setError]       = useState<string>("");

  // ─────────────────────────────────────────
  // Handle Sign In
  // ─────────────────────────────────────────
  function handleLogin() {
    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Check demo credentials
    if (email === config.demoEmail && password === config.demoPassword) {
      setError("");
      navigate(config.dashboardPath); // go to dashboard
    } else {
      setError("Invalid email or password. Try the demo credentials below.");
    }
  }

  // ─────────────────────────────────────────
  // Fill demo credentials automatically
  // ─────────────────────────────────────────
  function fillDemo() {
    setEmail(config.demoEmail);
    setPassword(config.demoPassword);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">

      {/* ── Login Card ── */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-8 py-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            College Management <br /> System
          </h1>
          <p className="text-sm text-gray-400 mt-2">Sign in to access your dashboard</p>

          {/* Role Badge */}
          <span className={`mt-3 px-4 py-1 rounded-full text-white text-xs font-bold ${config.badge}`}>
            {config.label} Portal
          </span>
        </div>

        {/* ── Error Message ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* ── Email Field ── */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@college.edu"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* ── Password Field ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <button
              onClick={fillDemo}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10"
            />
            {/* Show/Hide password toggle */}
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* ── Sign In Button ── */}
        <button
          onClick={handleLogin}
          className={`w-full text-white py-3 rounded-lg text-sm font-bold transition ${config.btnColor}`}
        >
          Sign In
        </button>

       

        {/* ── Demo Credentials ── */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600">📧 {config.demoEmail}</p>
          <p className="text-xs text-gray-600 mt-1">🔑 {config.demoPassword}</p>
          <button
            onClick={fillDemo}
            className="mt-2 text-xs text-blue-600 hover:underline font-medium"
          >
            Click to auto-fill →
          </button>
        </div>

        {/* ── Switch Role Links ── */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-2">Sign in as a different role</p>
          <div className="flex justify-center gap-3">
            {role !== "admin" && (
              <Link to="/login/admin" className="text-xs text-red-500 hover:underline font-medium">
                Admin
              </Link>
            )}
            {role !== "faculty" && (
              <Link to="/login/faculty" className="text-xs text-blue-500 hover:underline font-medium">
                Faculty
              </Link>
            )}
            {role !== "student" && (
              <Link to="/login/faculty" className="text-xs text-green-500 hover:underline font-medium">
                Student
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;