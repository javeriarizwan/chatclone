import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const VerificationCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { 
    phoneNumber, 
    setVerificationCode, 
    verifyCode, 
    isLoading, 
    setStep,
    sendVerificationCode 
  } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Update verification code in auth context
    setVerificationCode(code.join(''));
  }, [code]); // Removed setVerificationCode from dependencies to prevent infinite loop

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedText.length === 6) {
      const newCode = pastedText.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code.join('');
    
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter the complete 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    try {
      await verifyCode(verificationCode); // Pass the code directly
      toast({
        title: 'Phone verified!',
        description: 'Your phone number has been successfully verified',
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    try {
      await sendVerificationCode();
      toast({
        title: 'Code resent',
        description: 'A new verification code has been sent to your phone',
      });
      // Clear current code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+1')) {
      const digits = phone.slice(2);
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-border/50">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="text-xl">🔐</div>
          </div>
          <CardTitle className="text-xl font-medium text-foreground font-jakarta">
            Enter verification code
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            We sent a code to {phoneNumber}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-11 text-center text-base border-border font-mono"
              />
            ))}
          </div>
          
          <Button 
            onClick={() => handleVerify()}
            disabled={isLoading || code.some(digit => digit === '')}
            className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-medium rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground text-sm p-0"
            >
              Resend code
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center bg-secondary/50 rounded-lg p-3">
            <strong>Demo Mode:</strong> Enter any 6 digits to continue
          </p>
        </CardContent>
      </Card>
    </div>
  );
};