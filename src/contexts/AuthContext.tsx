import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  setPhoneNumber: (phone: string) => void;
  setVerificationCode: (code: string) => void;
  sendVerificationCode: () => Promise<void>;
  verifyCode: (codeToVerify?: string) => Promise<void>;
  completeProfile: (name: string, avatar?: string) => Promise<void>;
  logout: () => void;
  setStep: (step: AuthState['step']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    step: 'phone',
    phoneNumber: '',
    verificationCode: '',
  });

  const setPhoneNumber = (phone: string) => {
    setAuthState(prev => ({ ...prev, phoneNumber: phone }));
  };

  const setVerificationCode = (code: string) => {
    setAuthState(prev => ({ ...prev, verificationCode: code }));
  };

  const sendVerificationCode = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: false, 
      step: 'verification' 
    }));
  };

  const verifyCode = async (codeToVerify?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use the provided code or the current state
    const verificationCode = codeToVerify || authState.verificationCode;
    
    // For demo, accept any 6-digit code
    if (verificationCode.length === 6) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        step: 'profile' 
      }));
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid verification code');
    }
  };

  const completeProfile = async (name: string, avatar?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate profile creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: AuthUser = {
      id: 'user-' + Date.now(),
      name,
      phone: authState.phoneNumber,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      isVerified: true,
    };
    
    setAuthState(prev => ({ 
      ...prev, 
      user,
      isLoading: false, 
      step: 'complete' 
    }));
  };

  const logout = () => {
    setAuthState({
      user: null,
      isLoading: false,
      step: 'phone',
      phoneNumber: '',
      verificationCode: '',
    });
  };

  const setStep = (step: AuthState['step']) => {
    setAuthState(prev => ({ ...prev, step }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setPhoneNumber,
        setVerificationCode,
        sendVerificationCode,
        verifyCode,
        completeProfile,
        logout,
        setStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};