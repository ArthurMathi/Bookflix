import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoogleBooksAPI from '../../services/googleBooksAPI';
import { useBooks } from '../../context/BookContext';
import './BookDetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { 
    addToBucketList, 
    isInBucketList, 
    getBookStatus, 
    updateBookStatus,
    getBookReview 
  } = useBooks();

  useEffect(() => {
    loadBookDetails();
  }, [id]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const bookData = await GoogleBooksAPI.getBookById(id);
      setBook(bookData);
    } catch (error) {
      console.error('Error loading book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = (status = 'planned') => {
    if (!isInBucketList(book.id)) {
      addToBucketList(book, status);
    }
  };

  const handleStatusChange = (newStatus) => {
    updateBookStatus(book.id, newStatus);
  };

  if (loading) {
    return (
      <div className="book-detail">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            📚
          </motion.div>
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail">
        <div className="error-container">
          <h2>Book not found</h2>
          <p>The book you're looking for doesn't exist.</p>
          <Link to="/home" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const currentStatus = getBookStatus(book.id);
  const inList = isInBucketList(book.id);
  const userReview = getBookReview(book.id);

  return (
    <motion.div 
      className="book-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="book-hero">
        <div className="book-hero-bg">
          <img 
            src={book.imageLinks?.large || book.imageLinks?.medium || book.imageLinks?.thumbnail} 
            alt={book.title}
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="book-hero-content">
          <motion.div
            className="book-cover-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src={book.imageLinks?.large || book.imageLinks?.medium || book.imageLinks?.thumbnail} 
              alt={book.title}
              className="book-cover-large"
            />
          </motion.div>

          <motion.div
            className="book-info-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="book-title-large">{book.title}</h1>
            
            <div className="book-meta">
              <p className="book-authors">by {book.authors?.join(', ')}</p>
              {book.publishedDate && (
                <p className="book-published">Published: {new Date(book.publishedDate).getFullYear()}</p>
              )}
              {book.publisher && (
                <p className="book-publisher">Publisher: {book.publisher}</p>
              )}
            </div>

            {book.averageRating > 0 && (
              <div className="book-rating-large">
                <div className="rating-stars-large">
                  {'★'.repeat(Math.floor(book.averageRating))}
                  {'☆'.repeat(5 - Math.floor(book.averageRating))}
                </div>
                <span className="rating-text-large">
                  {book.averageRating}/5 ({book.ratingsCount} reviews)
                </span>
              </div>
            )}

            <div className="book-actions">
              {!inList ? (
                <div className="add-actions">
                  <button 
                    onClick={() => handleAddToList('planned')}
                    className="btn-primary action-btn"
                  >
                    <span>📋</span> Add to My List
                  </button>
                  <button 
                    onClick={() => handleAddToList('reading')}
                    className="btn-secondary action-btn"
                  >
                    <span>📖</span> Start Reading
                  </button>
                </div>
              ) : (
                <div className="status-actions">
                  <div className="current-status">
                    <span className={`status-indicator ${currentStatus}`}>
                      {currentStatus === 'planned' && '📋'}
                      {currentStatus === 'reading' && '📖'}
                      {currentStatus === 'completed' && '✅'}
                    </span>
                    <span className="status-text">
                      {currentStatus === 'planned' && 'In My List'}
                      {currentStatus === 'reading' && 'Currently Reading'}
                      {currentStatus === 'completed' && 'Completed'}
                    </span>
                  </div>
                  
                  <div className="status-buttons">
                    {currentStatus !== 'reading' && (
                      <button 
                        onClick={() => handleStatusChange('reading')}
                        className="btn-secondary status-btn"
                      >
                        📖 Start Reading
                      </button>
                    )}
                    {currentStatus !== 'completed' && (
                      <button 
                        onClick={() => handleStatusChange('completed')}
                        className="btn-secondary status-btn"
                      >
                        ✅ Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              )}

              <Link 
                to={`/review/${book.id}`}
                className="btn-secondary action-btn"
              >
                <span>⭐</span> 
                {userReview ? 'Edit Review' : 'Write Review'}
              </Link>
            </div>

            {book.categories && book.categories.length > 0 && (
              <div className="book-genres-large">
                {book.categories.slice(0, 5).map((category, index) => (
                  <span key={index} className="genre-tag-large">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="book-details-content">
        <div className="book-description-section">
          <h2>About This Book</h2>
          {book.description ? (
            <div className="book-description">
              <p>
                {showFullDescription 
                  ? book.description 
                  : `${book.description.substring(0, 500)}${book.description.length > 500 ? '...' : ''}`
                }
              </p>
              {book.description.length > 500 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="show-more-btn"
                >
                  {showFullDescription ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          ) : (
            <p className="no-description">No description available for this book.</p>
          )}
        </div>

        <div className="book-info-grid">
          <div className="info-card">
            <h3>Book Details</h3>
            <div className="info-list">
              {book.pageCount > 0 && (
                <div className="info-item">
                  <span className="info-label">Pages:</span>
                  <span className="info-value">{book.pageCount}</span>
                </div>
              )}
              {book.language && (
                <div className="info-item">
                  <span className="info-label">Language:</span>
                  <span className="info-value">{book.language.toUpperCase()}</span>
                </div>
              )}
              {book.isbn && (
                <div className="info-item">
                  <span className="info-label">ISBN:</span>
                  <span className="info-value">{book.isbn}</span>
                </div>
              )}
            </div>
          </div>

          {userReview && (
            <div className="info-card">
              <h3>Your Review</h3>
              <div className="user-review-preview">
                <div className="review-rating">
                  {'★'.repeat(userReview.rating)}
                  {'☆'.repeat(5 - userReview.rating)}
                </div>
                <p className="review-text">{userReview.reviewText}</p>
                <Link to={`/review/${book.id}`} className="edit-review-link">
                  Edit Review
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="book-actions-bottom">
          {book.previewLink && (
            <a 
              href={book.previewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              📖 Preview Book
            </a>
          )}
          {book.buyLink && (
            <a 
              href={book.buyLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
            >
              🛒 Buy Book
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookDetail;