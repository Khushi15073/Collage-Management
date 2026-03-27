import { Shield, User, GraduationCap } from "lucide-react";

function HelpGuide() {
  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quick Guide</h1>
        <p className="text-sm text-gray-400 mt-1">Learn how to use the College Management System</p>
      </div>

      {/* ── Role Access Cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Admin Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
          {/* Icon + Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Admin</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-gray-900">Administrator Access</h2>

          {/* Feature List */}
          <ul className="space-y-1.5 text-sm text-gray-600 flex-1">
            <li>• Full system access</li>
            <li>• Manage students and faculty</li>
            <li>• Configure courses</li>
            <li>• Set role permissions</li>
            <li>• Generate reports</li>
            <li>• View all analytics</li>
          </ul>

          {/* Demo Login */}
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Demo Login:</p>
            <p className="text-xs text-gray-700">admin@college.edu / admin123</p>
          </div>
        </div>

        {/* Faculty Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
          {/* Icon + Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Faculty</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-gray-900">Faculty Access</h2>

          {/* Feature List */}
          <ul className="space-y-1.5 text-sm text-gray-600 flex-1">
            <li>• View assigned classes</li>
            <li>• Access student lists</li>
            <li>• Mark attendance</li>
            <li>• Manage course activities</li>
            <li>• Review student progress</li>
            <li>• View class analytics</li>
          </ul>

          {/* Demo Login */}
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Demo Login:</p>
            <p className="text-xs text-gray-700">faculty@college.edu / faculty123</p>
          </div>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
          {/* Icon + Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-500" />
            </div>
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Student</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-gray-900">Student Access</h2>

          {/* Feature List */}
          <ul className="space-y-1.5 text-sm text-gray-600 flex-1">
            <li>• View enrolled courses</li>
            <li>• Track attendance</li>
            <li>• Follow course updates</li>
            <li>• Check grades</li>
            <li>• View results</li>
            <li>• Access course materials</li>
          </ul>

          {/* Demo Login */}
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Demo Login:</p>
            <p className="text-xs text-gray-700">student@college.edu / student123</p>
          </div>
        </div>

      </div>

      {/* ── Key Features Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

        <h2 className="text-base font-bold text-gray-800 mb-6">Key Features</h2>

        <div className="grid grid-cols-2 gap-8">

          {/* User Interface */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">User Interface</h3>
            <ul className="space-y-3">
              {[
                "Clean and modern design",
                "Responsive layout for all devices",
                "Interactive charts and graphs",
                "Real-time notifications",
                "Easy navigation with sidebar",
                "Search and filter capabilities",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 font-semibold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Functionality */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">Functionality</h3>
            <ul className="space-y-3">
              {[
                "Role-based access control",
                "CRUD operations for all entities",
                "Attendance management",
                "Course and classroom management",
                "Grade management",
                "Analytics and reporting",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 font-semibold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}

export default HelpGuide;
