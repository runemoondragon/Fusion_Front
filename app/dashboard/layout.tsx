'use client'

import React from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import Sidebar from './Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 