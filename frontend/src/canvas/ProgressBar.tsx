import { motion } from 'framer-motion';
import { ProgressContent } from '../types/canvas-types';
import styles from './ProgressBar.module.css';

interface Props {
  data: ProgressContent;
}

export function ProgressBar({ data }: Props) {
  const { steps, currentStep, showLabels = true } = data;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <motion.div
          className={styles.fill}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {showLabels && (
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.step} ${
                index < currentStep ? styles.completed :
                index === currentStep ? styles.current : styles.pending
              }`}
            >
              <div className={styles.dot}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={styles.label}>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

