import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500); // Show button after 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-elegant p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <div className="text-2xl">💬</div>
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground mb-2 font-jakarta">
          Welcome to ConnectPro
        </h1>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Connect with friends and family through secure, instant messaging
        </p>
        
        {showButton ? (
          <div className="space-y-4 animate-fade-in">
            <Button 
              onClick={handleContinue}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary-dark transition-all duration-200 font-medium py-3 rounded-lg"
            >
              Agree and Continue
            </Button>
            
            <p className="text-muted-foreground text-xs">
              By continuing, you agree to our Terms and Privacy Policy
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};