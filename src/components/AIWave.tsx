import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const AIWave: React.FC<{ isListening?: boolean, isProcessing?: boolean }> = ({ isListening = false, isProcessing = false }) => {
  const isActive = isListening || isProcessing;
  
  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4">
      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3].map((h, i) => (
        <motion.div
          key={i}
          className={cn(
            "w-1 rounded-full",
            isProcessing ? "bg-neon-blue" : "bg-primary"
          )}
          animate={{
            height: isActive ? [h * 32, (1 - h) * 32, h * 32] : 4,
            opacity: isActive ? [0.6, 1, 0.6] : 0.2,
          }}
          transition={{
            duration: isProcessing ? 0.4 : 0.6,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
