import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCanvasConnection } from '../hooks/useCanvasConnection';
import {
  AnimatedMessage,
  FocusInput,
  FocusSelect,
  PlatformCard,
  SuccessCard,
  Celebration,
  ProgressBar
} from './index';
import {
  CanvasContent,
  MessageContent,
  FocusInputContent,
  FocusSelectContent,
  PlatformCardContent,
  SuccessContent,
  ProgressContent,
  CelebrationContent
} from '../types/canvas-types';
import styles from './OnboardingCanvas.module.css';

interface OnboardingCanvasProps {
  wsUrl?: string;
}

export function OnboardingCanvas({ wsUrl }: OnboardingCanvasProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const {
    contents,
    wsConnected,
    showCelebration,
    celebrationMessage,
    submitInput,
    submitSelect,
    connectPlatform,
    triggerAction,
    hideCelebration
  } = useCanvasConnection({ wsUrl });

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [contents]);

  const renderContent = (content: CanvasContent, index: number) => {
    const isLast = index === contents.length - 1;
    
    switch (content.type) {
      case 'message':
      case 'greeting':
      case 'question':
        return (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: isLast ? 0.1 : 0 }}
          >
            <AnimatedMessage data={content as MessageContent} />
          </motion.div>
        );
      
      case 'focus_input':
        return (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FocusInput
              data={content as FocusInputContent}
              onSubmit={submitInput}
            />
          </motion.div>
        );
      
      case 'focus_select':
        return (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FocusSelect
              data={content as FocusSelectContent}
              onSelect={submitSelect}
            />
          </motion.div>
        );
      
      case 'platform_card':
        return (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PlatformCard
              data={content as PlatformCardContent}
              onConnect={connectPlatform}
            />
          </motion.div>
        );
      
      case 'success':
        return (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SuccessCard
              data={content as SuccessContent}
              onNext={triggerAction}
            />
          </motion.div>
        );
      
      case 'progress':
        return (
          <motion.div key={content.id}>
            <ProgressBar data={content as ProgressContent} />
          </motion.div>
        );
      
      case 'loading':
        return (
          <motion.div
            key={content.id}
            className={styles.loading}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.spinner} />
            <p>{(content as { message: string }).message}</p>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.canvas}>
      {/* Connection indicator */}
      <div className={`${styles.connectionStatus} ${wsConnected ? styles.connected : ''}`}>
        <span className={styles.statusDot} />
        {wsConnected ? 'Connected' : 'Connecting...'}
      </div>

      {/* Chat-style scrollable content */}
      <div className={styles.content} ref={contentRef}>
        <div className={styles.contentWrapper}>
          <AnimatePresence mode="sync">
            {contents.length === 0 && wsConnected && (
              <motion.div
                className={styles.waiting}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.waitingIcon}>✨</div>
                <p>Valmiina aloittamaan...</p>
              </motion.div>
            )}
            
            {contents.map((content, index) => renderContent(content, index))}
          </AnimatePresence>
          
          {/* Scroll anchor */}
          <div ref={bottomRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <Celebration
            data={{
              id: 'celebration',
              type: 'celebration',
              confetti: true,
              message: celebrationMessage
            } as CelebrationContent}
            onComplete={hideCelebration}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
