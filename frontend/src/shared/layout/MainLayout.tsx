import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../components/command-palette/CommandPalette';

export const MainLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Fixed Sidebar Left (240px) */}
      <Sidebar />

      {/* Main Content Area Right */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
