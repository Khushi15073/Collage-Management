import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { loginUser } from "../features/authSlice";

function FacultyLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const loading = useSelector((state: any) => state.auth.loading);
  const error = useSelector((state: any) => state.auth.error);

  async function handleLogin() {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password.trim()) nextErrors.password = "Password is required.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = await dispatch(loginUser({ email, password }) as any);

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload?.data?.user?.role;

      if (role === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        alert("Access denied. This portal is for Faculty only.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md px-8 py-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Faculty Portal</h1>
          <p className="text-sm text-gray-400 mt-1">College Management System</p>
          <span className="mt-3 px-4 py-1 rounded-full text-white text-xs font-bold bg-blue-500">
            Faculty Access
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="faculty@college.edu"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 ${
              fieldErrors.email ? "border-red-300" : "border-gray-200"
            }`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <button className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</button>
          </div>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              placeholder="Enter your password"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-10 ${
                fieldErrors.password ? "border-red-300" : "border-gray-200"
              }`}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-bold transition ${
            loading || !email || !password ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing in..." : "Sign In as Faculty"}
        </button>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-2">Sign in as different role</p>
          <div className="flex justify-center gap-4">
            <Link to="/login/admin" className="text-xs text-red-500 hover:underline font-semibold">Admin</Link>
            <Link to="/login/student" className="text-xs text-green-500 hover:underline font-semibold">Student</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyLogin;
