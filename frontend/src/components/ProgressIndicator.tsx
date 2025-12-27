import { ProgressIndicatorProps } from '../types/mcp-messages';
import styles from './ProgressIndicator.module.css';

interface Props {
  data: ProgressIndicatorProps;
}

export function ProgressIndicator({ data }: Props) {
  const { steps, currentStep } = data;
  
  return (
    <div className={styles.container}>
      {steps.map((step, index) => (
        <div key={index} className={styles.stepWrapper}>
          <div className={styles.step}>
            <div 
              className={`${styles.dot} ${
                index < currentStep 
                  ? styles.completed 
                  : index === currentStep 
                    ? styles.current 
                    : styles.pending
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span 
              className={`${styles.label} ${
                index === currentStep ? styles.currentLabel : ''
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`${styles.connector} ${
                index < currentStep ? styles.completedConnector : ''
              }`} 
            />
          )}
        </div>
      ))}
    </div>
  );
}

