import React from 'react';
import { motion } from 'motion/react';

export const AIWave: React.FC<{ isListening?: boolean }> = ({ isListening = false }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-neon-lime rounded-full"
          animate={{
            height: isListening ? [8, 24, 8] : [4, 8, 4],
            opacity: isListening ? [0.5, 1, 0.5] : 0.3,
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
