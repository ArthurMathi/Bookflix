import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoogleBooksAPI from '../../services/googleBooksAPI';
import { useBooks } from '../../context/BookContext';
import './ReviewScreen.css';

const ReviewScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    reviewText: '',
    moodTags: [],
    readingDate: new Date().toISOString().split('T')[0],
    personalNotes: '',
    recommendation: true
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const { addReview, getBookReview } = useBooks();

  const moodOptions = [
    { id: 'emotional', label: 'Emotional', icon: '😢', color: '#3b82f6' },
    { id: 'dark', label: 'Dark', icon: '🌑', color: '#6b7280' },
    { id: 'hopeful', label: 'Hopeful', icon: '🌟', color: '#fbbf24' },
    { id: 'adventurous', label: 'Adventurous', icon: '🗺️', color: '#10b981' },
    { id: 'romantic', label: 'Romantic', icon: '💕', color: '#ec4899' },
    { id: 'mysterious', label: 'Mysterious', icon: '🔍', color: '#8b5cf6' },
    { id: 'inspiring', label: 'Inspiring', icon: '✨', color: '#f59e0b' },
    { id: 'thrilling', label: 'Thrilling', icon: '⚡', color: '#ef4444' }
  ];

  useEffect(() => {
    loadBookAndReview();
  }, [id]); // Only depend on id since other dependencies are stable

  const loadBookAndReview = async () => {
    try {
      setLoading(true);
      const bookData = await GoogleBooksAPI.getBookById(id);
      setBook(bookData);

      // Load existing review if it exists
      const existingReview = getBookReview(id);
      if (existingReview) {
        setReviewData({
          rating: existingReview.rating || 0,
          reviewText: existingReview.reviewText || '',
          moodTags: existingReview.moodTags || [],
          readingDate: existingReview.readingDate || new Date().toISOString().split('T')[0],
          personalNotes: existingReview.personalNotes || '',
          recommendation: existingReview.recommendation !== undefined ? existingReview.recommendation : true
        });
      }
    } catch (error) {
      console.error('Error loading book and review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleMoodToggle = (moodId) => {
    setReviewData(prev => ({
      ...prev,
      moodTags: prev.moodTags.includes(moodId)
        ? prev.moodTags.filter(tag => tag !== moodId)
        : [...prev.moodTags, moodId]
    }));
  };

  const handleInputChange = (field, value) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (reviewData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    addReview(id, reviewData);
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <div className="review-screen">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⭐
          </motion.div>
          <p>Loading review form...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="review-screen">
        <div className="error-container">
          <h2>Book not found</h2>
          <p>Unable to load the book for review.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="review-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="review-header">
        <div className="review-book-info">
          <img 
            src={book.imageLinks?.thumbnail || book.imageLinks?.small} 
            alt={book.title}
            className="review-book-cover"
          />
          <div className="review-book-details">
            <h1 className="review-book-title">{book.title}</h1>
            <p className="review-book-author">by {book.authors?.join(', ')}</p>
          </div>
        </div>
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Rate this book</h2>
          <div className="rating-section">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoveredRating || reviewData.rating) ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="rating-text">
              {reviewData.rating > 0 && (
                <span>{reviewData.rating}/5 stars</span>
              )}
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Write your review</h2>
          <textarea
            className="review-textarea"
            placeholder="What did you think of this book? Share your thoughts..."
            value={reviewData.reviewText}
            onChange={(e) => handleInputChange('reviewText', e.target.value)}
            rows={6}
          />
        </div>

        <div className="form-section">
          <h2 className="section-title">How did this book make you feel?</h2>
          <div className="mood-tags">
            {moodOptions.map(mood => (
              <button
                key={mood.id}
                type="button"
                className={`mood-tag ${reviewData.moodTags.includes(mood.id) ? 'selected' : ''}`}
                onClick={() => handleMoodToggle(mood.id)}
                style={{
                  '--mood-color': mood.color
                }}
              >
                <span className="mood-icon">{mood.icon}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Reading diary</h2>
          <div className="diary-fields">
            <div className="field-group">
              <label className="field-label">Reading date</label>
              <input
                type="date"
                className="date-input"
                value={reviewData.readingDate}
                onChange={(e) => handleInputChange('readingDate', e.target.value)}
              />
            </div>
            
            <div className="field-group full-width">
              <label className="field-label">Personal notes</label>
              <textarea
                className="notes-textarea"
                placeholder="Private notes about your reading experience..."
                value={reviewData.personalNotes}
                onChange={(e) => handleInputChange('personalNotes', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Would you recommend this book?</h2>
          <div className="recommendation-toggle">
            <button
              type="button"
              className={`rec-btn ${reviewData.recommendation ? 'active' : ''}`}
              onClick={() => handleInputChange('recommendation', true)}
            >
              <span>👍</span> Yes, I'd recommend it
            </button>
            <button
              type="button"
              className={`rec-btn ${!reviewData.recommendation ? 'active' : ''}`}
              onClick={() => handleInputChange('recommendation', false)}
            >
              <span>👎</span> No, not really
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/book/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={reviewData.rating === 0}
          >
            Save Review
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReviewScreen;