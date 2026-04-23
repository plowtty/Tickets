import { Outlet } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col" style={{ backgroundColor: 'var(--c-bg)' }}>
        <Navbar />
        <MobileSidebar />
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
