'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import { UserCircle, Settings2, LogOut, User as UserIcon } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import AuthModal from '../auth/AuthModal'

// Define the structure of a chat session based on your API response
interface ChatSession {
  id: number; // Assuming SERIAL PK
  user_id: number;
  title: string | null;
  ui_selected_provider: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  last_message_at: string; // ISO date string
}

interface ChatLayoutProps {
  // Props can be defined later if needed
}

const ChatLayout: React.FC<ChatLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Default open on desktop

  const [chatList, setChatList] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [errorChats, setErrorChats] = useState<string | null>(null)

  // Lifted state from ChatWindow
  const getDefaultModel = () => {
    if (typeof window !== 'undefined') {
        const savedModel = localStorage.getItem('userDefaultModel');
        const validModels = ['neuroswitch', 'openai', 'claude', 'gemini'];
        if (savedModel && validModels.includes(savedModel)) {
            return savedModel;
        }
    }
    return 'neuroswitch'; // Default
  };
  const [selectedModel, setSelectedModel] = useState<string>(getDefaultModel());
  const [neuroStatus, setNeuroStatus] = useState<'green' | 'orange' | ''>( '' );

  // Auth related state and hooks from Navigation.tsx
  const { user, isLoadingUser, clearUser } = useUser();
  const [authStatus, setAuthStatus] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoadingUser) {
      setAuthStatus(!!user);
    }
  }, [user, isLoadingUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    clearUser();
    setIsDropdownOpen(false);
    router.push('/');
  };

  const openLoginModal = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };
  
  const renderAvatar = () => {
    if (isLoadingUser) {
      return <div className="h-8 w-8 rounded-full bg-neutral-300 animate-pulse"></div>;
    }
    if (user && user.avatarUrl) {
      return <img src={user.avatarUrl} alt={user.displayName || 'User Avatar'} className="h-8 w-8 rounded-full object-cover" />;
    }
    if (user && user.email) {
        return (
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                {user.email[0].toUpperCase()}
            </div>
        );
    }
    return (
        <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-neutral-600"/>
        </div>
    );
  };

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoadingChats(true)
      setErrorChats(null)
      const token = localStorage.getItem('auth_token')
      // If not authenticated (no token or no user from context after loading), don't fetch chats
      // This relies on the authStatus being updated from the useUser hook
      if (!token || !authStatus) { 
        if (!isLoadingUser && !user) { // Only set error if user loading is complete and no user
            setErrorChats('Please log in to view your chats.');
        } else if (!token) {
             setErrorChats('Authentication token not found. Please log in.');
        }
        setChatList([]); // Clear chat list if not authenticated
        setIsLoadingChats(false);
        return;
      }

      try {
        const response = await axios.get<ChatSession[]>('/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setChatList(response.data)
      } catch (err: any) {
        console.error('Error fetching chats:', err)
        setErrorChats(err.response?.data?.error || 'Failed to fetch chat sessions.')
      }
      setIsLoadingChats(false)
    }
    // Fetch chats when authStatus is known and true, or when isLoadingUser changes (to catch initial load)
  if (!isLoadingUser) { // Ensures we only try to fetch after user status is determined
    if (authStatus) {
      fetchChats();
    } else {
      // If not authenticated, clear chats and set appropriate message
      setChatList([]);
      setErrorChats('Please log in to load your chats.');
      setIsLoadingChats(false);
    }
  }
  }, [authStatus, isLoadingUser]) // Depend on authStatus and isLoadingUser

  const handleNewChat = () => {
    if (!authStatus) {
      openLoginModal();
      return;
    }
    console.log('Creating new chat session (client-side)...')
    setActiveChatId(null)
  }

  const handleSelectChat = (chatId: number) => {
    if (!authStatus) {
      openLoginModal();
      return;
    }
    console.log('Selecting chat session:', chatId)
    setActiveChatId(chatId)
    const selectedChat = chatList.find(chat => chat.id === chatId);
    if (selectedChat && selectedChat.ui_selected_provider) {
      setSelectedModel(selectedChat.ui_selected_provider);
    } else {
      setSelectedModel(getDefaultModel());
    }
  }

  const handleChatCreated = (newlyCreatedChat: ChatSession) => {
    console.log('ChatLayout: New chat confirmed by ChatWindow:', newlyCreatedChat)
    setChatList(prevChatList => [newlyCreatedChat, ...prevChatList])
    setActiveChatId(newlyCreatedChat.id)
  }

  const handleUpdateChatTitle = async (chatId: number, newTitle: string) => {
    if (!authStatus) { openLoginModal(); return; }
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorChats('Authentication required to update chat title.');
      return;
    }

    try {
      const response = await axios.put<{ chat: ChatSession }>(
        `/api/chats/${chatId}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.chat) {
        setChatList(prevChatList =>
          prevChatList.map(chat =>
            chat.id === chatId ? { ...chat, title: response.data.chat.title, ui_selected_provider: selectedModel } : chat
          )
        );
      } else {
        setChatList(prevChatList =>
          prevChatList.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          )
        );
        console.warn('Chat title updated, but response structure was unexpected. Used optimistic update.');
      }

    } catch (err: any) {
      console.error('Error updating chat title:', err);
      setErrorChats(err.response?.data?.error || 'Failed to update chat title.');
    }
  };

  const handleDeleteChat = async (chatIdToDelete: number) => {
    if (!authStatus) { openLoginModal(); return; }
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorChats('Authentication required to delete chat.');
      return;
    }

    try {
      await axios.delete(`/api/chats/${chatIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatList(prevChatList => prevChatList.filter(chat => chat.id !== chatIdToDelete));

      if (activeChatId === chatIdToDelete) {
        setActiveChatId(null);
      }

    } catch (err: any) {
      console.error('Error deleting chat:', err);
      setErrorChats(err.response?.data?.error || 'Failed to delete chat.');
    }
  };

  const roomsForSidebar = chatList.map(chat => ({
    id: chat.id.toString(),
    name: chat.title || `Chat ${chat.id}`,
    provider: chat.ui_selected_provider
  }))

  return (
    <>
    <div className="flex h-screen bg-neutral-20 relative"> 
      <div className="fixed top-0 left-0 h-screen md:flex flex-col w-64 bg-gray-150 border-r border-neutral-150 z-30">
        <ChatSidebar 
          rooms={roomsForSidebar} 
          activeRoomId={activeChatId ? activeChatId.toString() : null}
          onNewRoom={handleNewChat}
          onSelectRoom={(roomId) => handleSelectChat(parseInt(roomId, 10))}
          onUpdateTitle={(roomId, newTitle) => handleUpdateChatTitle(parseInt(roomId, 10), newTitle)}
          onDeleteRoom={(roomId) => handleDeleteChat(parseInt(roomId, 10))}
          isLoading={isLoadingChats}
          error={errorChats}
          isUserAuth={authStatus}
          onLoginClick={openLoginModal}
        />
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Main Chat Window Area - Now relative for floating controls */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
          {/* Floating Controls Container */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 pr-6">
            {/* Left Side: Model Dropdown & Status */}
            <div className="ml-0"> 
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-sm py-1.5 bg-white bg-opacity-90 backdrop-blur-sm"
              >
                <option value="neuroswitch">NeuroSwitch</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
              </select>
              {selectedModel === 'neuroswitch' && (
                <span
                  id="neuroswitch-status-indicator-header"
                  className={`ml-2 text-xs ${neuroStatus === 'green' ? 'text-green-600' : neuroStatus === 'orange' ? 'text-orange-500' : 'text-gray-400'} bg-gray-100 bg-opacity-75 backdrop-blur-sm px-1.5 py-0.5 rounded-full`}
                  title="NeuroSwitch Status"
                >
                  ● {neuroStatus === 'green' ? 'Active' : neuroStatus === 'orange' ? 'Fallback' : 'Idle'}
                </span>
              )}
            </div>
            {/* Right Side: User Icon/Login */}
            <div className="flex items-center">
              {authStatus ? (
                <div ref={dropdownRef} className="relative mr-2">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {renderAvatar()} 
                  </button>
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-neutral-100"
                      >
                        <LogOut className="mr-2 h-4 w-4"/> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          <ChatWindow 
            activeChatId={activeChatId} 
            onChatCreated={handleChatCreated}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            neuroStatus={neuroStatus}
            setNeuroStatus={setNeuroStatus}
          />
        </main>
      </div>
    </div>
    <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
        returnUrl={pathname} 
    />
    </>
  )
}

export default ChatLayout 