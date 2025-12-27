/**
 * Brand Configuration Step
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Palette } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

const templates = [
  {
    id: 'modern-dark',
    name: 'Moderni tumma',
    description: 'Tyylikäs tumma teema',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      background: '#0F0F0F',
      surface: '#1A1A1A',
    },
  },
  {
    id: 'clean-light',
    name: 'Puhdas vaalea',
    description: 'Minimalistinen vaalea',
    colors: {
      primary: '#2563EB',
      secondary: '#10B981',
      background: '#FFFFFF',
      surface: '#F3F4F6',
    },
  },
  {
    id: 'elegant-luxury',
    name: 'Elegantti luksus',
    description: 'Ylellinen kulta-musta',
    colors: {
      primary: '#D4AF37',
      secondary: '#C0C0C0',
      background: '#0A0A0A',
      surface: '#1F1F1F',
    },
  },
];

export function BrandConfigStep() {
  const { shopName, setShopName, setBrandConfig, nextStep, prevStep } = useOnboardingStore();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  
  const handleContinue = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      setBrandConfig({
        template_id: template.id,
        colors: template.colors,
        store_name: shopName || 'Kauppani',
      });
      nextStep();
    }
  };
  
  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Mukauta brändisi
        </h2>
        <p className="text-white/60 max-w-xl mx-auto">
          Valitse teema ja anna kauppasi nimi. Voit muokata näitä myöhemmin.
        </p>
      </div>
      
      {/* Store Name */}
      <div className="max-w-md mx-auto mb-10">
        <label className="block text-sm font-medium mb-2">
          Kauppasi nimi
        </label>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Esim. Muotikauppa Helsinki"
          className="input"
        />
      </div>
      
      {/* Template Selection */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary-400" />
          <span className="font-medium">Valitse teema</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedTemplate(template.id)}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all duration-300
                ${selectedTemplate === template.id
                  ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                  : 'border-white/10 hover:border-white/20'
                }
              `}
              style={{ backgroundColor: template.colors.surface }}
            >
              {/* Selected Check */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Color Preview */}
              <div className="flex gap-2 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: template.colors.primary }}
                />
                <div 
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: template.colors.secondary }}
                />
              </div>
              
              {/* Content */}
              <h3 
                className="font-semibold mb-1"
                style={{ color: template.colors.background === '#FFFFFF' ? '#1F2937' : '#F4F4F5' }}
              >
                {template.name}
              </h3>
              <p 
                className="text-sm"
                style={{ color: template.colors.background === '#FFFFFF' ? '#6B7280' : '#A1A1AA' }}
              >
                {template.description}
              </p>
            </motion.button>
          ))}
        </div>
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
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Jatka
        </Button>
      </div>
    </div>
  );
}

