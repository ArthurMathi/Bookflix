import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('bookflix_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simple email validation for MVP
      const users = JSON.parse(localStorage.getItem('bookflix_users') || '[]');
      const existingUser = users.find(u => u.email === email && u.password === password);
      
      if (existingUser) {
        const userSession = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          favoriteGenres: existingUser.favoriteGenres,
          avatar: existingUser.avatar,
          joinDate: existingUser.joinDate
        };
        
        setUser(userSession);
        localStorage.setItem('bookflix_user', JSON.stringify(userSession));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('bookflix_users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'User already exists' };
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        joinDate: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=e50914&color=fff`
      };

      users.push(newUser);
      localStorage.setItem('bookflix_users', JSON.stringify(users));

      const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        favoriteGenres: newUser.favoriteGenres,
        avatar: newUser.avatar,
        joinDate: newUser.joinDate
      };

      setUser(userSession);
      localStorage.setItem('bookflix_user', JSON.stringify(userSession));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bookflix_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};