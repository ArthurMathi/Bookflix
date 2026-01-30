import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBooks } from '../../context/BookContext';
import BookCard from '../BookCard/BookCard';
import './ReadingHistory.css';

const ReadingHistory = () => {
  const { readingHistory } = useBooks();
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Get unique years and genres from reading history
  const years = [...new Set(readingHistory.map(book => book.year))].sort((a, b) => b - a);
  const genres = [...new Set(readingHistory.flatMap(book => book.categories || []))].slice(0, 10);

  const filteredBooks = readingHistory.filter(book => {
    const yearMatch = selectedYear === 'all' || book.year === parseInt(selectedYear);
    const genreMatch = selectedGenre === 'all' || (book.categories && book.categories.includes(selectedGenre));
    return yearMatch && genreMatch;
  });

  const getReadingStats = () => {
    const totalBooks = readingHistory.length;
    const currentYear = new Date().getFullYear();
    const thisYearBooks = readingHistory.filter(book => book.year === currentYear).length;
    const favoriteGenre = genres.length > 0 ? genres[0] : 'None';
    
    return { totalBooks, thisYearBooks, favoriteGenre };
  };

  const stats = getReadingStats();

  return (
    <motion.div 
      className="reading-history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="history-header">
        <h1 className="page-title">Reading History</h1>
        <p className="page-subtitle">Your literary journey through time</p>
        
        <div className="reading-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalBooks}</div>
            <div className="stat-label">Books Read</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.thisYearBooks}</div>
            <div className="stat-label">This Year</div>
          </div>
          <div className="stat-card">
            <div className="stat-text">{stats.favoriteGenre}</div>
            <div className="stat-label">Top Genre</div>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <label className="filter-label">Filter by Year:</label>
          <select 
            className="filter-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Filter by Genre:</label>
          <select 
            className="filter-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="history-content">
        {filteredBooks.length > 0 ? (
          <div className="books-timeline">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={`${book.id}-${book.completedDate}`}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="timeline-date">
                  {new Date(book.completedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="timeline-book">
                  <BookCard book={book} size="medium" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h3>No reading history</h3>
            <p>
              {readingHistory.length === 0 
                ? "You haven't completed any books yet. Start reading to build your history!"
                : "No books match your current filters. Try adjusting your selection."
              }
            </p>
          </div>
        )}
      </div>

      {readingHistory.length > 0 && (
        <div className="history-summary">
          <h2>Your Reading Journey</h2>
          <div className="journey-stats">
            <div className="journey-item">
              <span className="journey-icon">📚</span>
              <span className="journey-text">
                You've read {readingHistory.length} books across {genres.length} different genres
              </span>
            </div>
            <div className="journey-item">
              <span className="journey-icon">⏱️</span>
              <span className="journey-text">
                Reading since {Math.min(...years)} - that's {new Date().getFullYear() - Math.min(...years)} years of literary adventures!
              </span>
            </div>
            <div className="journey-item">
              <span className="journey-icon">🎯</span>
              <span className="journey-text">
                Keep going! Every book adds to your unique reading story
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReadingHistory;