-- Add UPDATE policy for messages to allow status updates
CREATE POLICY "Anyone can update message status" 
ON public.messages 
FOR UPDATE 
USING (true);