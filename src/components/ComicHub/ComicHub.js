import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GoogleBooksAPI from '../../services/googleBooksAPI';
import BookRow from '../BookRow/BookRow';
import './ComicHub.css';

const ComicHub = () => {
  const [comicData, setComicData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPublisher, setSelectedPublisher] = useState('all');

  const publishers = [
    { id: 'all', name: 'All Comics', icon: '🦸' },
    { id: 'marvel', name: 'Marvel', icon: '🕷️' },
    { id: 'dc', name: 'DC Comics', icon: '🦇' },
    { id: 'manga', name: 'Manga', icon: '🥷' },
    { id: 'dark-horse', name: 'Dark Horse', icon: '🐴' },
    { id: 'image', name: 'Image Comics', icon: '🎨' }
  ];

  useEffect(() => {
    loadComicData();
  }, []);

  const loadComicData = async () => {
    try {
      setLoading(true);
      const comics = {};
      
      // Load curated superhero comics first
      const curatedSuperhero = await GoogleBooksAPI.getCuratedComicsByPublisher('superhero');
      const additionalSuperhero = await GoogleBooksAPI.getSuperheroComics();
      
      // Combine curated with additional, removing duplicates
      const allSuperhero = [...curatedSuperhero];
      additionalSuperhero.forEach(comic => {
        if (!allSuperhero.find(existing => existing.id === comic.id)) {
          allSuperhero.push(comic);
        }
      });
      comics.superhero = allSuperhero.slice(0, 18);

      // Load curated comics by publisher
      for (const publisher of publishers.slice(1)) { // Skip 'all'
        if (publisher.id !== 'image' && publisher.id !== 'dark-horse') {
          const curatedComics = await GoogleBooksAPI.getCuratedComicsByPublisher(publisher.id);
          const additionalComics = await GoogleBooksAPI.getComicsByPublisher(publisher.id);
          
          // Combine curated with additional
          const allComics = [...curatedComics];
          additionalComics.books?.forEach(comic => {
            if (!allComics.find(existing => existing.id === comic.id)) {
              allComics.push(comic);
            }
          });
          
          comics[publisher.id] = allComics.slice(0, 15);
        } else {
          // For publishers without curated lists, use regular search
          const result = await GoogleBooksAPI.getComicsByPublisher(publisher.id);
          comics[publisher.id] = result.books || [];
        }
      }

      // Load additional comic categories
      const graphicNovels = await GoogleBooksAPI.searchBooks('graphic novel OR "graphic novel"', 15);
      comics.graphicNovels = graphicNovels.books || [];

      const webcomics = await GoogleBooksAPI.searchBooks('webcomic OR "web comic" OR webtoon', 12);
      comics.webcomics = webcomics.books || [];
      
      setComicData(comics);
    } catch (error) {
      console.error('Error loading comic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPublishers = selectedPublisher === 'all' 
    ? publishers.slice(1) 
    : publishers.filter(pub => pub.id === selectedPublisher);

  if (loading) {
    return (
      <div className="comic-hub">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🦸
          </motion.div>
          <p>Loading comic universe...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="comic-hub"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="comic-hero-section">
        <div className="comic-hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="comic-title">Comic Hub</h1>
            <p className="comic-subtitle">
              Dive into the world of superheroes, manga, and graphic novels
            </p>
          </motion.div>
          
          <motion.div
            className="comic-stats"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="stat-item">
              <div className="stat-icon">🦸‍♂️</div>
              <div className="stat-text">Superheroes</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🥷</div>
              <div className="stat-text">Manga</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🎨</div>
              <div className="stat-text">Graphic Novels</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="comic-content">
        <div className="publisher-filters">
          {publishers.map(publisher => (
            <button
              key={publisher.id}
              className={`publisher-filter ${selectedPublisher === publisher.id ? 'active' : ''}`}
              onClick={() => setSelectedPublisher(publisher.id)}
            >
              <span className="publisher-icon">{publisher.icon}</span>
              <span className="publisher-name">{publisher.name}</span>
            </button>
          ))}
        </div>

        {comicData.superhero && comicData.superhero.length > 0 && (
          <BookRow
            title="Superhero Comics"
            books={comicData.superhero}
            subtitle="Epic adventures of your favorite heroes"
          />
        )}

        {filteredPublishers.map(publisher => (
          comicData[publisher.id] && comicData[publisher.id].length > 0 && (
            <BookRow
              key={publisher.id}
              title={publisher.name}
              books={comicData[publisher.id]}
              subtitle={getPublisherSubtitle(publisher.id)}
            />
          )
        ))}

        {comicData.graphicNovels && comicData.graphicNovels.length > 0 && (
          <BookRow
            title="Graphic Novels"
            books={comicData.graphicNovels}
            subtitle="Artistic storytelling in visual form"
          />
        )}

        {comicData.webcomics && comicData.webcomics.length > 0 && (
          <BookRow
            title="Webcomics & Digital"
            books={comicData.webcomics}
            subtitle="Modern digital comic experiences"
          />
        )}

        <div className="comic-features">
          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="feature-icon">🎭</div>
            <h3>Character Universe</h3>
            <p>Explore interconnected storylines and character arcs</p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="feature-icon">📚</div>
            <h3>Reading Order</h3>
            <p>Follow recommended reading sequences for complex series</p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="feature-icon">⭐</div>
            <h3>Top Rated</h3>
            <p>Discover critically acclaimed and fan-favorite comics</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const getPublisherSubtitle = (publisherId) => {
  const subtitles = {
    marvel: 'The Marvel Universe awaits',
    dc: 'Heroes and villains of DC',
    manga: 'Japanese comics and graphic novels',
    'dark-horse': 'Independent comics and adaptations',
    image: 'Creator-owned stories and art'
  };
  return subtitles[publisherId] || '';
};

export default ComicHub;