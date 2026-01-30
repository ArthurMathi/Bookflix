import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooks } from '../../context/BookContext';
import './BookCard.css';

const BookCard = ({ book, showProgress = false, size = 'medium' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToBucketList, isInBucketList, getBookStatus } = useBooks();

  const getBookImage = () => {
    const { imageLinks } = book;
    if (!imageLinks) return null;
    
    // Try different image sizes, preferring higher quality
    return imageLinks.large || 
           imageLinks.medium || 
           imageLinks.small || 
           imageLinks.thumbnail || 
           imageLinks.extraLarge ||
           null;
  };

  const handleAddToList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInBucketList(book.id)) {
      addToBucketList(book, 'planned');
    }
  };

  const getProgressPercentage = () => {
    // Mock progress for demo - in real app, this would come from reading data
    return Math.floor(Math.random() * 100);
  };

  const bookStatus = getBookStatus(book.id);
  const inList = isInBucketList(book.id);
  const bookImage = getBookImage();

  return (
    <motion.div
      className={`book-card ${size}`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/book/${book.id}`} className="book-link">
        <div className="book-cover-container">
          {!imageLoaded && !imageError && (
            <div className="book-cover-placeholder">
              <div className="placeholder-icon">📚</div>
            </div>
          )}
          
          {!imageError && bookImage && (
            <img
              src={bookImage}
              alt={book.title}
              className={`book-cover ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          
          {(imageError || !bookImage) && (
            <div className="book-cover-fallback">
              <div className="fallback-title">{book.title}</div>
              <div className="fallback-author">{book.authors?.[0]}</div>
            </div>
          )}

          <div className="book-overlay">
            <div className="overlay-content">
              <button
                className={`add-btn ${inList ? 'added' : ''}`}
                onClick={handleAddToList}
                disabled={inList}
                title={inList ? `${bookStatus}` : 'Add to My List'}
              >
                {inList ? '✓' : '+'}
              </button>
              
              {book.averageRating > 0 && (
                <div className="quick-rating">
                  <span className="rating-stars">
                    {'★'.repeat(Math.floor(book.averageRating))}
                  </span>
                  <span className="rating-number">{book.averageRating}</span>
                </div>
              )}
            </div>
          </div>

          {showProgress && bookStatus === 'reading' && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          )}

          {inList && (
            <div className={`status-badge ${bookStatus}`}>
              {bookStatus === 'planned' && '📋'}
              {bookStatus === 'reading' && '📖'}
              {bookStatus === 'completed' && '✅'}
            </div>
          )}
        </div>

        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">{book.authors?.join(', ')}</p>
          
          {book.categories && book.categories.length > 0 && (
            <div className="book-genres">
              <span className="genre-chip">
                {book.categories[0]}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;