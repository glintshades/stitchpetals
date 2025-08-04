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
  const [cardData, setCardData] = useState({
    number: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
    zip: ''
  });
  const { toast } = useToast();

  // Load Clover configuration
  useEffect(() => {
    const loadCloverConfig = async () => {
      try {
        const response = await fetch('/api/payment/clover-config');
        if (!response.ok) throw new Error('Failed to load payment configuration');
        
        const config = await response.json();
        setCloverConfig(config);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Clover config:', error);
        setIsLoading(false);
        onPaymentError('Failed to initialize payment system');
      }
    };

    loadCloverConfig();
  }, []);

  const createCardToken = async () => {
    try {
      // Basic validation
      if (!cardData.number || !cardData.exp_month || !cardData.exp_year || !cardData.cvv) {
        throw new Error('Please fill in all required card fields');
      }

      // Create card token on server
      const response = await fetch('/api/payment/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Card tokenization failed');
      }

      const tokenResult = await response.json();
      return tokenResult.id; // Return the token ID
    } catch (error) {
      console.error('Tokenization error:', error);
      throw error;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create card token
      const token = await createCardToken();
      setPaymentToken(token);
      processPayment(token);
    } catch (error: any) {
      onPaymentError(error.message || 'Payment failed');
    }
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
              <Input
                id="card-number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\s/g, '')})}
                className="bg-white"
                maxLength={16}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="exp-month">Month</Label>
                <Input
                  id="exp-month"
                  type="text"
                  placeholder="MM"
                  value={cardData.exp_month}
                  onChange={(e) => setCardData({...cardData, exp_month: e.target.value})}
                  className="bg-white"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="exp-year">Year</Label>
                <Input
                  id="exp-year"
                  type="text"
                  placeholder="YY"
                  value={cardData.exp_year}
                  onChange={(e) => setCardData({...cardData, exp_year: e.target.value})}
                  className="bg-white"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  className="bg-white"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zip">Postal Code</Label>
              <Input
                id="zip"
                type="text"
                placeholder="12345"
                value={cardData.zip}
                onChange={(e) => setCardData({...cardData, zip: e.target.value})}
                className="bg-white"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold text-wine">${amount.toFixed(2)}</span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full text-white font-semibold" 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: '2px solid #1d4ed8'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
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
