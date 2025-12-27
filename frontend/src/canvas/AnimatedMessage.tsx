import { motion } from 'framer-motion';
import { MessageContent } from '../types/canvas-types';
import styles from './AnimatedMessage.module.css';

interface Props {
  data: MessageContent;
}

const variants = {
  greeting: styles.greeting,
  question: styles.question,
  response: styles.response,
  celebration: styles.celebration,
};

export function AnimatedMessage({ data }: Props) {
  const { text, variant = 'question', delay = 0 } = data;

  return (
    <motion.div
      className={`${styles.message} ${variants[variant]}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay / 1000,
        ease: 'easeOut'
      }}
    >
      <p>{text}</p>
    </motion.div>
  );
}

