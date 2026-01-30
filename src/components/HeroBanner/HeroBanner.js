import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBooks } from '../../context/BookContext';
import './HeroBanner.css';

const HeroBanner = ({ book }) => {
  const { addToBucketList, isInBucketList, getBookStatus } = useBooks();

  const getHeroImage = () => {
    const { imageLinks } = book;
    if (!imageLinks) return '';
    
    // For hero banner, prefer the largest available image
    return imageLinks.extraLarge || 
           imageLinks.large || 
           imageLinks.medium || 
           imageLinks.small || 
           imageLinks.thumbnail || 
           '';
  };

  const handleAddToList = () => {
    if (!isInBucketList(book.id)) {
      addToBucketList(book, 'planned');
    }
  };

  const getStatusText = () => {
    if (isInBucketList(book.id)) {
      const status = getBookStatus(book.id);
      return status === 'planned' ? 'In My List' : 
             status === 'reading' ? 'Currently Reading' : 'Completed';
    }
    return 'Add to My List';
  };

  const heroImage = getHeroImage();

  return (
    <div className="hero-banner">
      <div className="hero-background">
        <img 
          src={heroImage || '/placeholder-hero.jpg'} 
          alt={book.title}
          className="hero-bg-image"
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-info"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="hero-badge">Featured Today</div>
          
          <h1 className="hero-title">{book.title}</h1>
          
          <div className="hero-meta">
            <span className="hero-author">by {book.authors?.join(', ')}</span>
            {book.averageRating > 0 && (
              <div className="hero-rating">
                <span className="rating-stars">
                  {'★'.repeat(Math.floor(book.averageRating))}
                  {'☆'.repeat(5 - Math.floor(book.averageRating))}
                </span>
                <span className="rating-text">{book.averageRating}/5</span>
              </div>
            )}
          </div>

          <p className="hero-description">
            {book.description?.length > 300 
              ? `${book.description.substring(0, 300)}...` 
              : book.description}
          </p>

          <div className="hero-actions">
            <Link to={`/book/${book.id}`} className="btn-primary hero-btn">
              <span>📖</span> Read More
            </Link>
            
            <button 
              onClick={handleAddToList}
              className={`btn-secondary hero-btn ${isInBucketList(book.id) ? 'added' : ''}`}
              disabled={isInBucketList(book.id)}
            >
              <span>{isInBucketList(book.id) ? '✓' : '+'}</span>
              {getStatusText()}
            </button>
          </div>

          {book.categories && book.categories.length > 0 && (
            <div className="hero-genres">
              {book.categories.slice(0, 3).map((category, index) => (
                <span key={index} className="genre-tag">
                  {category}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="hero-book-cover"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img 
            src={heroImage || '/placeholder-book.jpg'} 
            alt={book.title}
            className="hero-cover-image"
          />
          <div className="cover-glow"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;