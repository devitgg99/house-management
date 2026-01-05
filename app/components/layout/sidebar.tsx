import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-full">
      <div className="p-6 font-bold text-xl">
        🏠 HouseMS
      </div>

      <nav className="px-4 space-y-2">
        <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-100">
          Dashboard
        </Link>

        <Link href="/houses" className="block p-2 rounded hover:bg-gray-100">
          Houses
        </Link>

        <Link href="/rooms" className="block p-2 rounded hover:bg-gray-100">
          Rooms
        </Link>

        <Link href="/utilities" className="block p-2 rounded hover:bg-gray-100">
          Utilities
        </Link>
      </nav>
    </aside>
  );
}
