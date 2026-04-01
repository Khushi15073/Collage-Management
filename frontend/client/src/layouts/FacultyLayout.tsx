import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/authSlice";
import FacultySidebar from "../components/FacultySidebar";
import { DashboardSearchProvider } from "../context/DashboardSearchContext";
import SearchField from "../components/ui/SearchField";

interface FacultyLayoutProps {
  children: React.ReactNode;
}

function FacultyLayout({ children }: FacultyLayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();

  // ✅ User from Redux — not hardcoded
  const user = useSelector((state: any) => state.auth.user);

  // Get initials e.g. "Prof. Michael Chen" → "PMC"
  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 3) || "FA";

  async function handleLogout() {
    await dispatch(logoutUser() as any);
  }

  return (
    <DashboardSearchProvider value={{ searchQuery, setSearchQuery }}>
      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

        {/* ── Sidebar ── */}
        <FacultySidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <header className="sticky top-0 z-20 shrink-0 flex items-center gap-4 border-b border-gray-100 bg-white px-6 py-3 shadow-sm">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <SearchField value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Bell */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                🔔
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* ✅ User info from Redux */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {user?.name || "Faculty"}
                  </p>
                  <p className="text-xs text-gray-400">Faculty</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>

        </div>
      </div>
    </DashboardSearchProvider>
  );
}

export default FacultyLayout;
