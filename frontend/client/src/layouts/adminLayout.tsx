import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
   return  (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout