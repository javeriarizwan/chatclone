import { useAuth } from '@/contexts/AuthContext';
import { SplashScreen } from './SplashScreen';
import { PhoneInput } from './PhoneInput';
import { VerificationCode } from './VerificationCode';
import { ProfileSetup } from './ProfileSetup';

export const AuthFlow = () => {
  const { step, setStep } = useAuth();

  const handleSplashComplete = () => {
    setStep('phone');
  };

  switch (step) {
    case 'splash':
      return <SplashScreen onComplete={handleSplashComplete} />;
    case 'phone':
      return <PhoneInput />;
    case 'verification':
      return <VerificationCode />;
    case 'profile':
      return <ProfileSetup />;
    default:
      return <SplashScreen onComplete={handleSplashComplete} />;
  }
};