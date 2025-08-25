import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(request: NextRequest): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max 100 requests per 15 minutes

  const key = `rate_limit:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

function validateInput(body: any): boolean {
  // Basic validation - ensure it's a proper object
  if (!body || typeof body !== 'object') {
    return false;
  }
  
  // Add more validation as needed
  return true;
}

async function makeBackendRequest(path: string, method: string, body?: any, clientHeaders?: Headers) {
  const backendUrl = `http://bonobo-backend.railway.internal/api/v1/${path}`;
  
  console.log(`[API Proxy] ${method} ${path}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Forward X-API-Key header if present in client request
  const apiKey = clientHeaders?.get('x-api-key');
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    console.log(`[API Proxy] Forwarding API key for ${method} ${path}`);
  }
  
  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(backendUrl, options);
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[API Proxy] Error calling backend:`, error);
    throw error;
  }
}

// Handle POST requests
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Rate limiting
    if (!rateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get the API path
    const path = params.path.join('/');
    
    // Parse request body
    const body = await request.json();
    
    // Validate input
    if (!validateInput(body)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Proxy to backend
    const result = await makeBackendRequest(path, 'POST', body, request.headers);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[API Proxy] POST error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Rate limiting
    if (!rateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get the API path
    const path = params.path.join('/');
    
    // Proxy to backend
    const result = await makeBackendRequest(path, 'GET', undefined, request.headers);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[API Proxy] GET error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
