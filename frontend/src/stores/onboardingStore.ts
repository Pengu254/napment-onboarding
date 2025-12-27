/**
 * Onboarding State Management with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingStep, Platform, BrandConfig, AgentConfig } from '../types';

interface OnboardingState {
  // Session
  sessionId: string | null;
  currentStep: OnboardingStep;
  
  // Platform
  selectedPlatform: Platform | null;
  shopDomain: string;
  shopName: string;
  email: string;
  isConnected: boolean;
  accessToken: string | null;
  
  // Configuration
  brandConfig: BrandConfig | null;
  agentConfig: AgentConfig | null;
  
  // Actions
  setSessionId: (id: string) => void;
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setPlatform: (platform: Platform) => void;
  setShopDomain: (domain: string) => void;
  setShopName: (name: string) => void;
  setEmail: (email: string) => void;
  setConnected: (connected: boolean, token?: string) => void;
  
  setBrandConfig: (config: BrandConfig) => void;
  setAgentConfig: (config: AgentConfig) => void;
  
  reset: () => void;
}

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'platform_select',
  'platform_connect',
  'brand_config',
  'agent_config',
  'review',
  'complete',
];

const initialState = {
  sessionId: null,
  currentStep: 'welcome' as OnboardingStep,
  selectedPlatform: null,
  shopDomain: '',
  shopName: '',
  email: '',
  isConnected: false,
  accessToken: null,
  brandConfig: null,
  agentConfig: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSessionId: (id) => set({ sessionId: id }),
      
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          set({ currentStep: STEP_ORDER[currentIndex + 1] });
        }
      },
      
      prevStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
      },
      
      setPlatform: (platform) => set({ selectedPlatform: platform }),
      setShopDomain: (domain) => set({ shopDomain: domain }),
      setShopName: (name) => set({ shopName: name }),
      setEmail: (email) => set({ email: email }),
      
      setConnected: (connected, token) => set({ 
        isConnected: connected, 
        accessToken: token || null 
      }),
      
      setBrandConfig: (config) => set({ brandConfig: config }),
      setAgentConfig: (config) => set({ agentConfig: config }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'napment-onboarding',
      partialize: (state) => ({
        sessionId: state.sessionId,
        currentStep: state.currentStep,
        selectedPlatform: state.selectedPlatform,
        shopDomain: state.shopDomain,
        shopName: state.shopName,
        email: state.email,
      }),
    }
  )
);

