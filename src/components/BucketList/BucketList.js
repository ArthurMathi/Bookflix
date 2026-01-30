import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooks } from '../../context/BookContext';
import BookCard from '../BookCard/BookCard';
import './BucketList.css';

const BucketList = () => {
  const { user } = useAuth();
  const { bucketList, readingHistory, reviews, updateBookStatus } = useBooks();
  const [activeTab, setActiveTab] = useState('diary');
  const [selectedYear, setSelectedYear] = useState('all');

  // Get recent reading activity for diary
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent reviews
    reviews.slice(-10).forEach(review => {
      const book = [...bucketList, ...readingHistory].find(b => b.id === review.bookId);
      if (book) {
        activities.push({
          type: 'review',
          date: review.createdDate,
          book,
          review,
          id: `review-${review.id}`
        });
      }
    });

    // Add recently completed books
    readingHistory.slice(-10).forEach(book => {
      activities.push({
        type: 'completed',
        date: book.completedDate,
        book,
        id: `completed-${book.id}`
      });
    });

    // Add currently reading books
    bucketList.filter(book => book.status === 'reading').forEach(book => {
      activities.push({
        type: 'reading',
        date: book.addedDate,
        book,
        id: `reading-${book.id}`
      });
    });

    // Sort by date (most recent first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  };

  const getReadingStats = () => {
    const currentYear = new Date().getFullYear();
    const thisYearBooks = readingHistory.filter(book => 
      new Date(book.completedDate).getFullYear() === currentYear
    ).length;
    
    const totalBooks = readingHistory.length;
    const currentlyReading = bucketList.filter(book => book.status === 'reading').length;
    const wantToRead = bucketList.filter(book => book.status === 'planned').length;
    
    return { thisYearBooks, totalBooks, currentlyReading, wantToRead };
  };

  const getYearlyStats = () => {
    const years = {};
    readingHistory.forEach(book => {
      const year = new Date(book.completedDate).getFullYear();
      years[year] = (years[year] || 0) + 1;
    });
    return years;
  };

  const tabs = [
    { id: 'diary', label: 'Diary', icon: '📖' },
    { id: 'lists', label: 'Lists', icon: '📋' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ];

  const stats = getReadingStats();
  const recentActivity = getRecentActivity();
  const yearlyStats = getYearlyStats();
  const years = Object.keys(yearlyStats).sort((a, b) => b - a);

  const filteredBooks = selectedYear === 'all' 
    ? bucketList 
    : bucketList.filter(book => {
        const bookYear = new Date(book.addedDate).getFullYear();
        return bookYear === parseInt(selectedYear);
      });

  return (
    <motion.div 
      className="letterbox-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <div className="letterbox-header">
        <div className="profile-section">
          <img 
            src={user?.avatar} 
            alt={user?.name}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-name">{user?.name}'s Letterbox</h1>
            <p className="profile-tagline">Reading diary and book collection</p>
            
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.thisYearBooks}</span>
                <span className="stat-label">this year</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalBooks}</span>
                <span className="stat-label">total books</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.currentlyReading}</span>
                <span className="stat-label">reading</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="letterbox-tabs">
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

      {/* Content Sections */}
      <div className="letterbox-content">
        {activeTab === 'diary' && (
          <motion.div 
            className="diary-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>Recent Activity</h2>
              <p>Your reading journey</p>
            </div>

            <div className="activity-feed">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="activity-date">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    
                    <div className="activity-content">
                      <div className="activity-book">
                        <img 
                          src={activity.book.imageLinks?.thumbnail || '/placeholder-book.jpg'}
                          alt={activity.book.title}
                          className="activity-book-cover"
                        />
                      </div>
                      
                      <div className="activity-details">
                        <div className="activity-type">
                          {activity.type === 'review' && (
                            <span className="activity-badge review">
                              ⭐ Reviewed
                            </span>
                          )}
                          {activity.type === 'completed' && (
                            <span className="activity-badge completed">
                              ✅ Finished reading
                            </span>
                          )}
                          {activity.type === 'reading' && (
                            <span className="activity-badge reading">
                              📖 Started reading
                            </span>
                          )}
                        </div>
                        
                        <Link 
                          to={`/book/${activity.book.id}`}
                          className="activity-book-title"
                        >
                          {activity.book.title}
                        </Link>
                        
                        <p className="activity-book-author">
                          by {activity.book.authors?.join(', ')}
                        </p>
                        
                        {activity.review && (
                          <div className="activity-review">
                            <div className="review-rating">
                              {'★'.repeat(activity.review.rating)}
                              {'☆'.repeat(5 - activity.review.rating)}
                            </div>
                            {activity.review.reviewText && (
                              <p className="review-excerpt">
                                {activity.review.reviewText.length > 150 
                                  ? `${activity.review.reviewText.substring(0, 150)}...`
                                  : activity.review.reviewText
                                }
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="empty-diary">
                  <div className="empty-icon">📖</div>
                  <h3>Your reading diary is empty</h3>
                  <p>Start reading books and writing reviews to build your literary journey!</p>
                  <Link to="/home" className="btn-primary">
                    Discover Books
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'lists' && (
          <motion.div 
            className="lists-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>My Reading Lists</h2>
              <div className="list-filters">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="year-filter"
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="reading-lists">
              <div className="list-category">
                <h3>Currently Reading ({bucketList.filter(b => b.status === 'reading').length})</h3>
                <div className="books-grid">
                  {bucketList.filter(book => book.status === 'reading').map(book => (
                    <BookCard key={book.id} book={book} showProgress={true} size="small" />
                  ))}
                </div>
              </div>

              <div className="list-category">
                <h3>Want to Read ({bucketList.filter(b => b.status === 'planned').length})</h3>
                <div className="books-grid">
                  {bucketList.filter(book => book.status === 'planned').map(book => (
                    <BookCard key={book.id} book={book} size="small" />
                  ))}
                </div>
              </div>

              <div className="list-category">
                <h3>Completed ({readingHistory.length})</h3>
                <div className="books-grid">
                  {readingHistory.slice(0, 12).map(book => (
                    <BookCard key={`${book.id}-${book.completedDate}`} book={book} size="small" />
                  ))}
                </div>
                {readingHistory.length > 12 && (
                  <Link to="/history" className="view-all-link">
                    View all completed books →
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            className="stats-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>Reading Statistics</h2>
              <p>Your reading patterns and achievements</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{stats.totalBooks}</div>
                <div className="stat-label">Total Books Read</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{stats.thisYearBooks}</div>
                <div className="stat-label">Books This Year</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-value">{stats.currentlyReading}</div>
                <div className="stat-label">Currently Reading</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{reviews.length}</div>
                <div className="stat-label">Reviews Written</div>
              </div>
            </div>

            <div className="yearly-breakdown">
              <h3>Reading by Year</h3>
              <div className="year-stats">
                {years.map(year => (
                  <div key={year} className="year-stat">
                    <span className="year">{year}</span>
                    <div className="year-bar">
                      <div 
                        className="year-fill"
                        style={{ 
                          width: `${(yearlyStats[year] / Math.max(...Object.values(yearlyStats))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="year-count">{yearlyStats[year]} books</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div 
            className="reviews-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>My Reviews</h2>
              <p>Books I've reviewed and rated</p>
            </div>

            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.slice().reverse().map((review, index) => {
                  const book = [...bucketList, ...readingHistory].find(b => b.id === review.bookId);
                  if (!book) return null;

                  return (
                    <motion.div
                      key={review.id}
                      className="review-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="review-book-info">
                        <img 
                          src={book.imageLinks?.thumbnail || '/placeholder-book.jpg'}
                          alt={book.title}
                          className="review-book-cover"
                        />
                        <div className="review-book-details">
                          <Link to={`/book/${book.id}`} className="review-book-title">
                            {book.title}
                          </Link>
                          <p className="review-book-author">by {book.authors?.join(', ')}</p>
                          <div className="review-date">
                            {new Date(review.createdDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <div className="review-rating">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                          <span className="rating-number">({review.rating}/5)</span>
                        </div>
                        
                        {review.reviewText && (
                          <p className="review-text">{review.reviewText}</p>
                        )}
                        
                        {review.moodTags && review.moodTags.length > 0 && (
                          <div className="review-moods">
                            {review.moodTags.map(mood => (
                              <span key={mood} className="mood-tag">{mood}</span>
                            ))}
                          </div>
                        )}
                        
                        <Link to={`/review/${book.id}`} className="edit-review">
                          Edit Review
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="empty-reviews">
                  <div className="empty-icon">⭐</div>
                  <h3>No reviews yet</h3>
                  <p>Start reviewing books to share your thoughts and build your reading profile!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BucketList;