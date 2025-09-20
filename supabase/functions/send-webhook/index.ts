import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  messageType: 'text' | 'audio';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  duration?: number; // For audio messages
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: WebhookPayload = await req.json();
    
    console.log('Webhook payload received:', payload);

    // Get the webhook URL from environment variables
    const webhookUrl = Deno.env.get('WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('WEBHOOK_URL environment variable not set');
      return new Response(JSON.stringify({ error: 'Webhook URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create URL with query parameters for GET request
    const url = new URL(webhookUrl);
    
    // Add all payload data as query parameters
    url.searchParams.append('event', 'message_sent');
    url.searchParams.append('messageId', payload.messageId);
    url.searchParams.append('conversationId', payload.conversationId);
    url.searchParams.append('senderId', payload.senderId);
    url.searchParams.append('senderName', payload.senderName);
    url.searchParams.append('recipientId', payload.recipientId);
    url.searchParams.append('recipientName', payload.recipientName);
    url.searchParams.append('messageType', payload.messageType);
    url.searchParams.append('content', payload.content);
    url.searchParams.append('timestamp', payload.timestamp);
    url.searchParams.append('status', payload.status);
    if (payload.duration) {
      url.searchParams.append('duration', payload.duration.toString());
    }

    // Send GET request to the configured webhook
    const webhookResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'WhatsApp-Clone-Webhook/1.0',
      },
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook request failed:', webhookResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: 'Webhook request failed', 
        status: webhookResponse.status,
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await webhookResponse.text();
    console.log('Webhook sent successfully:', responseData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook sent successfully',
      webhookResponse: responseData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-webhook function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});