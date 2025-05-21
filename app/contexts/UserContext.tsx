'use client'

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of the user profile data
export interface UserProfile {
    id: number;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    // Add any other user-specific fields you might need globally
    // For example: role, createdAt, etc.
    // Based on backend/src/routes/userProfile.ts, it also returns createdAt
    createdAt?: string; 
}

// Define the shape of the context value
interface UserContextType {
    user: UserProfile | null;
    isLoadingUser: boolean;
    fetchUserProfile: () => Promise<void>;
    clearUser: () => void; // Added for logout or session expiry
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get auth token (assuming it's stored in localStorage)
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

const API_BASE_URL = '/api'; // Consistent with your settings page

// Create the Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        setIsLoadingUser(true);
        const token = getAuthToken();

        if (!token) {
            setUser(null);
            setIsLoadingUser(false);
            return;
        }

        try {
            const response = await axios.get<UserProfile>(`${API_BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (error) {
            console.error("UserContext: Failed to fetch user profile:", error);
            setUser(null); // Clear user on error (e.g., token expired)
            // Potentially clear token from localStorage if it's invalid (401/403)
            const axiosError = error as any;
            if (axiosError.response && (axiosError.response.status === 401 || axiosError.response.status === 403)) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                }
            }
        } finally {
            setIsLoadingUser(false);
        }
    }, []);

    const clearUser = useCallback(() => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
        // Potentially redirect to login or home page
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return (
        <UserContext.Provider value={{ user, isLoadingUser, fetchUserProfile, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook for easy context consumption
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 