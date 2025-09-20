export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  step: 'phone' | 'verification' | 'profile' | 'complete';
  phoneNumber: string;
  verificationCode: string;
}