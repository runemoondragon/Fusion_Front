'use client'

import React from 'react'
import ChatLayout from '../components/chat/ChatLayout'
import ProtectedRoute from '../components/ProtectedRoute'

// This page is now primarily responsible for wrapping the ChatLayout
// with any page-specific context or providers if needed in the future.
function ChatPage() {
  return (
    <ChatLayout />
    // If ProtectedRoute is still necessary for the whole chat page,
    // it might wrap ChatLayout, or ChatLayout could handle its own auth checks internally.
    // For now, assuming ChatLayout will integrate auth or it's handled globally.
  )
}

// If you need to protect this route, ensure ProtectedRoute is correctly implemented
// and wraps the content that needs protection.
// For instance, if ChatLayout handles auth checks internally, this might be simpler.
export default function ProtectedChatPage() {
  return (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  )
} 