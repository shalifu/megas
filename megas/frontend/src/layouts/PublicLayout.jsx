import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold text-white">
            MEGAS
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/services" className="hover:text-white">Services</Link>
            <Link to="/portfolio" className="hover:text-white">Portfolio</Link>
            <Link to="/careers" className="hover:text-white">Careers</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            {user ? (
              <Link to="/dashboard" className="rounded-full bg-brand-500 px-4 py-2 text-white hover:bg-brand-400">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="rounded-full bg-brand-500 px-4 py-2 text-white hover:bg-brand-400">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
