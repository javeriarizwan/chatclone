import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types/chat';
import { addContact, createConversation } from '@/data/mockData';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddContactDialogProps {
  onContactAdded: (conversation: any) => void;
}

export const AddContactDialog = ({ onContactAdded }: AddContactDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { toast } = useToast();

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both name and phone number',
        variant: 'destructive',
      });
      return;
    }

    // Create new contact
    const newContact: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      isOnline: Math.random() > 0.5, // Random online status
      lastSeen: new Date(),
    };

    // Add to contacts
    addContact(newContact);

    // Create conversation
    const conversation = createConversation(newContact);

    // Notify parent
    onContactAdded(conversation);

    // Show success message
    toast({
      title: 'Contact added!',
      description: `${name} has been added to your contacts`,
    });

    // Reset form and close dialog
    setName('');
    setPhone('');
    setIsOpen(false);
  };

  const formatPhoneDisplay = (phone: string) => {
    if (phone.startsWith('+')) return phone;
    return `+${phone}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full h-12 w-12 p-0 shadow-lg"
          title="Add new contact"
        >
          <UserPlus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Preview Avatar */}
          {name && (
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto bg-primary text-primary-foreground">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name"
              autoFocus
            />
          </div>
          
          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter phone number (e.g., 923184290887)"
              type="tel"
            />
            {phone && (
              <p className="text-xs text-muted-foreground">
                Will be saved as: {formatPhoneDisplay(phone)}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground"
              onClick={handleAddContact}
              disabled={!name.trim() || !phone.trim()}
            >
              Add Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};