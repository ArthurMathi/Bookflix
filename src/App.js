import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';

// Components
import SplashScreen from './components/SplashScreen/SplashScreen';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterScreen from './components/Auth/RegisterScreen';
import HomeScreen from './components/Home/HomeScreen';
import GenreExplorer from './components/GenreExplorer/GenreExplorer';
import ComicHub from './components/ComicHub/ComicHub';
import BookDetail from './components/BookDetail/BookDetail';
import ReviewScreen from './components/Review/ReviewScreen';
import BucketList from './components/BucketList/BucketList';
import ReadingHistory from './components/ReadingHistory/ReadingHistory';
import ProfileScreen from './components/Profile/ProfileScreen';
import Navbar from './components/Navbar/Navbar';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookProvider } from './context/BookContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <BookProvider>
        <Router>
          <div className="App">
            <AnimatePresence mode="wait">
              {showSplash ? (
                <SplashScreen key="splash" />
              ) : (
                <AppContent key="main" />
              )}
            </AnimatePresence>
          </div>
        </Router>
      </BookProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/home" />} />
        <Route path="/register" element={!user ? <RegisterScreen /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <HomeScreen /> : <Navigate to="/login" />} />
        <Route path="/genre-explorer" element={user ? <GenreExplorer /> : <Navigate to="/login" />} />
        <Route path="/comic-hub" element={user ? <ComicHub /> : <Navigate to="/login" />} />
        <Route path="/book/:id" element={user ? <BookDetail /> : <Navigate to="/login" />} />
        <Route path="/review/:id" element={user ? <ReviewScreen /> : <Navigate to="/login" />} />
        <Route path="/bucket-list" element={user ? <BucketList /> : <Navigate to="/login" />} />
        <Route path="/history" element={user ? <ReadingHistory /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfileScreen /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;