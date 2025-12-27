/**
 * Platform Connect Step - OAuth connection
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

export function PlatformConnectStep() {
  const { 
    selectedPlatform, 
    shopDomain, 
    setShopDomain,
    isConnected,
    setConnected,
    nextStep, 
    prevStep 
  } = useOnboardingStore();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const platformNames: Record<string, string> = {
    shopify: 'Shopify',
    woocommerce: 'WooCommerce',
    custom: 'Oma alusta',
  };
  
  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      setError('Anna kauppasi domain');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Simulate OAuth connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would redirect to OAuth flow
      setConnected(true, 'mock-access-token');
    } catch (err) {
      setError('Yhdistäminen epäonnistui. Yritä uudelleen.');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleContinue = () => {
    if (isConnected) {
      nextStep();
    }
  };
  
  return (
    <div className="py-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Yhdistä {platformNames[selectedPlatform || 'shopify']}
        </h2>
        <p className="text-white/60">
          Anna kauppasi domain ja yhdistä se Napmentiin turvallisesti.
        </p>
      </div>
      
      {/* Connection Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 mb-8"
      >
        {!isConnected ? (
          <>
            {/* Domain Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Kauppasi domain
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  placeholder={selectedPlatform === 'shopify' ? 'myymala.myshopify.com' : 'www.myymala.fi'}
                  className="input flex-1"
                />
              </div>
              {selectedPlatform === 'shopify' && (
                <p className="text-xs text-white/40 mt-2">
                  Löydät tämän Shopify-administa: Asetukset → Domains
                </p>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {/* Connect Button */}
            <Button
              className="w-full"
              onClick={handleConnect}
              isLoading={isConnecting}
              icon={<ExternalLink className="w-4 h-4" />}
            >
              {isConnecting ? 'Yhdistetään...' : `Yhdistä ${platformNames[selectedPlatform || 'shopify']}`}
            </Button>
            
            {/* Security Note */}
            <p className="text-xs text-white/40 text-center mt-4">
              🔒 Turvallinen OAuth-yhteys. Emme tallenna salasanaasi.
            </p>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </motion.div>
            
            <h3 className="text-xl font-semibold mb-2">Yhdistetty!</h3>
            <p className="text-white/60">
              <span className="text-white">{shopDomain}</span> on nyt yhdistetty Napmentiin.
            </p>
          </div>
        )}
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
          disabled={!isConnected}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Jatka
        </Button>
      </div>
    </div>
  );
}

