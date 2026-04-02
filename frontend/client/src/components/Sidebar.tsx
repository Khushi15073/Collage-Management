import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import {
  ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react';
import { formatRoleName, getVisibleNavItems } from "../access/appAccess";

// ✅ Props the Sidebar receives from App.tsx
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const user = useSelector((state: any) => state.auth.user);
  const menuItems = getVisibleNavItems(user, "admin");

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
          const Icon = item.icon;

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
                <Icon className="w-4 h-4 flex-shrink-0" />
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
            {user?.role ? formatRoleName(String(user.role)) : "Admin"}
          </div>
        </div>
      )}

    </div>
  );
}
