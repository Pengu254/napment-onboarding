/**
 * Platform Selection Step
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, ShoppingBag, Globe, Code } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Platform } from '../../types';

const platforms: Array<{
  id: Platform;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  supported: boolean;
  popular?: boolean;
}> = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Maailman suosituin verkkokauppa-alusta',
    icon: ShoppingBag,
    supported: true,
    popular: true,
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'WordPress-pohjainen verkkokauppa',
    icon: Globe,
    supported: true,
  },
  {
    id: 'custom',
    name: 'Oma alusta',
    description: 'Räätälöity API-integraatio',
    icon: Code,
    supported: true,
  },
];

export function PlatformSelectStep() {
  const { selectedPlatform, setPlatform, nextStep, prevStep } = useOnboardingStore();
  
  const handleSelect = (platform: Platform) => {
    setPlatform(platform);
  };
  
  const handleContinue = () => {
    if (selectedPlatform) {
      nextStep();
    }
  };
  
  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Mikä verkkokauppa-alusta sinulla on?
        </h2>
        <p className="text-white/60 max-w-xl mx-auto">
          Valitse alusta, jonka haluat yhdistää Napmentiin. 
          Tuemme suosituimpia verkkokauppa-alustoja.
        </p>
      </div>
      
      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {platforms.map((platform, index) => (
          <motion.button
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(platform.id)}
            disabled={!platform.supported}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all duration-300
              ${selectedPlatform === platform.id
                ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/20'
                : 'bg-surface-800/50 border-white/10 hover:border-white/20'
              }
              ${!platform.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Popular Badge */}
            {platform.popular && (
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-medium">
                Suosituin
              </div>
            )}
            
            {/* Selected Check */}
            {selectedPlatform === platform.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            {/* Icon */}
            <div className={`
              w-14 h-14 rounded-xl flex items-center justify-center mb-4
              ${selectedPlatform === platform.id
                ? 'bg-primary-500/20'
                : 'bg-white/5'
              }
            `}>
              <platform.icon className={`
                w-7 h-7
                ${selectedPlatform === platform.id ? 'text-primary-400' : 'text-white/60'}
              `} />
            </div>
            
            {/* Content */}
            <h3 className="text-lg font-semibold mb-1">{platform.name}</h3>
            <p className="text-sm text-white/60">{platform.description}</p>
            
            {!platform.supported && (
              <span className="text-xs text-accent-400 mt-2 block">Tulossa pian</span>
            )}
          </motion.button>
        ))}
      </div>
      
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
          disabled={!selectedPlatform}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Jatka
        </Button>
      </div>
    </div>
  );
}

