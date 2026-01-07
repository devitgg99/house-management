import RoleSidebar from "@/components/layout/role-sidebar";

export default function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar />
      <main className="lg:ml-64 min-h-screen p-4 lg:p-6 pt-4">
        {children}
      </main>
    </div>
  );
}
