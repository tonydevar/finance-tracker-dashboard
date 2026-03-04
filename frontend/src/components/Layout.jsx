import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from './SidebarContext';
import Sidebar from './Sidebar';
import './Layout.css';

function LayoutInner() {
  const { collapsed } = useSidebar();

  return (
    <div className="layout">
      <Sidebar />
      <main className={`layout-main${collapsed ? ' layout-main--collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
