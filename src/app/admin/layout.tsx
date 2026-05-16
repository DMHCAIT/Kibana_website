export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Full-screen overlay so the store header/footer are hidden in admin
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-hidden">
      {children}
    </div>
  );
}
