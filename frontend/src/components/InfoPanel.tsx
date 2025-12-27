import { InfoPanelProps } from '../types/mcp-messages';
import styles from './InfoPanel.module.css';

interface Props {
  data: InfoPanelProps;
}

const ICONS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌'
};

export function InfoPanel({ data }: Props) {
  const { title, content, variant = 'info' } = data;
  
  return (
    <div className={`${styles.panel} ${styles[variant]}`}>
      <div className={styles.icon}>{ICONS[variant]}</div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.text}>{content}</p>
      </div>
    </div>
  );
}

