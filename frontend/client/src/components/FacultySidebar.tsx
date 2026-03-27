import { useNavigate, useLocation } from "react-router-dom";

// ✅ Assignments removed as requested
const menuItems = [
  { icon: "⊞", label: "Dashboard",      path: "/faculty/dashboard"  },
  { icon: "📚", label: "My Classes",     path: "/faculty/classes"    },
  { icon: "👤", label: "Student List",   path: "/faculty/students"   },
  { icon: "✅", label: "Mark Attendance",path: "/faculty/attendance" },
  { icon: "❓", label: "Help & Guide",   path: "/faculty/help"       },
];

interface FacultySidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function FacultySidebar({ collapsed, onToggle }: FacultySidebarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <aside className={`${collapsed ? "w-16" : "w-52"} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm`}>

      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">C</div>
            <span className="font-bold text-gray-800 text-lg">CMS</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          // ✅ Active state based on current URL — not local state
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}  // ✅ real navigation
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Current Role ── */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Current Role</p>
          <p className="text-sm font-semibold text-blue-600">Faculty</p>
        </div>
      )}
    </aside>
  );
}

export default FacultySidebar;
