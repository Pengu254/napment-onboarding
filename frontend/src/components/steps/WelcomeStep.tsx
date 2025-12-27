/**
 * Welcome Step - First step of onboarding
 */

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

const features = [
  {
    icon: Sparkles,
    title: 'AI-assistentti',
    description: 'Personoitu ostokokemus jokaiselle asiakkaalle',
  },
  {
    icon: Zap,
    title: 'Nopea käyttöönotto',
    description: 'Valmis muutamassa minuutissa',
  },
  {
    icon: Shield,
    title: 'Turvallinen',
    description: 'GDPR-yhteensopiva ja turvallinen',
  },
];

export function WelcomeStep() {
  const nextStep = useOnboardingStore((s) => s.nextStep);
  
  return (
    <div className="flex flex-col items-center text-center py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Uusi tapa myydä verkossa</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Tervetuloa{' '}
          <span className="text-gradient">Napmentiin</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl">
          Muuta verkkokauppasi älykkääksi myyntiassistentiksi, joka ymmärtää 
          asiakkaitasi ja kasvattaa myyntiäsi.
        </p>
      </motion.div>
      
      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="card p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-white/60">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
      
      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          onClick={nextStep}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Aloita käyttöönotto
        </Button>
        
        <p className="text-sm text-white/40 mt-4">
          Kestää vain 5 minuuttia • Ei luottokorttia tarvita
        </p>
      </motion.div>
    </div>
  );
}

