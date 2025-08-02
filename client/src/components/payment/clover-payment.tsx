import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock } from 'lucide-react';

interface CloverPaymentProps {
  amount: number; // amount in dollars
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  isProcessing?: boolean;
}

declare global {
  interface Window {
    clover?: any;
  }
}

export function CloverPayment({ amount, onPaymentSuccess, onPaymentError, isProcessing = false }: CloverPaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [cloverConfig, setCloverConfig] = useState<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load Clover configuration and SDK
  useEffect(() => {
    const loadCloverConfig = async () => {
      try {
        const response = await fetch('/api/payment/clover-config');
        if (!response.ok) throw new Error('Failed to load payment configuration');
        
        const config = await response.json();
        setCloverConfig(config);
        
        // Load Clover SDK
        const script = document.createElement('script');
        script.src = config.environment === 'sandbox' 
          ? 'https://checkout.sandbox.dev.clover.com/sdk.js'
          : 'https://checkout.clover.com/sdk.js';
        script.async = true;
        script.onload = () => initializeClover(config);
        script.onerror = () => {
          setIsLoading(false);
          onPaymentError('Failed to load payment system');
        };
        document.head.appendChild(script);

        return () => {
          document.head.removeChild(script);
        };
      } catch (error) {
        console.error('Error loading Clover config:', error);
        setIsLoading(false);
        onPaymentError('Failed to initialize payment system');
      }
    };

    loadCloverConfig();
  }, []);

  const initializeClover = (config: any) => {
    if (!window.clover || !iframeRef.current) {
      setIsLoading(false);
      onPaymentError('Payment system not available');
      return;
    }

    try {
      const cloverInstance = new window.clover.Clover({
        environment: config.environment,
        publicToken: config.publicToken,
        elements: {
          form: {
            onTokenCreated: (token: string) => {
              setPaymentToken(token);
              processPayment(token);
            },
            onError: (error: any) => {
              console.error('Clover payment error:', error);
              onPaymentError(error.message || 'Payment failed');
            }
          }
        }
      });

      // Create payment form elements
      const cardNumber = cloverInstance.elements.create('CARD_NUMBER');
      const cardDate = cloverInstance.elements.create('CARD_DATE');
      const cardCvv = cloverInstance.elements.create('CARD_CVV');
      const cardPostalCode = cloverInstance.elements.create('CARD_POSTAL_CODE');

      // Mount elements to DOM
      cardNumber.mount('#card-number');
      cardDate.mount('#card-date');
      cardCvv.mount('#card-cvv');
      cardPostalCode.mount('#card-postal-code');

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Clover:', error);
      setIsLoading(false);
      onPaymentError('Failed to initialize payment form');
    }
  };

  const processPayment = async (token: string) => {
    try {
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentToken: token,
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'USD',
          description: `Order payment - $${amount.toFixed(2)}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment processing failed');
      }

      const paymentResult = await response.json();
      onPaymentSuccess(paymentResult);
      
      toast({
        title: 'Payment Successful',
        description: `Payment of $${amount.toFixed(2)} processed successfully`,
      });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      onPaymentError(error.message || 'Payment failed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.clover) {
      onPaymentError('Payment system not ready');
      return;
    }

    // Trigger tokenization
    window.clover.createToken();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wine"></div>
            <span>Loading secure payment form...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Lock className="h-4 w-4" />
          Secure payment powered by Clover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <div 
                id="card-number" 
                className="border rounded-md p-3 min-h-[40px] bg-white"
                ref={iframeRef}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-date">Expiry Date</Label>
                <div id="card-date" className="border rounded-md p-3 min-h-[40px] bg-white" />
              </div>
              <div>
                <Label htmlFor="card-cvv">CVV</Label>
                <div id="card-cvv" className="border rounded-md p-3 min-h-[40px] bg-white" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="card-postal-code">Postal Code</Label>
              <div id="card-postal-code" className="border rounded-md p-3 min-h-[40px] bg-white" />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold text-wine">${amount.toFixed(2)}</span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-wine hover:bg-dark-wine" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-gray-500 mt-4 text-center">
          Your payment information is encrypted and secure. We never store your card details.
        </div>
      </CardContent>
    </Card>
  );
}
