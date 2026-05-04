import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-black overflow-x-hidden selection:bg-white selection:text-black">
      <Sidebar />
      <div className="flex-1 w-full relative">
        <TopBar />
        <main className="relative z-10 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
