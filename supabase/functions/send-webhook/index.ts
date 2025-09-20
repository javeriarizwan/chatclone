import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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

interface AIAgentResponse {
  type: 'text' | 'audio';
  content: string; // For audio, this will be base64 encoded
  duration?: number; // For audio messages
  recipientId: string;
  conversationId: string;
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Send the payload to the configured webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Clone-Webhook/1.0',
      },
      body: JSON.stringify({
        event: 'message_sent',
        data: payload,
        timestamp: new Date().toISOString(),
      }),
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

    // Parse the webhook response to check for AI agent responses
    let responseData;
    try {
      const responseText = await webhookResponse.text();
      console.log('Webhook response received:', responseText);
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.log('Webhook response is not JSON, treating as success');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook sent successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if the response contains an AI agent response
    if (responseData && responseData.aiResponse) {
      const aiResponse: AIAgentResponse = responseData.aiResponse;
      console.log('Processing AI agent response:', aiResponse);
      
      // Create a new message from the AI agent
      const aiMessageId = `ai-msg-${Date.now()}`;
      
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          id: aiMessageId,
          conversation_id: aiResponse.conversationId,
          sender_id: 'ai-agent', // Use a special ID for AI agent
          sender_name: 'AI Assistant',
          type: aiResponse.type,
          content: aiResponse.content,
          status: 'delivered',
          ...(aiResponse.duration && { duration: aiResponse.duration }),
        });

      if (insertError) {
        console.error('Error saving AI response message:', insertError);
      } else {
        console.log('AI response message saved successfully:', aiMessageId);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook sent successfully',
      webhookResponse: responseData || 'Success' 
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