/**
 * Main Onboarding Wizard Component
 * 
 * Orchestrates the multi-step onboarding flow
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../stores/onboardingStore';

// Step Components
import { WelcomeStep } from './steps/WelcomeStep';
import { PlatformSelectStep } from './steps/PlatformSelectStep';
import { PlatformConnectStep } from './steps/PlatformConnectStep';
import { BrandConfigStep } from './steps/BrandConfigStep';
import { AgentConfigStep } from './steps/AgentConfigStep';
import { ReviewStep } from './steps/ReviewStep';
import { CompleteStep } from './steps/CompleteStep';

// Progress Indicator
import { ProgressBar } from './ui/ProgressBar';

const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  platform_select: PlatformSelectStep,
  platform_connect: PlatformConnectStep,
  brand_config: BrandConfigStep,
  agent_config: AgentConfigStep,
  review: ReviewStep,
  complete: CompleteStep,
};

const STEP_TITLES = {
  welcome: 'Tervetuloa',
  platform_select: 'Valitse alusta',
  platform_connect: 'Yhdistä kauppa',
  brand_config: 'Brändi',
  agent_config: 'AI-assistentti',
  review: 'Yhteenveto',
  complete: 'Valmis!',
};

export function OnboardingWizard() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  
  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepIndex = Object.keys(STEP_COMPONENTS).indexOf(currentStep);
  const totalSteps = Object.keys(STEP_COMPONENTS).length;
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-semibold text-lg">Napment</span>
            </div>
            
            {/* Progress */}
            {currentStep !== 'welcome' && currentStep !== 'complete' && (
              <div className="hidden sm:block">
                <ProgressBar 
                  currentStep={stepIndex} 
                  totalSteps={totalSteps - 2} // Exclude welcome and complete
                  stepTitle={STEP_TITLES[currentStep]}
                />
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-4xl mx-auto px-6"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

