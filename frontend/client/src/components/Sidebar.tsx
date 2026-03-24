import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UsersRound, BookOpen,
  Settings, HelpCircle, ChevronLeft, GraduationCap
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
  { icon: Users,           label: 'Manage Students',    path: '/students'    },
  { icon: UsersRound,      label: 'Manage Faculty',     path: '/faculty'     },
  { icon: BookOpen,        label: 'Manage Courses',     path: '/courses'     },
  { icon: Settings,        label: 'Roles & Permissions',path: '/roles'       },
  { icon: HelpCircle,      label: 'Help & Guide',       path: '/help'        },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {


  const navigate = useNavigate();

 
  const location = useLocation();

  return (
    <div className={`bg-white h-screen border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

      {/* ── Logo & Collapse Button ── */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">CMS</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        )}
        {!isCollapsed && (
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* ── Navigation Menu ── */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {

          // ✅ Check if this item matches the current URL
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}  
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'              
                  : 'text-gray-700 hover:bg-gray-100'      
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
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
          <div className="text-sm font-semibold text-blue-600">Admin</div>
        </div>
      )}

    </div>
  );
}