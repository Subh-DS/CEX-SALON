import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AuthFooter from "@/components/auth/AuthFooter";

const COMPACT_FOOTER_ROUTES = ["/login", "/signup", "/dashboard", "/book", "/loyalty", "/rewards"];

export default function CustomerLayout() {
  const { pathname } = useLocation();
  const compact = COMPACT_FOOTER_ROUTES.includes(pathname);
  return (
    <div className="min-h-screen bg-ivory font-body text-ink">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      {compact ? <AuthFooter /> : <Footer />}
    </div>
  );
}
