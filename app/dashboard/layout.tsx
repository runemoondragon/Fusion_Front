'use client'

import React, { useState, useEffect, useRef } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        hamburgerRef.current && 
        !hamburgerRef.current.contains(event.target as Node) &&
        isMobileSidebarOpen
      ) {
        setIsMobileSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-[64px] left-0 h-[calc(100%-64px)]" ref={sidebarRef}>
          <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        </div>

        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
        )}

        <div className="md:ml-64">
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm md:hidden p-3 border-b border-gray-200">
            <button 
              ref={hamburgerRef}
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
          </header>

          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 