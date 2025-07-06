// src/app/api/convert/route.ts - Fixed imports
import { NextRequest, NextResponse } from 'next/server';
import { convertWithDetailedClaude, ConversionInput, validateConversionInput } from '@/lib/claude';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (remoteAddr) return remoteAddr;
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }
  
  if (userLimit.count < 5) {
    userLimit.count++;
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const ip = getClientIP(request);
    console.log(`📥 Detailed conversion request from IP: ${ip}`);

    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.log(`🚫 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. You have reached the maximum of 5 detailed conversions per hour.',
        rateLimited: true
      }, { status: 429 });
    }

    // Parse request body
    let body: ConversionInput;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Invalid JSON in request body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format in request body'
      }, { status: 400 });
    }

    // Validate input
    const validationErrors = validateConversionInput(body);
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid required fields',
        validationErrors
      }, { status: 400 });
    }

    const { fromBoard, toBoard, subject, grade, topic, content } = body;

    console.log(`🔄 Processing detailed conversion:`, {
      conversion: `${fromBoard} → ${toBoard}`,
      subject: `${subject} ${grade}`,
      topic,
      contentLength: content.length
    });

    // Perform detailed conversion
    const result = await convertWithDetailedClaude(body);
    
    const processingTime = Date.now() - startTime;

    // Add performance metadata
    const extendedResult = {
      ...result,
      metadata: {
        ...result.metadata,
        processingTimeMs: processingTime,
        apiVersion: '2.0',
        clientIp: ip.substring(0, 8) + '***'
      }
    };
    
    if (result.success) {
      console.log(`✅ Detailed conversion successful in ${processingTime}ms:`, result.metadata.conversionId);
    } else {
      console.log(`⚠️ Conversion with fallback in ${processingTime}ms:`, result.error);
    }

    return NextResponse.json(extendedResult);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ API Error after ${processingTime}ms:`, error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'TutorLeap Detailed Conversion API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
}