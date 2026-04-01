import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { DashboardSearchProvider } from "../context/DashboardSearchContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardSearchProvider value={{ searchQuery, setSearchQuery }}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header searchValue={searchQuery} onSearchChange={setSearchQuery} />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </DashboardSearchProvider>
  )
}

export default DashboardLayout
