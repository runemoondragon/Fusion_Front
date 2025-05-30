'use client'

import React, { useState, useRef } from 'react'
import { Plus, AlertTriangle, Loader2, Edit3, Trash2, HomeIcon, X } from 'lucide-react' // Added X icon
import { useRouter } from 'next/navigation'; // Added for navigation

interface Room {
  id: string
  name: string
  provider?: string | null
}

interface ChatSidebarProps {
  rooms: Room[]
  activeRoomId: string | null
  onNewRoom: () => void // Function to handle creating a new room
  onSelectRoom: (roomId: string) => void // Function to handle selecting a room
  onUpdateTitle: (roomId: string, newTitle: string) => void // Added
  onDeleteRoom: (roomId: string) => void; // Added
  isLoading?: boolean // Added
  error?: string | null // Added
  isUserAuth: boolean; // Added
  onLoginClick: () => void; // Added
  onClose?: () => void; // Added for mobile close button
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  rooms,
  activeRoomId,
  onNewRoom,
  onSelectRoom,
  onUpdateTitle, // Added
  onDeleteRoom, // Added
  isLoading,
  error,
  isUserAuth, // Added
  onLoginClick, // Added
  onClose, // Added
}) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Added for navigation

  const handleEditClick = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingTitle(room.name);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };

  const handleTitleSubmit = (roomId: string) => {
    if (editingTitle.trim() && roomId) {
      onUpdateTitle(roomId, editingTitle.trim());
    }
    setEditingRoomId(null);
    setEditingTitle('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, roomId: string) => {
    if (e.key === 'Enter') {
      handleTitleSubmit(roomId);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingTitle('');
    }
  };

  // Focus input when editing starts
  React.useEffect(() => {
    if (editingRoomId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select(); // Optionally select text
    }
  }, [editingRoomId]);

  return (
    <aside className="flex flex-col w-full md:w-64 bg-white h-full">
      {/* Header with close button for mobile and New Room Button */}
      <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
        <button 
          onClick={isUserAuth ? onNewRoom : onLoginClick} // Call onLoginClick if not authenticated
          disabled={isLoading || !isUserAuth} // Disable if loading or not authenticated
          className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded bg-orange-100 text-black text-base font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-10"
        >
          <img src="content/images/fusion.png" alt="Fusion AI Logo" className="w-5 h-5" />
          <span>{isUserAuth ? 'New Chat' : 'Login to Chat'}</span> {/* Change text if not authenticated */}
        </button>
        
        {/* Close button - mobile only */}
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden ml-2 p-2 rounded-full hover:bg-gray-100 h-10 w-10 flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        )}
      </div>
      
      {/* Room List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="flex items-center justify-center p-4 text-neutral-500">
            <Loader2 size={20} className="animate-spin mr-2" />
            Loading chats...
          </div>
        )}
        {!isLoading && error && (
          <div className="p-3 m-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <div className="flex items-center">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
        {!isLoading && !error && !isUserAuth && rooms.length === 0 && (
          <p className="p-4 text-center text-base text-neutral-500">
            Please log in to start chatting.
          </p>
        )}
        {!isLoading && !error && isUserAuth && rooms.length === 0 && (
          <p className="p-4 text-center text-base text-neutral-500">
            No chat sessions yet.
            <br />
            Click "New Chat" to start.
          </p>
        )}
        {!isLoading && !error && isUserAuth && rooms.map((room) => (
          <div key={room.id} className="group relative">
            {editingRoomId === room.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editingTitle}
                onChange={handleTitleChange}
                onBlur={() => handleTitleSubmit(room.id)}
                onKeyDown={(e) => handleInputKeyDown(e, room.id)}
                className="w-full px-3 py-2.5 text-base font-medium bg-white border border-orange-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 h-10"
                placeholder="Enter new title"
              />
            ) : (
              <button
                onClick={() => onSelectRoom(room.id)}
                className={`w-full text-left block pl-3 pr-16 py-2.5 rounded-md text-base font-medium truncate transition-colors flex items-center h-10 ${
                  room.id === activeRoomId
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {/* Provider Icon */}
                {room.provider && (
                  <img 
                    src={`/${room.provider.toLowerCase().replace(/\s+/g, '-')}.png`} 
                    alt={`${room.provider} icon`}
                    className="w-5 h-5 mr-1.5 flex-shrink-0"
                    onError={(e) => {
                      // Attempt to load neuro-switch.png if neuroswitch fails (common variation)
                      if (room.provider?.toLowerCase() === 'neuroswitch') {
                        (e.currentTarget as HTMLImageElement).src = '/neuro-switch.png';
                        // Ensure onError isn't called again for this specific fallback
                        (e.currentTarget as HTMLImageElement).onerror = null; 
                      } else {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }
                    }}
                  />
                )}
                <span className="truncate">{room.name}</span>
              </button>
            )}
            {editingRoomId !== room.id && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(room);
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-600 rounded h-8 w-8 flex items-center justify-center"
                  title="Edit title"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting the room
                    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                      onDeleteRoom(room.id);
                    }
                  }}
                  className="p-2 text-neutral-400 hover:text-red-500 rounded h-8 w-8 flex items-center justify-center"
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Optional Footer - Could hold user profile link, settings etc. */}
      <div className="p-2 border-t border-neutral-200">
        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-start gap-2 p-2.5 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 text-base transition-colors h-10"
          title="Go to Home"
        >
          <HomeIcon size={18} className="mr-1" />
          <span>Home</span>
        </button>
      </div>
    </aside>
  )
}

export default ChatSidebar 