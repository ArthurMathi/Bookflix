import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GoogleBooksAPI from '../../services/googleBooksAPI';
import { useBooks } from '../../context/BookContext';
import HeroBanner from '../HeroBanner/HeroBanner';
import BookRow from '../BookRow/BookRow';
import './HomeScreen.css';

const HomeScreen = () => {
  const [heroBook, setHeroBook] = useState(null);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [moodBasedBooks, setMoodBasedBooks] = useState({});
  const [categoryBooks, setCategoryBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const { bucketList } = useBooks();

  useEffect(() => {
    loadHomeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load trending books
      const trending = await GoogleBooksAPI.getTrendingBooks();
      setTrendingBooks(trending);
      
      // Set hero book (first trending book)
      if (trending.length > 0) {
        setHeroBook(trending[0]);
      }

      // Load curated books by category with guaranteed cover images
      const categories = ['fiction', 'mystery', 'romance', 'fantasy', 'science-fiction', 'thriller', 'horror', 'historical', 'adventure'];
      const categoryBooks = {};
      
      for (const category of categories) {
        const curatedBooks = await GoogleBooksAPI.getCuratedBooksByCategory(category);
        
        const categoryNames = {
          fiction: 'Popular Fiction',
          mystery: 'Mystery & Detective',
          romance: 'Romance',
          fantasy: 'Fantasy',
          'science-fiction': 'Science Fiction',
          thriller: 'Thriller & Suspense',
          horror: 'Horror',
          historical: 'Historical Fiction',
          adventure: 'Adventure'
        };

        categoryBooks[category] = {
          name: categoryNames[category],
          books: curatedBooks || []
        };
      }
      
      setCategoryBooks(categoryBooks);

      // Load mood-based recommendations
      const moods = ['emotional', 'dark', 'hopeful', 'adventurous'];
      const moodBooks = {};
      
      for (const mood of moods) {
        const books = await GoogleBooksAPI.getBooksByMood(mood);
        moodBooks[mood] = books.books || [];
      }
      
      setMoodBasedBooks(moodBooks);

      // Set continue reading from bucket list (books with 'reading' status)
      const readingBooks = bucketList.filter(book => book.status === 'reading');
      setContinueReading(readingBooks);

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-screen">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            📚
          </motion.div>
          <p>Loading your personalized library...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="home-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {heroBook && <HeroBanner book={heroBook} />}
      
      <div className="home-content">
        {continueReading.length > 0 && (
          <BookRow
            title="Continue Reading"
            books={continueReading}
            showProgress={true}
          />
        )}

        <BookRow
          title="Trending Now"
          books={trendingBooks}
          subtitle="Popular books everyone's talking about"
        />

        {Object.entries(categoryBooks).map(([categoryId, categoryData]) => (
          categoryData.books.length > 0 && (
            <BookRow
              key={categoryId}
              title={categoryData.name}
              books={categoryData.books}
              subtitle={getCategorySubtitle(categoryId)}
            />
          )
        ))}

        {Object.entries(moodBasedBooks).map(([mood, books]) => (
          books.length > 0 && (
            <BookRow
              key={mood}
              title={getMoodTitle(mood)}
              books={books}
              subtitle={getMoodSubtitle(mood)}
            />
          )
        ))}

        <div className="quick-actions">
          <motion.div
            className="action-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/categories" className="action-link">
              <div className="action-icon">📚</div>
              <h3>Browse Categories</h3>
              <p>Explore books by genre</p>
            </Link>
          </motion.div>

          <motion.div
            className="action-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/genre-explorer" className="action-link">
              <div className="action-icon">🎭</div>
              <h3>Genre Explorer</h3>
              <p>Cinematic book discovery</p>
            </Link>
          </motion.div>

          <motion.div
            className="action-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/comic-hub" className="action-link">
              <div className="action-icon">🦸</div>
              <h3>Comic Hub</h3>
              <p>Superhero comics & manga</p>
            </Link>
          </motion.div>

          <motion.div
            className="action-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/bucket-list" className="action-link">
              <div className="action-icon">📖</div>
              <h3>My Letterbox</h3>
              <p>Reading diary & book collection</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const getMoodTitle = (mood) => {
  const titles = {
    emotional: 'Emotional Journeys',
    dark: 'Dark & Mysterious',
    hopeful: 'Uplifting Stories',
    adventurous: 'Epic Adventures'
  };
  return titles[mood] || mood;
};

const getMoodSubtitle = (mood) => {
  const subtitles = {
    emotional: 'Books that touch your heart',
    dark: 'Thrilling and suspenseful reads',
    hopeful: 'Stories that inspire and uplift',
    adventurous: 'Action-packed journeys'
  };
  return subtitles[mood] || '';
};

const getCategorySubtitle = (categoryId) => {
  const subtitles = {
    fiction: 'Captivating stories and novels',
    mystery: 'Puzzles, detectives, and suspense',
    romance: 'Love stories that warm the heart',
    fantasy: 'Magical worlds and epic quests',
    'science-fiction': 'Future worlds and technology',
    biography: 'Real lives, extraordinary stories'
  };
  return subtitles[categoryId] || '';
};

export default HomeScreen;