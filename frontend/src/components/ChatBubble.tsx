import { ChatBubbleProps } from '../types/mcp-messages';
import styles from './ChatBubble.module.css';

interface Props {
  data: ChatBubbleProps;
}

export function ChatBubble({ data }: Props) {
  const { message, isAgent, timestamp } = data;
  
  return (
    <div className={`${styles.bubble} ${isAgent ? styles.agent : styles.user}`}>
      {isAgent && (
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>✨</span>
        </div>
      )}
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {timestamp && (
          <span className={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

