import { Navbar } from "../components/layout/navbar";
import Sidebar from "../components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar  />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        
        {/* Top Navbar */}
        {/* <Navbar /> */}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>

      </div>
    </div>
  );
}
