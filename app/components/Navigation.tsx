'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout, isAuthenticated } from '../utils/auth' // Assuming these functions exist
import { useUser } from '../contexts/UserContext' // Import useUser
import { Search, User, LogOut, Settings, KeyRound, Activity, CreditCard } from 'lucide-react' // Using lucide-react for icons
import AuthModal from './auth/AuthModal' // Import the AuthModal

export default function Navigation() {
  const { user, isLoadingUser, clearUser } = useUser(); // Get user and clearUser from context
  const [authStatus, setAuthStatus] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false) // State for modal visibility
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login') // State for initial view
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update authStatus based on global user state from context primarily
  useEffect(() => {
    if (!isLoadingUser) { // Only update once global user state is determined
      setAuthStatus(!!user); // If user object exists, they are authenticated
    }
  }, [user, isLoadingUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef])

  const handleLogout = () => {
    clearUser(); // Call clearUser from UserContext
    setIsDropdownOpen(false)
    router.push('/') // Redirect to home or login page after logout
  }

  const openLoginModal = () => {
    setAuthModalView('login')
    setIsAuthModalOpen(true)
  }
  
  // Optional: Function to open signup directly if needed elsewhere
  const openSignupModal = () => {
      setAuthModalView('signup')
      setIsAuthModalOpen(true)
  }

  // Don't render header on auth pages or chat pages
  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/chat')) {
      return null;
  }

  // Determine what to display for the avatar
  const renderAvatar = () => {
    if (isLoadingUser) {
      return <div className="h-8 w-8 rounded-full bg-neutral-300 animate-pulse"></div>;
    }
    if (user && user.avatarUrl) {
      return <img src={user.avatarUrl} alt={user.displayName || 'User Avatar'} className="h-8 w-8 rounded-full object-cover" />;
    }
    if (user && user.email) { // Fallback to initials if no avatarUrl but email exists
        return (
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                {user.email[0].toUpperCase()}
            </div>
        );
    }
    // Default placeholder if no user or no email for initials
    return (
        <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center">
            <User className="h-5 w-5 text-neutral-600"/>
        </div>
    );
  };

  return (
    <>
    <nav className="bg-white border-b border-neutral-200 h-16 flex items-center px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between w-full">
        {/* Left Section: Logo */}
        <div className="flex items-center">
        <Link href="/" className="font-semibold text-lg tracking-tight mr-6">
            Fusion AI
          </Link>
        </div>

        {/* Center Section: Search (only when logged in) */}
        {authStatus && (
          <div className="flex-1 flex justify-center max-w-md mx-4">
             <div className="relative w-full">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-neutral-400" />
               </div>
               <input
                 type="search"
                 placeholder="Search models..."
                 className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
               />
             </div>
          </div>
        )}
        {!authStatus && <div className="flex-1"></div>} {/* Placeholder to keep balance when logged out */}


        {/* Right Section: Links & User Menu/Login */}
        <div className="flex items-center">
          {/* Common Links (Visible to all, before login/user menu) */}
          <div className="hidden md:flex items-center space-x-6 mr-6">
              <Link href="/chat" className="text-sm font-medium text-neutral-600 hover:text-orange-600">Chat</Link>
              {/* Add other common links like Docs, Pricing here if needed */}
          </div>
          
          {authStatus ? (
            <>
              {/* Top Links (Only visible when logged in) */}
              <div className="hidden md:flex items-center space-x-6 mr-6">
                <Link href="/models" className="text-sm font-medium text-neutral-600 hover:text-orange-600">Models</Link>
                <Link href="/rankings" className="text-sm font-medium text-neutral-600 hover:text-orange-600">Rankings</Link>
                <Link href="/docs" className="text-sm font-medium text-neutral-600 hover:text-orange-600">Docs</Link>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  {renderAvatar()} {/* Use the renderAvatar function here */}
                </button>

                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Link href="/dashboard/credits" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                      <CreditCard className="mr-2 h-4 w-4 text-neutral-500"/> Credits
                    </Link>
                    <Link href="/dashboard/provider-keys" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                       <KeyRound className="mr-2 h-4 w-4 text-neutral-500"/> Add Keys
                    </Link>
                    <Link href="/dashboard/activity" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                        <Activity className="mr-2 h-4 w-4 text-neutral-500"/> Activity
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                       <Settings className="mr-2 h-4 w-4 text-neutral-500"/> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-neutral-100"
                    >
                       <LogOut className="mr-2 h-4 w-4"/> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Login Button - Now triggers modal
            <button
              onClick={openLoginModal} // Changed from Link
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Login
            </button>
            // Optional: Add a separate Signup button here if desired
            // <button onClick={openSignupModal} className="ml-4 ...">Sign Up</button>
          )}
        </div>
      </div>
    </nav>
    
    {/* Render the AuthModal conditionally */}
    <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
        // Pass the current path as returnUrl? Or maybe specific dashboard path?
        returnUrl={pathname} 
    />
    </>
  )
} 