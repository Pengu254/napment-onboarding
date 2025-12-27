import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({ children, size = 'md', className = '' }: CardProps) {
  return (
    <motion.div
      className={`${styles.card} ${styles[size]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

interface ColProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  gap?: 1 | 2 | 3 | 4 | 5 | 6;
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  className?: string;
}

export function Col({ children, align = 'start', gap = 2, padding, className = '' }: ColProps) {
  const style: React.CSSProperties = {
    alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
    gap: `var(--space-${gap})`,
    paddingTop: padding?.top ? `var(--space-${padding.top})` : undefined,
    paddingBottom: padding?.bottom ? `var(--space-${padding.bottom})` : undefined,
    paddingLeft: padding?.left ? `var(--space-${padding.left})` : undefined,
    paddingRight: padding?.right ? `var(--space-${padding.right})` : undefined,
  };

  return (
    <div className={`${styles.col} ${className}`} style={style}>
      {children}
    </div>
  );
}

interface RowProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  gap?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function Row({ children, align = 'center', gap = 2, className = '' }: RowProps) {
  const style: React.CSSProperties = {
    alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
    gap: `var(--space-${gap})`,
  };

  return (
    <div className={`${styles.row} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Divider() {
  return <div className={styles.divider} />;
}

export function Spacer() {
  return <div className={styles.spacer} />;
}

