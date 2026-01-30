import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import BookCard from '../BookCard/BookCard';
import './BookRow.css';

const BookRow = ({ title, subtitle, books, showProgress = false }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="book-row">
      <div className="row-header">
        <div className="row-title-section">
          <h2 className="row-title">{title}</h2>
          {subtitle && <p className="row-subtitle">{subtitle}</p>}
        </div>
        
        <div className="row-controls">
          <button 
            className="scroll-btn scroll-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button 
            className="scroll-btn scroll-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div className="books-container" ref={scrollRef}>
        <div className="books-scroll">
          {books.map((book, index) => (
            <motion.div
              key={book.id || index}
              className="book-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BookCard 
                book={book} 
                showProgress={showProgress}
                size="medium"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookRow;