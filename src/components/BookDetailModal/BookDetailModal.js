import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBooks } from '../../context/BookContext';
import './BookDetailModal.css';

const BookDetailModal = ({ book, onClose }) => {
  const { addToBucketList, isInBucketList, getBookStatus, getBookReview } = useBooks();

  const getBookImage = () => {
    const { imageLinks } = book;
    if (!imageLinks) return null;
    return imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.small || imageLinks.thumbnail || null;
  };

  const handleAddToList = (status = 'planned') => {
    if (!isInBucketList(book.id)) {
      addToBucketList(book, status);
    }
  };

  const getReadingTime = () => {
    if (!book.pageCount) return 'Unknown';
    const avgWordsPerPage = 250;
    const avgReadingSpeed = 200;
    const totalWords = book.pageCount * avgWordsPerPage;
    const minutes = Math.round(totalWords / avgReadingSpeed);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m read`;
    }
    return `${minutes}m read`;
  };

  const bookImage = getBookImage();
  const inList = isInBucketList(book.id);
  const bookStatus = getBookStatus(book.id);
  const userReview = getBookReview(book.id);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="book-detail-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <div className="modal-content">
          {/* Hero Section */}
          <div className="modal-hero">
            <div className="hero-background">
              {bookImage && (
                <img 
                  src={bookImage} 
                  alt=""
                  className="hero-bg-image"
                />
              )}
              <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">
              <div className="book-cover-section">
                {bookImage ? (
                  <img 
                    src={bookImage} 
                    alt={book.title}
                    className="modal-book-cover"
                  />
                ) : (
                  <div className="modal-cover-fallback">
                    <div className="fallback-title">{book.title}</div>
                    <div className="fallback-author">{book.authors?.[0]}</div>
                  </div>
                )}
              </div>

              <div className="book-info-section">
                <h1 className="modal-book-title">{book.title}</h1>
                <p className="modal-book-author">by {book.authors?.join(', ')}</p>

                {book.categories && book.categories.length > 0 && (
                  <div className="genre-badges">
                    {book.categories.slice(0, 3).map((category, index) => (
                      <span key={index} className="genre-badge">
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                <div className="book-meta-info">
                  {book.publishedDate && (
                    <div className="meta-item">
                      <span className="meta-label">Published:</span>
                      <span className="meta-value">{new Date(book.publishedDate).getFullYear()}</span>
                    </div>
                  )}
                  {book.language && (
                    <div className="meta-item">
                      <span className="meta-label">Language:</span>
                      <span className="meta-value">{book.language.toUpperCase()}</span>
                    </div>
                  )}
                  {book.pageCount > 0 && (
                    <div className="meta-item">
                      <span className="meta-label">Length:</span>
                      <span className="meta-value">{book.pageCount} pages • {getReadingTime()}</span>
                    </div>
                  )}
                </div>

                {book.averageRating > 0 && (
                  <div className="modal-rating">
                    <div className="rating-stars">
                      {'★'.repeat(Math.floor(book.averageRating))}
                      {'☆'.repeat(5 - Math.floor(book.averageRating))}
                    </div>
                    <span className="rating-text">
                      {book.averageRating}/5 ({book.ratingsCount} reviews)
                    </span>
                  </div>
                )}

                <div className="action-buttons">
                  {!inList ? (
                    <>
                      <motion.button
                        className="btn-primary action-btn"
                        onClick={() => handleAddToList('reading')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📖 Start Reading
                      </motion.button>
                      <motion.button
                        className="btn-secondary action-btn"
                        onClick={() => handleAddToList('planned')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📋 Add to List
                      </motion.button>
                    </>
                  ) : (
                    <div className="status-display">
                      <span className={`status-indicator ${bookStatus}`}>
                        {bookStatus === 'planned' && '📋 In My List'}
                        {bookStatus === 'reading' && '📖 Currently Reading'}
                        {bookStatus === 'completed' && '✅ Completed'}
                      </span>
                    </div>
                  )}

                  <Link 
                    to={`/review/${book.id}`}
                    className="btn-secondary action-btn"
                    onClick={onClose}
                  >
                    ⭐ {userReview ? 'Edit Review' : 'Write Review'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="description-section">
            <h3>About This Book</h3>
            {book.description ? (
              <p className="book-description">{book.description}</p>
            ) : (
              <p className="no-description">No description available for this book.</p>
            )}
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <div className="info-grid">
              {book.publisher && (
                <div className="info-card">
                  <h4>Publisher</h4>
                  <p>{book.publisher}</p>
                </div>
              )}
              {book.isbn && (
                <div className="info-card">
                  <h4>ISBN</h4>
                  <p>{book.isbn}</p>
                </div>
              )}
              {book.price && book.price !== 'Not for sale' && (
                <div className="info-card">
                  <h4>Price</h4>
                  <p>{book.price}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Review Preview */}
          {userReview && (
            <div className="user-review-section">
              <h3>Your Review</h3>
              <div className="review-preview">
                <div className="review-rating">
                  {'★'.repeat(userReview.rating)}
                  {'☆'.repeat(5 - userReview.rating)}
                  <span className="rating-number">({userReview.rating}/5)</span>
                </div>
                {userReview.reviewText && (
                  <p className="review-text">{userReview.reviewText}</p>
                )}
                {userReview.moodTags && userReview.moodTags.length > 0 && (
                  <div className="mood-tags">
                    {userReview.moodTags.map(mood => (
                      <span key={mood} className="mood-tag">{mood}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="external-links">
            {book.previewLink && (
              <a 
                href={book.previewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link"
              >
                📖 Preview Book
              </a>
            )}
            {book.buyLink && (
              <a 
                href={book.buyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link"
              >
                🛒 Buy Book
              </a>
            )}
            <Link 
              to={`/book/${book.id}`}
              className="external-link"
              onClick={onClose}
            >
              📄 Full Details
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookDetailModal;