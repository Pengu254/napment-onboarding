/**
 * Napment Onboarding - Main App
 * 
 * Wizard-style onboarding flow for merchants
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingWizard } from './components/OnboardingWizard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <OnboardingWizard />
      </div>
    </QueryClientProvider>
  );
}

