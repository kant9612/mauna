import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { LoginRequest } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
  engineerId: number | null;
  groupId: number | null;
  groupName: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [engineerId, setEngineerId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const storedEngineerId = localStorage.getItem('engineerId');
    const storedGroupId = localStorage.getItem('groupId');
    const storedGroupName = localStorage.getItem('groupName');

    if (token && storedUsername && storedRole) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setRole(storedRole);
      setEngineerId(storedEngineerId ? Number(storedEngineerId) : null);
      setGroupId(storedGroupId ? Number(storedGroupId) : null);
      setGroupName(storedGroupName);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('token', response.token);
    localStorage.setItem('username', response.username);
    localStorage.setItem('role', response.role);
    if (response.engineerId) {
      localStorage.setItem('engineerId', String(response.engineerId));
    }
    if (response.groupId) {
      localStorage.setItem('groupId', String(response.groupId));
    }
    if (response.groupName) {
      localStorage.setItem('groupName', response.groupName);
    }
    setIsAuthenticated(true);
    setUsername(response.username);
    setRole(response.role);
    setEngineerId(response.engineerId ?? null);
    setGroupId(response.groupId ?? null);
    setGroupName(response.groupName ?? null);
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setEngineerId(null);
    setGroupId(null);
    setGroupName(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, role, engineerId, groupId, groupName, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
