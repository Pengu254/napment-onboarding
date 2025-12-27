import { motion } from 'framer-motion';
import { FocusSelectContent } from '../types/canvas-types';
import styles from './FocusSelect.module.css';

interface Props {
  data: FocusSelectContent;
  onSelect: (fieldKey: string, value: string) => void;
}

export function FocusSelect({ data, onSelect }: Props) {
  const { label, options, fieldKey, delay = 0 } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: delay / 1000,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {label && (
        <motion.p className={styles.label} variants={itemVariants}>
          {label}
        </motion.p>
      )}
      
      <div className={styles.options}>
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            className={styles.option}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(fieldKey, option.value)}
            custom={index}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <div className={styles.optionContent}>
              <span className={styles.optionLabel}>{option.label}</span>
              {option.description && (
                <span className={styles.optionDescription}>{option.description}</span>
              )}
            </div>
            <span className={styles.arrow}>→</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

