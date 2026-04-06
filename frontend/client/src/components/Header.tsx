import { Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/authSlice";
import { formatRoleName } from "../access/appAccess";

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const initials =
    user?.name
      ?.split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 3) || "AD";

  async function handleLogout() {
    await dispatch(logoutUser() as any);
  }

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || "Admin"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role ? formatRoleName(String(user.role)) : "Admin"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
