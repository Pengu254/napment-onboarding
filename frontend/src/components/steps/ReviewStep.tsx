/**
 * Review Step - Summary before deployment
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Check, Store, Palette, Bot, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

export function ReviewStep() {
  const { 
    selectedPlatform, 
    shopDomain, 
    shopName,
    brandConfig,
    agentConfig,
    nextStep, 
    prevStep 
  } = useOnboardingStore();
  
  const [isDeploying, setIsDeploying] = useState(false);
  
  const platformNames: Record<string, string> = {
    shopify: 'Shopify',
    woocommerce: 'WooCommerce',
    custom: 'Oma alusta',
  };
  
  const personaNames: Record<string, string> = {
    'friendly-helper': 'Ystävällinen avustaja',
    'professional-expert': 'Ammattilainen',
    'casual-buddy': 'Rento kaveri',
  };
  
  const templateNames: Record<string, string> = {
    'modern-dark': 'Moderni tumma',
    'clean-light': 'Puhdas vaalea',
    'elegant-luxury': 'Elegantti luksus',
  };
  
  const handleDeploy = async () => {
    setIsDeploying(true);
    
    try {
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      nextStep();
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };
  
  const summaryItems = [
    {
      icon: Globe,
      label: 'Alusta',
      value: platformNames[selectedPlatform || 'shopify'],
      detail: shopDomain,
    },
    {
      icon: Store,
      label: 'Kauppa',
      value: shopName || 'Ei nimeä',
    },
    {
      icon: Palette,
      label: 'Teema',
      value: templateNames[brandConfig?.template_id || 'modern-dark'],
    },
    {
      icon: Bot,
      label: 'AI-assistentti',
      value: personaNames[agentConfig?.persona_id || 'friendly-helper'],
    },
  ];
  
  return (
    <div className="py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Kaikki valmista! 🎉
        </h2>
        <p className="text-white/60">
          Tarkista asetukset ja käynnistä Napment kaupallesi.
        </p>
      </div>
      
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-8"
      >
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Yhteenveto
        </h3>
        
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-surface-900/50 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/60">{item.label}</p>
                <p className="font-medium">{item.value}</p>
                {item.detail && (
                  <p className="text-xs text-white/40">{item.detail}</p>
                )}
              </div>
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* What happens next */}
      <div className="text-center mb-8">
        <p className="text-sm text-white/60">
          Kun käynnistät Napmentin, AI-assistentti aktivoituu kaupallesi 
          ja alkaa auttaa asiakkaitasi välittömästi.
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={isDeploying}
          icon={<ArrowLeft className="w-5 h-5" />}
          iconPosition="left"
        >
          Takaisin
        </Button>
        
        <Button
          size="lg"
          onClick={handleDeploy}
          isLoading={isDeploying}
          icon={<Rocket className="w-5 h-5" />}
        >
          {isDeploying ? 'Käynnistetään...' : 'Käynnistä Napment'}
        </Button>
      </div>
    </div>
  );
}

