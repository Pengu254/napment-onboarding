/**
 * Agent Configuration Step
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Bot, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

const personas = [
  {
    id: 'friendly-helper',
    name: 'Ystävällinen avustaja',
    description: 'Lämmin ja avulias tyyli',
    traits: ['Ystävällinen', 'Kärsivällinen', 'Kannustava'],
    example: 'Hei! Miten voin auttaa sinua löytämään täydellisen tuotteen? 😊',
    emoji: '😊',
  },
  {
    id: 'professional-expert',
    name: 'Ammattilainen',
    description: 'Asiantunteva ja tehokas',
    traits: ['Asiantunteva', 'Tehokas', 'Asiallinen'],
    example: 'Tervetuloa! Kerro mitä etsit, niin löydän sinulle parhaat vaihtoehdot.',
    emoji: '👔',
  },
  {
    id: 'casual-buddy',
    name: 'Rento kaveri',
    description: 'Rento ja humoristinen',
    traits: ['Rento', 'Humoristinen', 'Helposti lähestyttävä'],
    example: 'Moro! Mitäs täältä tänään lähetään hakemaan? 🛒',
    emoji: '🤙',
  },
];

export function AgentConfigStep() {
  const { shopName, setAgentConfig, nextStep, prevStep } = useOnboardingStore();
  const [selectedPersona, setSelectedPersona] = useState(personas[0].id);
  
  const handleContinue = () => {
    const persona = personas.find(p => p.id === selectedPersona);
    if (persona) {
      setAgentConfig({
        persona_id: persona.id,
        greeting_message: persona.example,
        language: 'fi',
        features: {
          product_recommendations: true,
          order_tracking: true,
          cart_assistance: true,
        },
      });
      nextStep();
    }
  };
  
  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Valitse AI-assistentin tyyli
        </h2>
        <p className="text-white/60 max-w-xl mx-auto">
          Minkälainen tyyli sopii parhaiten {shopName || 'kaupallesi'}?
        </p>
      </div>
      
      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {personas.map((persona, index) => (
          <motion.button
            key={persona.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedPersona(persona.id)}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all duration-300
              ${selectedPersona === persona.id
                ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/20'
                : 'bg-surface-800/50 border-white/10 hover:border-white/20'
              }
            `}
          >
            {/* Selected Check */}
            {selectedPersona === persona.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            
            {/* Emoji */}
            <div className="text-4xl mb-4">{persona.emoji}</div>
            
            {/* Content */}
            <h3 className="font-semibold mb-1">{persona.name}</h3>
            <p className="text-sm text-white/60 mb-3">{persona.description}</p>
            
            {/* Traits */}
            <div className="flex flex-wrap gap-1 mb-4">
              {persona.traits.map(trait => (
                <span 
                  key={trait}
                  className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-white/70"
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium">Esikatselu</span>
        </div>
        
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm">
                {personas.find(p => p.id === selectedPersona)?.example}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          icon={<ArrowLeft className="w-5 h-5" />}
          iconPosition="left"
        >
          Takaisin
        </Button>
        
        <Button
          onClick={handleContinue}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Jatka
        </Button>
      </div>
    </div>
  );
}

