
import Navbar from "./Navbar";

export default function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">


      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar title={title} subtitle={subtitle} />

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
