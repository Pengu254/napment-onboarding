import { ReactNode } from 'react';
import styles from './Typography.module.css';

interface TitleProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
}

export function Title({ children, size = 'md', align = 'left' }: TitleProps) {
  return (
    <h2 className={`${styles.title} ${styles[`title-${size}`]}`} style={{ textAlign: align }}>
      {children}
    </h2>
  );
}

interface TextProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error';
  align?: 'left' | 'center' | 'right';
}

export function Text({ children, size = 'md', color = 'primary', align = 'left' }: TextProps) {
  return (
    <p className={`${styles.text} ${styles[`text-${size}`]} ${styles[`color-${color}`]}`} style={{ textAlign: align }}>
      {children}
    </p>
  );
}

