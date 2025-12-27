import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CelebrationContent } from '../types/canvas-types';
import styles from './Celebration.module.css';

interface Props {
  data: CelebrationContent;
  onComplete?: () => void;
}

export function Celebration({ data, onComplete }: Props) {
  const { confetti: showConfetti = true, message, duration = 3000 } = data;

  useEffect(() => {
    if (showConfetti) {
      // Fire confetti!
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.2, y: 0.6 },
          zIndex: 9999,
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.8, y: 0.6 },
          zIndex: 9999,
        });
      }, 400);
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [showConfetti, duration, onComplete]);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {message && (
        <motion.div
          className={styles.message}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {message}
        </motion.div>
      )}
    </motion.div>
  );
}

