import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if request has a body
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ 
        error: 'Content-Type must be application/json' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request body text first
    const bodyText = await req.text();
    if (!bodyText || bodyText.trim() === '') {
      return new Response(JSON.stringify({ 
        error: 'Request body is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON
    let requestData;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      conversationId, 
      senderId, 
      senderName, 
      content, 
      type = 'text',
      duration 
    } = requestData;

    // Validate required fields
    if (!conversationId || !senderId || !senderName || !content) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: conversationId, senderId, senderName, content' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create message object
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId,
      senderName,
      type,
      content,
      status: 'sent',
      createdAt: new Date().toISOString(),
      ...(duration && { duration }),
    };

    console.log('Message received via HTTP:', message);

    // In a real implementation, you would store this in your database
    // For now, we'll just log it and return success
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: message.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-message function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});