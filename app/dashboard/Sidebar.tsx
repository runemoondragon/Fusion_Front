'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Chat', path: '/chat' },
  { name: 'Settings', path: '/dashboard/settings' },
  { name: 'Credits', path: '/dashboard/credits' },
  { name: 'API Keys', path: '/dashboard/api-keys' },
  { name: 'Provider Keys', path: '/dashboard/provider-keys' },
  { name: 'Provisioning Keys', path: '/dashboard/provisioning' },
  { name: 'Integrations', path: '/dashboard/integrations' },
  { name: 'Privacy', path: '/dashboard/privacy' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === item.path
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
} 