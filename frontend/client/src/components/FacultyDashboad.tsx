import { useState } from "react";

const sidebarItems = [
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "📚", label: "My Classes", active: false },
  { icon: "👤", label: "Student List", active: false },
  { icon: "✅", label: "Mark Attendance", active: false },
  { icon: "📝", label: "Assignments", active: false },
  { icon: "❓", label: "Help & Guide", active: false },
];

const stats = [
  { icon: "📖", label: "My Courses", value: 3, color: "bg-blue-500" },
  { icon: "👥", label: "Total Students", value: 125, color: "bg-emerald-500" },
  { icon: "📋", label: "Pending Reviews", value: 12, color: "bg-violet-500" },
  { icon: "📅", label: "Classes This Week", value: 15, color: "bg-orange-500" },
];

const classes = [
  {
    code: "CS-301",
    name: "Data Structures & Algorithms",
    students: 45,
    schedule: "Mon, Wed, Fri 10:00–11:00 AM",
    active: true,
  },
  {
    code: "CS-401",
    name: "Machine Learning",
    students: 38,
    schedule: "Tue, Thu 2:00–3:30 PM",
    active: false,
  },
  {
    code: "CS-201",
    name: "Database Systems",
    students: 42,
    schedule: "Mon, Wed 3:00–4:30 PM",
    active: false,
  },
];

const upcoming = [
  { name: "Data Structures", time: "Today, 10:00 AM", room: "Room 301" },
  { name: "Machine Learning", time: "Tomorrow, 2:00 PM", room: "Room 405" },
  { name: "Database Systems", time: "Tomorrow, 3:00 PM", room: "Room 203" },
];

export default function FacultyDashboard() {
  const [activeSidebar, setActiveSidebar] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-52"
        } bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                C
              </div>
              <span className="font-bold text-gray-800 text-lg">CMS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveSidebar(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSidebar === i
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Current Role */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Current Role</p>
            <p className="text-sm font-semibold text-blue-600">Faculty</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shadow-sm">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                PMC
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">Prof. Michael Chen</p>
                <p className="text-xs text-gray-400">Faculty</p>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-xl`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lower Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* My Classes */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">My Classes</h2>
              <div className="space-y-3">
                {classes.map((cls, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 transition-all ${
                      cls.active
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                          {cls.code}
                        </span>
                        <h3 className="text-sm font-bold text-gray-800">{cls.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>👥 {cls.students} students</span>
                      <span>🕐 {cls.schedule}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 text-xs font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      <button className="px-4 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Take Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">Upcoming Classes</h2>
              <div className="space-y-3">
                {upcoming.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm flex-shrink-0">
                      📅
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.time}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{u.room}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}