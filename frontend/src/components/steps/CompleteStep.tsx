/**
 * Complete Step - Success celebration
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, ExternalLink, Copy, Check, BookOpen, Headphones } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

export function CompleteStep() {
  const { shopDomain, shopName, reset } = useOnboardingStore();
  const [copied, setCopied] = useState(false);
  
  const storefrontUrl = `https://${shopDomain?.replace('.myshopify.com', '')}.bobbi.live`;
  const adminUrl = 'https://admin.bobbi.live';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const nextSteps = [
    {
      icon: ExternalLink,
      title: 'Testaa storefrontia',
      description: 'Kokeile miltä AI-assistentti näyttää asiakkaillesi',
      action: () => window.open(storefrontUrl, '_blank'),
      buttonText: 'Avaa storefront',
    },
    {
      icon: BookOpen,
      title: 'Lue dokumentaatio',
      description: 'Opi kaikki Napmentin ominaisuudet',
      action: () => window.open('https://docs.napment.com', '_blank'),
      buttonText: 'Dokumentaatio',
    },
    {
      icon: Headphones,
      title: 'Tarvitsetko apua?',
      description: 'Tiimimme auttaa mielellään',
      action: () => window.open('mailto:support@napment.com', '_blank'),
      buttonText: 'Ota yhteyttä',
    },
  ];
  
  return (
    <div className="py-8 text-center">
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, delay: 0.2 }}
        className="mb-8"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-6">
          <PartyPopper className="w-12 h-12 text-primary-400" />
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Onnittelut! 🎉
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-white/60 max-w-lg mx-auto"
        >
          <span className="text-white font-medium">{shopName || 'Kauppasi'}</span> on nyt 
          yhdistetty Napmentiin. AI-assistenttisi on valmis palvelemaan asiakkaitasi!
        </motion.p>
      </motion.div>
      
      {/* Storefront URL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-md mx-auto mb-10"
      >
        <p className="text-sm text-white/60 mb-2">Storefrontisi osoite:</p>
        <div className="flex items-center gap-2 p-3 bg-surface-800 rounded-xl border border-white/10">
          <span className="flex-1 text-left text-primary-400 font-mono text-sm truncate">
            {storefrontUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-white/60" />
            )}
          </button>
        </div>
      </motion.div>
      
      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-3xl mx-auto mb-10"
      >
        <h3 className="font-semibold mb-6">Seuraavat askeleet</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="card p-5 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-3">
                <step.icon className="w-5 h-5 text-primary-400" />
              </div>
              <h4 className="font-medium mb-1">{step.title}</h4>
              <p className="text-sm text-white/60 mb-4">{step.description}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={step.action}
                className="w-full"
              >
                {step.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Admin Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <Button
          size="lg"
          onClick={() => window.open(adminUrl, '_blank')}
          icon={<ExternalLink className="w-5 h-5" />}
        >
          Siirry hallintapaneeliin
        </Button>
        
        <p className="text-xs text-white/40 mt-4">
          Voit aina palata onboardingiin aloittamalla alusta
        </p>
        
        <button
          onClick={reset}
          className="text-xs text-white/40 hover:text-white/60 underline mt-2"
        >
          Aloita alusta
        </button>
      </motion.div>
    </div>
  );
}

