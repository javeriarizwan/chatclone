import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-4 flex items-center gap-4 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('phone')}
          className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Verify phone number</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Enter verification code
            </h2>
            <p className="text-muted-foreground mb-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-foreground">
              {formatPhoneNumber(phoneNumber)}
            </p>
          </div>

          {/* Code Input */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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
                className="w-12 h-12 text-center text-lg font-semibold"
              />
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => handleVerify()}
              disabled={isLoading || code.some(digit => digit === '')}
              className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground py-3 shadow-lg transition-all duration-300"
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
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-primary hover:text-primary-dark"
              >
                Resend code
              </Button>
            </div>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <strong>⚡ Demo Mode:</strong> This is a demo app! Since we don't have SMS service connected, 
            <strong> enter any 6 digits</strong> (like 123456) to continue. Real SMS verification will work when you connect Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};