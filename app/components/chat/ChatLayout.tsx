'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import { UserCircle, Settings2, LogOut, User as UserIcon, ChevronDown, ChevronRight } from 'lucide-react'
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

// Define the structure for AI models fetched from the API
interface AiModel {
  id: string;         // Will store the id_string from the DB (e.g., "openai/gpt-4.1")
  name: string;       // Display name from DB (e.g., "OpenAI: GPT-4.1")
  provider: string;   // General provider name from DB (e.g., "OpenAI", "Google", "Anthropic")
  is_active: boolean;
  // numeric_id?: number; // Optional: if we ever need the original DB PK for some reason other than selection
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
        // Valid saved models can be "neuroswitch" or provider IDs like "openai"
        // Specific model IDs are not saved as the "global default" here.
        const validProviderDefaults = ['neuroswitch', 'openai', 'claude', 'gemini'];
        if (savedModel && validProviderDefaults.includes(savedModel)) {
            return savedModel;
        }
    }
    return 'neuroswitch'; // Default overall
  };
  const [selectedModel, setSelectedModel] = useState<string>(getDefaultModel());
  const [neuroStatus, setNeuroStatus] = useState<'green' | 'orange' | ''>( '' );

  // New state for model selection dropdown
  const [allModels, setAllModels] = useState<AiModel[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null); // To track which provider's list is open
  const modelDropdownRef = useRef<HTMLDivElement>(null);

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
      // Close model dropdown if click is outside
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
        setExpandedProvider(null); // Also collapse any open sub-menus
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, modelDropdownRef]);

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

  // Effect to fetch AI models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Assuming /api/models does not strictly require auth token, but sending if available
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        // Expecting raw API response to have: id (numeric PK), name, id_string, provider, is_active
        const response = await axios.get<any[]>('/api/models?is_active=true', { headers });
        
        const fetchedModels: AiModel[] = response.data
          .filter(rawModel => rawModel.is_active && typeof rawModel.id_string === 'string' && rawModel.id_string.trim() !== '')
          .map(rawModel => ({
            id: rawModel.id_string,      // Crucial: Use id_string as the primary identifier for frontend logic
            name: rawModel.name,           // For display
            provider: rawModel.provider, // General provider name from DB (e.g., "OpenAI", "Google")
            is_active: rawModel.is_active,
          }));
        
        setAllModels(fetchedModels);
      } catch (error) {
        console.error("Error fetching AI models:", error);
        // Optionally set an error state to inform the user
      }
    };
    fetchModels();
  }, []);

  const handleNewChat = () => {
    if (!authStatus) {
      openLoginModal();
      return;
    }
    console.log('Creating new chat session (client-side)...')
    setActiveChatId(null)
    setSelectedModel(getDefaultModel()); // Reset to default model for new chat
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
      // ui_selected_provider can be a specific model ID like "gpt-4o"
      // or a provider default like "openai". setSelectedModel handles this.
      setSelectedModel(selectedChat.ui_selected_provider);
    } else {
      setSelectedModel(getDefaultModel()); // Fallback to global default if not set on chat
    }
  }

  const handleChatCreated = (newlyCreatedChat: ChatSession) => {
    console.log('ChatLayout: New chat confirmed by ChatWindow:', newlyCreatedChat)
    setChatList(prevChatList => [newlyCreatedChat, ...prevChatList])
    setActiveChatId(newlyCreatedChat.id)
    // The newlyCreatedChat.ui_selected_provider should reflect what was used.
    // If it's a specific model, setSelectedModel will take it.
    // If it's a provider (e.g., "openai"), it will also be correctly set.
    if (newlyCreatedChat.ui_selected_provider) {
        setSelectedModel(newlyCreatedChat.ui_selected_provider);
    }
    // No, onChatCreated doesn't need to set the model itself here,
    // ChatWindow sends the model that was used. The new chat session will have it.
    // ChatLayout's selectedModel will be updated if handleSelectChat is called on this new chat.
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
            chat.id === chatId ? { ...chat, title: response.data.chat.title, ui_selected_provider: response.data.chat.ui_selected_provider || selectedModel } : chat
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

  // Helper function to group models by provider
  const getGroupedModels = () => {
    // Keys used for the main UI groups in the dropdown
    const uiGroupKeys = {
      openai: 'openai',
      claude: 'claude',
      gemini: 'gemini'
    };

    const grouped: Record<string, AiModel[]> = {
      [uiGroupKeys.openai]: [],
      [uiGroupKeys.claude]: [],
      [uiGroupKeys.gemini]: []
    };

    allModels.forEach(model => {
      // Normalize API provider name to lowercase for robust comparison and matching
      const apiProviderNormalized = model.provider.toLowerCase();

      if (apiProviderNormalized === 'openai') {
        grouped[uiGroupKeys.openai].push(model);
      } else if (apiProviderNormalized === 'anthropic') {
        // Models from "Anthropic" are grouped under the "Claude" UI category
        grouped[uiGroupKeys.claude].push(model);
      } else if (apiProviderNormalized === 'google' || apiProviderNormalized.startsWith('google ')) {
        // Models from "Google" or sub-brands like "Google AI Studio", "Google Vertex" 
        // are grouped under the "Gemini" UI category
        grouped[uiGroupKeys.gemini].push(model);
      }
      // Models from providers not matching these conditions will not be included in these specific UI groups.
    });
    return grouped;
  };
  
  const groupedModels = getGroupedModels(); // Calculate once per render

  // Helper function to get display name for selected model
  const getSelectedModelDisplayName = () => {
    if (selectedModel === 'neuroswitch') return 'NeuroSwitch';
    
    // Check if it's a provider-level default (e.g., "openai")
    const knownProviders = ['openai', 'claude', 'gemini'];
    if (knownProviders.includes(selectedModel)) {
      const providerName = selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1);
      return `${providerName} (Default)`;
    }

    // Check if it's a specific model ID (e.g., "gpt-4o")
    const model = allModels.find(m => m.id === selectedModel);
    if (model) return model.name;
    
    return 'Select Model'; // Fallback
  };

  const handleModelSelect = (modelIdentifier: string) => {
    setSelectedModel(modelIdentifier); // modelIdentifier can be "neuroswitch", "openai", "gpt-4o", etc.
    setIsModelDropdownOpen(false);
    setExpandedProvider(null); // Close any submenus

    // Save to localStorage if it's "neuroswitch" or a provider ID
    // This aligns with how getDefaultModel retrieves the preference.
    const providerLevelSelections = ['neuroswitch', 'openai', 'claude', 'gemini'];
    if (providerLevelSelections.includes(modelIdentifier)) {
        localStorage.setItem('userDefaultModel', modelIdentifier);
    } else {
        // If a specific model is selected (e.g., "gpt-4o"),
        // find its provider and save that provider ID to localStorage.
        const model = allModels.find(m => m.id === modelIdentifier);
        if (model && providerLevelSelections.includes(model.provider)) {
            localStorage.setItem('userDefaultModel', model.provider);
        }
    }
  };

  const toggleProviderSubmenu = (providerKey: string) => {
    setExpandedProvider(prev => prev === providerKey ? null : providerKey);
  };

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
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pr-6"> {/* Increased z-index for dropdown */}
            {/* Left Side: Model Dropdown & Status */}
            <div className="ml-0 flex items-center space-x-2" ref={modelDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center justify-between w-auto min-w-[150px] text-sm py-1.5 px-3 border border-gray-300 rounded-md shadow-sm bg-white bg-opacity-90 backdrop-blur-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <span>{getSelectedModelDisplayName()}</span>
                  <ChevronDown className={`ml-2 h-4 w-4 text-gray-500 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isModelDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-30"> {/* Higher z-index for dropdown content */}
                    {/* NeuroSwitch Option */}
                    <button
                      onClick={() => handleModelSelect('neuroswitch')}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center ${selectedModel === 'neuroswitch' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      NeuroSwitch
                    </button>

                    {/* Providers and their models */}
                    {Object.entries(groupedModels).map(([providerKey, providerModels]) => {
                      if (providerModels.length === 0 && providerKey !== 'openai' && providerKey !== 'claude' && providerKey !== 'gemini') { // Ensure we always render the known provider headers even if models fail to load, but hide if no models and not a core provider.
                          return null; 
                      }
                      const providerName = providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
                      
                      return (
                        <div key={providerKey}>
                          <button
                            onClick={() => toggleProviderSubmenu(providerKey)}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 flex justify-between items-center"
                          >
                            <span>{providerName}</span>
                            <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${expandedProvider === providerKey ? 'rotate-90' : ''}`} />
                          </button>
                          {expandedProvider === providerKey && (
                            <div className="pl-3 border-l-2 border-gray-200 ml-1">
                              {/* Provider Default Option */}
                              <button
                                onClick={() => handleModelSelect(providerKey)}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center ${selectedModel === providerKey ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                              >
                                {providerName} (Default)
                              </button>
                              {/* Specific Models */}
                              {providerModels.map(model => (
                                <button
                                  key={model.id}
                                  onClick={() => handleModelSelect(model.id)}
                                  className={`w-full text-left px-3 py-2 text-sm flex items-center ${selectedModel === model.id ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {model.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* NeuroSwitch Status Indicator */}
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
            allModels={allModels}
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