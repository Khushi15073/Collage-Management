import { BookOpen, GraduationCap, HelpCircle, LayoutDashboard, ListChecks } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/faculty/dashboard"  },
  { label: "My Classes",      icon: BookOpen,        path: "/faculty/classes"    },
  { label: "Student List",    icon: GraduationCap,   path: "/faculty/students"   },
  { label: "Mark Attendance", icon: ListChecks,      path: "/faculty/attendance" },
  { label: "Help & Guide",    icon: HelpCircle,      path: "/faculty/help"       },
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
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}  // ✅ real navigation
              title={collapsed ? item.label : undefined}
              className={`w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {collapsed ? (
                <span className="flex justify-center">
                  <Icon size={16} />
                </span>
              ) : (
                <span>{item.label}</span>
              )}
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
