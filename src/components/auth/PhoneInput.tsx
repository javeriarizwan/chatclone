import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const PhoneInput = () => {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { setPhoneNumber: setAuthPhone, sendVerificationCode, isLoading } = useAuth();
  const { toast } = useToast();

  const countries = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  ];

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

    const fullPhoneNumber = countryCode + phoneNumber;
    setAuthPhone(fullPhoneNumber);

    try {
      await sendVerificationCode();
      toast({
        title: 'Verification code sent',
        description: `We've sent a verification code to ${fullPhoneNumber}`,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <h1 className="text-2xl font-semibold">Welcome to WhatsApp</h1>
        <p className="text-primary-foreground/80 mt-2">
          Read our Privacy Policy. Tap "Agree and continue" to accept the Terms of Service.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Verify your phone number
            </h2>
            <p className="text-muted-foreground">
              WhatsApp will need to verify your phone number. What's your number?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Country
              </label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-3">
                        <span>{country.flag}</span>
                        <span>{country.country}</span>
                        <span className="text-muted-foreground">{country.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone number
              </label>
              <div className="flex gap-3">
                <div className="flex items-center bg-muted rounded-md px-3 py-2 text-sm">
                  {countryCode}
                </div>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your phone number"
                  className="flex-1"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Carrier charges notice */}
            <p className="text-xs text-muted-foreground text-center">
              Carrier charges may apply
            </p>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending code...
                </>
              ) : (
                'Next'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          By tapping Next, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};