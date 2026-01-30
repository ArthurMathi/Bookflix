import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const { user } = useAuth();
  const [bucketList, setBucketList] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [reviews, setReviews] = useState({});
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // Listen to user document changes in real-time
      const userDocRef = doc(db, 'users', user.id);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setBucketList(userData.bucketList || []);
          setReadingHistory(userData.readingHistory || []);
          setReviews(userData.reviews || {});
          setCurrentlyReading(userData.currentlyReading || []);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Clear data when user logs out
      setBucketList([]);
      setReadingHistory([]);
      setReviews({});
      setCurrentlyReading([]);
      setLoading(false);
    }
  }, [user]);

  const updateUserData = async (updates) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const addToBucketList = async (book, status = 'planned') => {
    if (!user) return;

    const bookEntry = {
      ...book,
      status,
      addedDate: new Date().toISOString(),
      id: book.id || Date.now().toString()
    };

    const updatedBucketList = [...bucketList, bookEntry];
    setBucketList(updatedBucketList);
    
    await updateUserData({ bucketList: updatedBucketList });
  };

  const updateBookStatus = async (bookId, newStatus) => {
    if (!user) return;

    const updatedBucketList = bucketList.map(book => 
      book.id === bookId ? { ...book, status: newStatus } : book
    );
    setBucketList(updatedBucketList);

    // If completed, add to reading history
    if (newStatus === 'completed') {
      const completedBook = updatedBucketList.find(book => book.id === bookId);
      if (completedBook) {
        const historyEntry = {
          ...completedBook,
          completedDate: new Date().toISOString(),
          year: new Date().getFullYear()
        };

        const updatedHistory = [...readingHistory, historyEntry];
        setReadingHistory(updatedHistory);
        
        await updateUserData({ 
          bucketList: updatedBucketList,
          readingHistory: updatedHistory
        });
      }
    } else {
      await updateUserData({ bucketList: updatedBucketList });
    }
  };

  const addToReadingHistory = async (book) => {
    if (!user) return;

    const historyEntry = {
      ...book,
      completedDate: new Date().toISOString(),
      year: new Date().getFullYear()
    };

    const updatedHistory = [...readingHistory, historyEntry];
    setReadingHistory(updatedHistory);
    
    await updateUserData({ readingHistory: updatedHistory });
  };

  const addReview = async (bookId, reviewData) => {
    if (!user) return;

    const review = {
      id: Date.now().toString(),
      bookId,
      userId: user.id,
      ...reviewData,
      createdDate: new Date().toISOString()
    };

    const updatedReviews = {
      ...reviews,
      [bookId]: review
    };
    setReviews(updatedReviews);
    
    await updateUserData({ reviews: updatedReviews });

    // Also add to reading history if not already there and status is completed
    const bookInHistory = readingHistory.find(book => book.id === bookId);
    if (!bookInHistory && reviewData.recommendation !== undefined) {
      const bookInBucket = bucketList.find(book => book.id === bookId);
      if (bookInBucket) {
        await addToReadingHistory({
          ...bookInBucket,
          completedDate: reviewData.readingDate || new Date().toISOString()
        });
      }
    }
  };

  const getBookReview = (bookId) => {
    return reviews[bookId] || null;
  };

  const isInBucketList = (bookId) => {
    return bucketList.some(book => book.id === bookId);
  };

  const getBookStatus = (bookId) => {
    const book = bucketList.find(book => book.id === bookId);
    return book ? book.status : null;
  };

  const removeFromBucketList = async (bookId) => {
    if (!user) return;

    const updatedBucketList = bucketList.filter(book => book.id !== bookId);
    setBucketList(updatedBucketList);
    
    await updateUserData({ bucketList: updatedBucketList });
  };

  const value = {
    bucketList,
    readingHistory,
    reviews,
    currentlyReading,
    loading,
    addToBucketList,
    updateBookStatus,
    addToReadingHistory,
    addReview,
    getBookReview,
    isInBucketList,
    getBookStatus,
    removeFromBucketList
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};