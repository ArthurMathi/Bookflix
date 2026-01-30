import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleBooksAPI from '../../services/googleBooksAPI';
import EnhancedBookCard from '../EnhancedBookCard/EnhancedBookCard';
import BookDetailModal from '../BookDetailModal/BookDetailModal';
import './GenreExplorer.css';

const GenreExplorer = () => {
  const [selectedGenre, setSelectedGenre] = useState('fiction');
  const [genreBooks, setGenreBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    language: 'all',
    rating: 'all',
    length: 'all'
  });

  const genres = [
    { 
      id: 'horror', 
      name: 'Horror', 
      icon: '👻', 
      description: 'Fear, suspense, unsettling silence',
      color: '#8b0000'
    },
    { 
      id: 'fiction', 
      name: 'Fiction', 
      icon: '📚', 
      description: 'Imagination, realism, everyday magic',
      color: '#ffd700'
    },
    { 
      id: 'mystery', 
      name: 'Mystery', 
      icon: '🔍', 
      description: 'Curiosity, secrets, hidden clues',
      color: '#191970'
    },
    { 
      id: 'romance', 
      name: 'Romance', 
      icon: '💕', 
      description: 'Love, intimacy, emotions',
      color: '#ff1493'
    },
    { 
      id: 'science-fiction', 
      name: 'Sci-Fi', 
      icon: '🚀', 
      description: 'Technology, future, unknown worlds',
      color: '#00ffff'
    },
    { 
      id: 'fantasy', 
      name: 'Fantasy', 
      icon: '🧙‍♂️', 
      description: 'Myth, magic, epic journeys',
      color: '#ffd700'
    },
    { 
      id: 'thriller', 
      name: 'Thriller', 
      icon: '⚡', 
      description: 'Tension, urgency, danger',
      color: '#ff0000'
    },
    { 
      id: 'historical', 
      name: 'Historical', 
      icon: '🏛️', 
      description: 'Nostalgia, legacy, time travel',
      color: '#a0522d'
    },
    { 
      id: 'adventure', 
      name: 'Adventure', 
      icon: '🗺️', 
      description: 'Exploration, courage, freedom',
      color: '#228b22'
    },
    { 
      id: 'comics', 
      name: 'Comics', 
      icon: '💥', 
      description: 'Fun, energy, visual storytelling',
      color: '#ff4500'
    }
  ];

  useEffect(() => {
    loadGenreBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGenreBooks = async () => {
    try {
      setLoading(true);
      const books = {};
      
      for (const genre of genres) {
        let result;
        if (genre.id === 'comics') {
          // Use curated comics list
          result = await GoogleBooksAPI.getCuratedBooksByCategory('comics');
        } else {
          // Use curated books for each genre
          result = await GoogleBooksAPI.getCuratedBooksByCategory(genre.id);
        }
        books[genre.id] = result || [];
      }
      
      setGenreBooks(books);
    } catch (error) {
      console.error('Error loading genre books:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentGenre = () => {
    return genres.find(g => g.id === selectedGenre) || genres[0];
  };

  const getFilteredBooks = () => {
    const books = genreBooks[selectedGenre] || [];
    
    return books.filter(book => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.authors?.some(author => 
          author.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesAuthor) return false;
      }

      // Language filter
      if (filters.language !== 'all' && book.language !== filters.language) {
        return false;
      }

      // Rating filter
      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        if (!book.averageRating || book.averageRating < minRating) {
          return false;
        }
      }

      // Length filter
      if (filters.length !== 'all') {
        if (filters.length === 'short' && book.pageCount > 200) return false;
        if (filters.length === 'medium' && (book.pageCount <= 200 || book.pageCount > 400)) return false;
        if (filters.length === 'long' && book.pageCount <= 400) return false;
      }

      return true;
    });
  };

  const currentGenre = getCurrentGenre();
  const filteredBooks = getFilteredBooks();

  if (loading) {
    return (
      <div className="genre-explorer">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            📚
          </motion.div>
          <p>Loading cinematic book collection...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="genre-explorer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Cinematic Background */}
      <div 
        className="genre-background"
        style={{ 
          background: `radial-gradient(circle at center, ${currentGenre.color}15 0%, transparent 70%)` 
        }}
      >
        <div className="floating-particles-bg">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="bg-particle"
              style={{
                backgroundColor: currentGenre.color,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="genre-header">
        <motion.div
          className="header-content"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="main-title">Genre Explorer</h1>
          <p className="main-subtitle">Discover books that match your mood</p>
        </motion.div>
      </div>

      {/* Genre Navigation */}
      <div className="genre-navigation">
        <div className="genre-tabs">
          {genres.map((genre, index) => (
            <motion.button
              key={genre.id}
              className={`genre-tab ${selectedGenre === genre.id ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre.id)}
              style={{
                '--genre-color': genre.color
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="genre-icon">{genre.icon}</span>
              <span className="genre-name">{genre.name}</span>
              <div className="genre-description">{genre.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        className="search-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="search-container">
          <input
            type="text"
            placeholder="Search books, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>

        <div className="filters-container">
          <select
            value={filters.language}
            onChange={(e) => setFilters({...filters, language: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: e.target.value})}
            className="filter-select"
          >
            <option value="all">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>

          <select
            value={filters.length}
            onChange={(e) => setFilters({...filters, length: e.target.value})}
            className="filter-select"
          >
            <option value="all">Any Length</option>
            <option value="short">Short (≤200 pages)</option>
            <option value="medium">Medium (200-400 pages)</option>
            <option value="long">Long (400+ pages)</option>
          </select>
        </div>
      </motion.div>

      {/* Current Genre Showcase */}
      <motion.div 
        className="current-genre-showcase"
        key={selectedGenre}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.6 }}
      >
        <div className="genre-info">
          <div className="genre-title-section">
            <span className="genre-icon-large">{currentGenre.icon}</span>
            <div>
              <h2 className="genre-title">{currentGenre.name}</h2>
              <p className="genre-emotion">{currentGenre.description}</p>
            </div>
          </div>
          <div className="genre-stats">
            <span className="book-count">{filteredBooks.length} books</span>
          </div>
        </div>

        {/* Books Grid */}
        <div className="books-showcase">
          {filteredBooks.length > 0 ? (
            <motion.div 
              className="books-grid"
              layout
            >
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <EnhancedBookCard
                    book={book}
                    genre={selectedGenre}
                    size="medium"
                    showMetadata={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-genre">
              <div className="empty-icon">{currentGenre.icon}</div>
              <h3>No books found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Personalized Recommendations */}
      <motion.div 
        className="recommendations-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h3 className="recommendations-title">Because you explored {currentGenre.name}</h3>
        <div className="recommendations-grid">
          {genres
            .filter(g => g.id !== selectedGenre)
            .slice(0, 3)
            .map((genre, index) => (
              <motion.div
                key={genre.id}
                className="recommendation-card"
                onClick={() => setSelectedGenre(genre.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="rec-icon">{genre.icon}</div>
                <div className="rec-info">
                  <h4>{genre.name}</h4>
                  <p>{genre.description}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GenreExplorer;