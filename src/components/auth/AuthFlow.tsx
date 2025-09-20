import { useAuth } from '@/contexts/AuthContext';
import { PhoneInput } from './PhoneInput';
import { VerificationCode } from './VerificationCode';
import { ProfileSetup } from './ProfileSetup';

export const AuthFlow = () => {
  const { step } = useAuth();

  switch (step) {
    case 'phone':
      return <PhoneInput />;
    case 'verification':
      return <VerificationCode />;
    case 'profile':
      return <ProfileSetup />;
    default:
      return <PhoneInput />;
  }
};