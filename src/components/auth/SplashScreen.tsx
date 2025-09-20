import { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-glow relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/15 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="text-center relative z-10 px-8">
        {/* App Logo/Icon */}
        <div className="mb-8 animate-bounce-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
            <div className="text-4xl">💬</div>
          </div>
        </div>

        {/* App Name */}
        <div className="animate-slide-up">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            ConnectPro
          </h1>
          <p className="text-xl text-white/80 mb-8 font-light">
            Professional Communication Platform
          </p>
        </div>

        {/* Loading Animation */}
        <div className="animate-fade-in">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-white/60 mt-4 text-sm font-medium tracking-wide">
            Initializing secure connection...
          </p>
        </div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};