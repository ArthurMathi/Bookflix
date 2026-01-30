import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useBooks } from '../../context/BookContext';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { bucketList, readingHistory, reviews } = useBooks();
  const [activeTab, setActiveTab] = useState('overview');

  const getReadingStreak = () => {
    // Mock calculation - in real app, this would be based on actual reading dates
    return Math.floor(Math.random() * 30) + 1;
  };

  const getProfileStats = () => {
    const totalBooks = readingHistory.length;
    const currentlyReading = bucketList.filter(book => book.status === 'reading').length;
    const wantToRead = bucketList.filter(book => book.status === 'planned').length;
    const totalReviews = reviews.length;
    const readingStreak = getReadingStreak();
    
    const favoriteGenres = user?.favoriteGenres || [];
    const joinDate = user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    }) : 'Unknown';

    return {
      totalBooks,
      currentlyReading,
      wantToRead,
      totalReviews,
      readingStreak,
      favoriteGenres,
      joinDate
    };
  };

  const stats = getProfileStats();

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'stats', label: 'Statistics', icon: '📈' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <motion.div 
      className="profile-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="profile-header">
        <div className="profile-info">
          <img 
            src={user?.avatar} 
            alt={user?.name}
            className="profile-avatar-large"
          />
          <div className="profile-details">
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-join-date">Member since {stats.joinDate}</p>
            
            <div className="profile-badges">
              <div className="badge">
                <span className="badge-icon">🔥</span>
                <span className="badge-text">{stats.readingStreak} day streak</span>
              </div>
              <div className="badge">
                <span className="badge-icon">📚</span>
                <span className="badge-text">{stats.totalBooks} books read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Reading Progress</h3>
                <div className="progress-stats">
                  <div className="progress-item">
                    <span className="progress-number">{stats.currentlyReading}</span>
                    <span className="progress-label">Currently Reading</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-number">{stats.wantToRead}</span>
                    <span className="progress-label">Want to Read</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-number">{stats.totalBooks}</span>
                    <span className="progress-label">Completed</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Favorite Genres</h3>
                <div className="genres-list">
                  {stats.favoriteGenres.map((genre, index) => (
                    <span key={index} className="genre-chip">{genre}</span>
                  ))}
                </div>
              </div>

              <div className="overview-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">📖</span>
                    <span className="activity-text">Started reading a new book</span>
                    <span className="activity-time">2 days ago</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">⭐</span>
                    <span className="activity-text">Wrote a review</span>
                    <span className="activity-time">1 week ago</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">✅</span>
                    <span className="activity-text">Completed a book</span>
                    <span className="activity-time">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="stats-grid">
              <div className="stat-card-large">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{stats.totalBooks}</div>
                <div className="stat-label">Books Read</div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{stats.totalReviews}</div>
                <div className="stat-label">Reviews Written</div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.readingStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">📖</div>
                <div className="stat-value">{stats.currentlyReading}</div>
                <div className="stat-label">Currently Reading</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="achievements-grid">
              <div className="achievement-card earned">
                <div className="achievement-icon">🏆</div>
                <h4>First Book</h4>
                <p>Read your first book</p>
              </div>
              <div className="achievement-card earned">
                <div className="achievement-icon">📚</div>
                <h4>Bookworm</h4>
                <p>Read 5 books</p>
              </div>
              <div className="achievement-card">
                <div className="achievement-icon">🌟</div>
                <h4>Rising Star</h4>
                <p>Read 10 books</p>
              </div>
              <div className="achievement-card">
                <div className="achievement-icon">🔥</div>
                <h4>On Fire</h4>
                <p>Maintain a 30-day reading streak</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="settings-section">
              <h3>Account Settings</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <span className="setting-label">Email Notifications</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Reading Reminders</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Public Profile</span>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <button className="btn-danger" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileScreen;