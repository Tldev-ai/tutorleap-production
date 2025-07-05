import { NextRequest, NextResponse } from 'next/server';
import { convertWithClaude, ConversionInput, validateConversionInput } from '@/lib/claude';

// Simple rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  
  // Reset if hour has passed
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 hour
    return true;
  }
  
  // Check if under limit (3 for free users)
  if (userLimit.count < 3) {
    userLimit.count++;
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request);
    
    console.log(`📥 Conversion request from IP: ${ip}`);

    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.log(`🚫 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. You have reached the maximum of 3 conversions per hour. Please upgrade to Pro for unlimited conversions.',
        rateLimited: true,
        upgradeUrl: '/pricing'
      }, { status: 429 });
    }

    // Parse and validate request body
    let body: ConversionInput;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format in request body',
        details: 'Please ensure you are sending valid JSON data'
      }, { status: 400 });
    }

    // Validate input fields
    const validationErrors = validateConversionInput(body);
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid required fields',
        validationErrors,
        receivedData: {
          fromBoard: !!body.fromBoard,
          toBoard: !!body.toBoard,
          subject: !!body.subject,
          grade: !!body.grade,
          topic: !!body.topic,
          content: !!body.content
        }
      }, { status: 400 });
    }

    const { fromBoard, toBoard, subject, grade, topic, content } = body;

    console.log(`🔄 Processing conversion:`, {
      conversion: `${fromBoard} → ${toBoard}`,
      subject: `${subject} ${grade}`,
      topic,
      contentLength: content.length
    });

    // Perform conversion using Claude API
    const result = await convertWithClaude(body);
    
    const processingTime = Date.now() - startTime;

    // Add performance metadata (create extended metadata)
    if (result.metadata) {
      const extendedResult = {
        ...result,
        metadata: {
          ...result.metadata,
          processingTimeMs: processingTime,
          apiVersion: '1.0',
          clientIp: ip.substring(0, 8) + '***' // Partial IP for privacy
        }
      };
      
      if (result.success) {
        console.log(`✅ Conversion successful in ${processingTime}ms:`, result.metadata.conversionId);
      } else {
        console.log(`⚠️ Conversion completed with fallback in ${processingTime}ms:`, result.error);
      }

      return NextResponse.json(extendedResult);
    }

    return NextResponse.json(result);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Conversion API Error after ${processingTime}ms:`, error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json({
          success: false,
          error: 'Service configuration error. Please contact support.',
          details: 'API configuration issue',
          supportEmail: 'support@tutorleap.in'
        }, { status: 500 });
      }

      if (error.message.includes('fetch')) {
        return NextResponse.json({
          success: false,
          error: 'Unable to connect to AI service. Please try again.',
          details: 'Network connectivity issue',
          retryAfter: 30
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again in a moment.',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS (useful for frontend testing)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://tutorleap.in',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

// Health check endpoint
export async function GET(request: NextRequest) {
  const apiKeyExists = !!process.env.ANTHROPIC_API_KEY;
  
  return NextResponse.json({
    status: 'healthy',
    service: 'TutorLeap Conversion API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeyConfigured: apiKeyExists,
    endpoints: {
      convert: 'POST /api/convert - Convert curriculum content',
      health: 'GET /api/convert - Check API health status'
    },
    rateLimit: {
      freeLimit: '3 conversions per hour',
      proLimit: 'Unlimited'
    }
  });
}