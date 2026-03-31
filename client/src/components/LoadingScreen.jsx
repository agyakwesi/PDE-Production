import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = ({ message = "Securing Allocation..." }) => {
  const pathVariants = {
    hidden: { 
      pathLength: 0, 
      opacity: 0,
      fill: "rgba(197, 160, 89, 0)" 
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      fill: "rgba(197, 160, 89, 0.1)",
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 },
        fill: { duration: 1, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
      }
    }
  };

  return (
    <div className="loading-screen-overlay">
      <div className="loading-content">
        <div className="loading-svg-container">
          <motion.svg
            className="loading-svg"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M 60,10 L 110,60 L 60,110 L 10,60 Z M 60,30 L 90,60 L 60,90 L 30,60 Z"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.svg>
        </div>
        <motion.div 
          className="loading-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
