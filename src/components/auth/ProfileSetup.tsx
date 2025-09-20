import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';

export const ProfileSetup = () => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const { completeProfile, isLoading, setStep } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name to continue',
        variant: 'destructive',
      });
      return;
    }

    if (name.trim().length < 2) {
      toast({
        title: 'Invalid name',
        description: 'Please enter a valid name (at least 2 characters)',
        variant: 'destructive',
      });
      return;
    }

    try {
      await completeProfile(name.trim(), avatar);
      toast({
        title: 'Profile completed!',
        description: 'Welcome to WhatsApp! You can now start messaging.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const generateAvatar = () => {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}`;
    setAvatar(avatarUrl);
  };

  const handleAvatarClick = () => {
    // In a real app, this would open image picker
    toast({
      title: 'Avatar generation',
      description: 'For demo purposes, we\'ll generate a random avatar for you!',
    });
    generateAvatar();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('verification')}
          className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Profile info</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Profile info
            </h2>
            <p className="text-muted-foreground">
              Please provide your name and an optional profile photo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage 
                    src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}`} 
                  />
                  <AvatarFallback className="text-2xl">
                    {name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '👤'}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 rounded-full h-12 w-12 p-0 bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-3">
                Tap to add profile photo
              </p>
            </div>

            {/* Name Input */}
            <div>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="text-center text-lg py-6"
                maxLength={25}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                This is not your username or PIN. This name will be visible to your WhatsApp contacts.
              </p>
            </div>

            {/* Character count */}
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                {name.length}/25
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating profile...
                </>
              ) : (
                'Done'
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              People who have your phone number in their address book will see this information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};