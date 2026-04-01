import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import {
  LayoutDashboard, Users, UsersRound, BookOpen,
  Settings, HelpCircle, ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react';

// ✅ Props the Sidebar receives from App.tsx
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// ✅ Each menu item now has a "path" for navigation
interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

// ✅ Menu items with their routes
const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',          path: '/'            },
  { icon: UsersRound,      label: 'Manage Admins',      path: '/admins'      },
  { icon: Users,           label: 'Manage Students',    path: '/students'    },
  { icon: UsersRound,      label: 'Manage Faculty',     path: '/faculty'     },
  { icon: BookOpen,        label: 'Manage Courses',     path: '/courses'     },
  { icon: GraduationCap,   label: 'Create Degree',      path: '/degrees'     },
  { icon: Settings,        label: 'Roles & Permissions',path: '/roles'       },
  { icon: HelpCircle,      label: 'Help & Guide',       path: '/help'        },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const user = useSelector((state: any) => state.auth.user);

  const navigate = useNavigate();

 
  const location = useLocation();

  return (
    <div className={`bg-white h-screen border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

      {/* ── Logo & Collapse Button ── */}
      <div className={`relative p-4 flex items-center border-b border-gray-200 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">CMS</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`rounded p-1 text-gray-600 transition hover:bg-gray-100 ${isCollapsed ? "absolute top-4 right-3" : ""}`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ── Navigation Menu ── */}
      <nav className="flex-1 overflow-hidden p-3">
        {menuItems.map((item) => {

          // ✅ Check if this item matches the current URL
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}  
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'              
                  : 'text-gray-700 hover:bg-gray-100'      
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {isCollapsed ? (
                <item.icon className="w-4 h-4 flex-shrink-0" />
              ) : (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Current Role Footer ── */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Current Role</div>
          <div className="text-sm font-semibold text-blue-600">
            {user?.role ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1) : "Admin"}
          </div>
        </div>
      )}

    </div>
  );
}
