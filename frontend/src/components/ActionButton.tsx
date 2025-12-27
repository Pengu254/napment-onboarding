import { ActionButtonProps } from '../types/mcp-messages';
import styles from './ActionButton.module.css';

interface Props {
  data: ActionButtonProps;
  onClick: (action: string) => void;
}

export function ActionButton({ data, onClick }: Props) {
  const { label, action, variant = 'primary', disabled } = data;
  
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={() => onClick(action)}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

