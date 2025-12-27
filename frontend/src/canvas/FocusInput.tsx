import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FocusInputContent } from '../types/canvas-types';
import styles from './FocusInput.module.css';

interface Props {
  data: FocusInputContent;
  onSubmit: (fieldKey: string, value: string) => void;
}

export function FocusInput({ data, onSubmit }: Props) {
  const { label, placeholder, inputType = 'text', submitLabel = 'Jatka', fieldKey, delay = 0 } = data;
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, (delay + 500));
    return () => clearTimeout(timer);
  }, [delay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(fieldKey, value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(fieldKey, value.trim());
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.label 
        className={styles.label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: (delay + 200) / 1000 }}
      >
        {label}
      </motion.label>
      
      <motion.div 
        className={`${styles.inputWrapper} ${isFocused ? styles.focused : ''}`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: (delay + 300) / 1000 }}
      >
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
        />
        
        <motion.button
          type="submit"
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={!value.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitLabel}
          <span className={styles.arrow}>→</span>
        </motion.button>
      </motion.div>
      
      <motion.p 
        className={styles.hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: (delay + 500) / 1000 }}
      >
        Paina Enter jatkaaksesi
      </motion.p>
    </motion.div>
  );
}

