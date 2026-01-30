import React from 'react';
import { motion } from 'framer-motion';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <motion.div 
      className="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="splash-content">
        <motion.div
          className="logo-container"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut",
            delay: 0.2
          }}
        >
          <div className="logo">
            <span className="logo-text">BookFlix</span>
            <div className="logo-subtitle">Netflix for Books</div>
          </div>
        </motion.div>

        <motion.div
          className="loading-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="loading-dots">
            <motion.div 
              className="dot"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.div 
              className="dot"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2
              }}
            />
            <motion.div 
              className="dot"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: 0.4
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;