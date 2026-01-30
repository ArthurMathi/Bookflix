import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [reviews, setReviews] = useState([]);
  const [currentlyReading, setCurrentlyReading] = useState([]);

  useEffect(() => {
    if (user) {
      // Load user's book data
      const userBucketList = JSON.parse(localStorage.getItem(`bucketList_${user.id}`) || '[]');
      const userHistory = JSON.parse(localStorage.getItem(`readingHistory_${user.id}`) || '[]');
      const userReviews = JSON.parse(localStorage.getItem(`reviews_${user.id}`) || '[]');
      const userCurrentlyReading = JSON.parse(localStorage.getItem(`currentlyReading_${user.id}`) || '[]');

      setBucketList(userBucketList);
      setReadingHistory(userHistory);
      setReviews(userReviews);
      setCurrentlyReading(userCurrentlyReading);
    }
  }, [user]);

  const addToBucketList = (book, status = 'planned') => {
    if (!user) return;

    const bookEntry = {
      ...book,
      status,
      addedDate: new Date().toISOString(),
      id: book.id || Date.now().toString()
    };

    const updatedBucketList = [...bucketList, bookEntry];
    setBucketList(updatedBucketList);
    localStorage.setItem(`bucketList_${user.id}`, JSON.stringify(updatedBucketList));
  };

  const updateBookStatus = (bookId, newStatus) => {
    if (!user) return;

    const updatedBucketList = bucketList.map(book => 
      book.id === bookId ? { ...book, status: newStatus } : book
    );
    setBucketList(updatedBucketList);
    localStorage.setItem(`bucketList_${user.id}`, JSON.stringify(updatedBucketList));

    // If completed, add to reading history
    if (newStatus === 'completed') {
      const completedBook = updatedBucketList.find(book => book.id === bookId);
      if (completedBook) {
        addToReadingHistory(completedBook);
      }
    }
  };

  const addToReadingHistory = (book) => {
    if (!user) return;

    const historyEntry = {
      ...book,
      completedDate: new Date().toISOString(),
      year: new Date().getFullYear()
    };

    const updatedHistory = [...readingHistory, historyEntry];
    setReadingHistory(updatedHistory);
    localStorage.setItem(`readingHistory_${user.id}`, JSON.stringify(updatedHistory));
  };

  const addReview = (bookId, reviewData) => {
    if (!user) return;

    const review = {
      id: Date.now().toString(),
      bookId,
      userId: user.id,
      ...reviewData,
      createdDate: new Date().toISOString()
    };

    const updatedReviews = [...reviews, review];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${user.id}`, JSON.stringify(updatedReviews));

    // Also add to reading history if not already there and status is completed
    const bookInHistory = readingHistory.find(book => book.id === bookId);
    if (!bookInHistory && reviewData.recommendation !== undefined) {
      const bookInBucket = bucketList.find(book => book.id === bookId);
      if (bookInBucket) {
        addToReadingHistory({
          ...bookInBucket,
          completedDate: reviewData.readingDate || new Date().toISOString()
        });
      }
    }
  };

  const getBookReview = (bookId) => {
    return reviews.find(review => review.bookId === bookId);
  };

  const isInBucketList = (bookId) => {
    return bucketList.some(book => book.id === bookId);
  };

  const getBookStatus = (bookId) => {
    const book = bucketList.find(book => book.id === bookId);
    return book ? book.status : null;
  };

  const value = {
    bucketList,
    readingHistory,
    reviews,
    currentlyReading,
    addToBucketList,
    updateBookStatus,
    addToReadingHistory,
    addReview,
    getBookReview,
    isInBucketList,
    getBookStatus
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};