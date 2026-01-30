import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooks } from '../../context/BookContext';
import './EnhancedBookCard.css';

const EnhancedBookCard = ({ book, genre = 'fiction', size = 'medium', showMetadata = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToBucketList, isInBucketList, getBookStatus } = useBooks();

  const getBookImage = () => {
    const { imageLinks } = book;
    if (!imageLinks) return null;
    return imageLinks.large || imageLinks.medium || imageLinks.small || imageLinks.thumbnail || null;
  };

  const getReadingTime = () => {
    if (!book.pageCount) return 'Unknown';
    const avgWordsPerPage = 250;
    const avgReadingSpeed = 200; // words per minute
    const totalWords = book.pageCount * avgWordsPerPage;
    const minutes = Math.round(totalWords / avgReadingSpeed);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getTagline = () => {
    if (book.description) {
      const sentences = book.description.split('.').filter(s => s.trim().length > 0);
      return sentences[0]?.substring(0, 80) + '...' || 'Discover this amazing story';
    }
    return 'A captivating literary journey awaits';
  };

  const handleAddToList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInBucketList(book.id)) {
      addToBucketList(book, 'planned');
    }
  };

  const bookImage = getBookImage();
  const inList = isInBucketList(book.id);
  const bookStatus = getBookStatus(book.id);

  return (
    <motion.div
      className={`enhanced-book-card ${genre} ${size}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/book/${book.id}`} className="book-link">
        <div className="book-poster-container">
          {/* Background Blur Effect */}
          <div className={`poster-background ${isHovered ? 'hovered' : ''}`}>
            {bookImage && (
              <img 
                src={bookImage} 
                alt=""
                className="bg-blur-image"
              />
            )}
          </div>

          {/* Floating Particles */}
          <div className={`floating-particles ${genre}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>

          {/* Book Cover */}
          <div className="book-cover-wrapper">
            {!imageLoaded && !imageError && (
              <div className="cover-placeholder">
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
              <div className="cover-fallback">
                <div className="fallback-title">{book.title}</div>
                <div className="fallback-author">{book.authors?.[0]}</div>
              </div>
            )}

            {/* Cinematic Glow */}
            <div className={`cinematic-glow ${genre}`}></div>
          </div>

          {/* Status Badge */}
          {inList && (
            <div className={`status-badge ${bookStatus}`}>
              {bookStatus === 'planned' && '📋'}
              {bookStatus === 'reading' && '📖'}
              {bookStatus === 'completed' && '✅'}
            </div>
          )}

          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && showMetadata && (
              <motion.div
                className="hover-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="overlay-content">
                  <motion.button
                    className={`add-to-list-btn ${inList ? 'added' : ''}`}
                    onClick={handleAddToList}
                    disabled={inList}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {inList ? '✓ Added' : '+ Add to List'}
                  </motion.button>
                  
                  <motion.div
                    className="view-details-btn"
                    whileHover={{ scale: 1.05 }}
                  >
                    View Details →
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Book Metadata */}
        <motion.div 
          className="book-metadata"
          animate={{
            opacity: isHovered ? 1 : 0.8,
            y: isHovered ? -5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">by {book.authors?.join(', ')}</p>
          
          {showMetadata && (
            <motion.div
              className="book-details"
              animate={{
                opacity: isHovered ? 1 : 0,
                height: isHovered ? 'auto' : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <p className="book-tagline">{getTagline()}</p>
              
              <div className="book-stats">
                {book.averageRating > 0 && (
                  <div className="rating">
                    <span className="stars">
                      {'★'.repeat(Math.floor(book.averageRating))}
                      {'☆'.repeat(5 - Math.floor(book.averageRating))}
                    </span>
                    <span className="rating-number">{book.averageRating}</span>
                  </div>
                )}
                
                <div className="reading-info">
                  <span className="reading-time">{getReadingTime()}</span>
                  {book.pageCount > 0 && (
                    <span className="page-count">{book.pageCount} pages</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default EnhancedBookCard;