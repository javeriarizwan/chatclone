import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Loader2 } from 'lucide-react';

export const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { setPhoneNumber: setAuthPhone, sendVerificationCode, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    if (phoneNumber.length < 6) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }

    setAuthPhone(phoneNumber);

    try {
      await sendVerificationCode();
      toast({
        title: 'Verification code sent',
        description: `We've sent a verification code to ${phoneNumber}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-border/50">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-medium text-foreground font-jakarta">
            Welcome to ConnectPro
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Enter your phone number to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              id="phone"
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-11 px-4 text-foreground bg-background border-border focus:border-primary transition-colors text-center"
            />
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!phoneNumber.trim()}
            className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-medium rounded-lg transition-colors"
          >
            Continue
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We'll send you a verification code
          </p>
        </CardContent>
      </Card>
    </div>
  );
};