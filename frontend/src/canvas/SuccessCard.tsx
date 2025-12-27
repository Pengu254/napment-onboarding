import { motion } from 'framer-motion';
import { SuccessContent } from '../types/canvas-types';
import styles from './SuccessCard.module.css';

interface Props {
  data: SuccessContent;
  onNext?: (action: string) => void;
}

export function SuccessCard({ data, onNext }: Props) {
  const { title, subtitle, details, nextLabel, nextAction, delay = 0 } = data;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div 
        className={styles.iconWrapper}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: (delay + 200) / 1000, type: 'spring', stiffness: 200 }}
      >
        <div className={styles.icon}>✓</div>
      </motion.div>

      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (delay + 400) / 1000 }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (delay + 500) / 1000 }}
        >
          {subtitle}
        </motion.p>
      )}

      {details && details.length > 0 && (
        <motion.div 
          className={styles.details}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (delay + 600) / 1000 }}
        >
          {details.map((detail, i) => (
            <div key={i} className={styles.detailRow}>
              <span className={styles.detailLabel}>{detail.label}</span>
              <span className={styles.detailValue}>{detail.value}</span>
            </div>
          ))}
        </motion.div>
      )}

      {nextLabel && nextAction && (
        <motion.button
          className={styles.nextButton}
          onClick={() => onNext?.(nextAction)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (delay + 800) / 1000 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {nextLabel}
          <span className={styles.arrow}>→</span>
        </motion.button>
      )}
    </motion.div>
  );
}

