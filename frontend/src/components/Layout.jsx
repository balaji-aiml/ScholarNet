import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import useViewportHeight from '../services/useViewportHeight.js';

export default function Layout() {
  useViewportHeight();
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10">
        <Outlet />
      </main>
    </div>
  );
}
