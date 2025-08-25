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

function normalizeBaseUrl(base: string): string {
  if (!base) return base
  return base.endsWith('/') ? base.slice(0, -1) : base
}

async function makeBackendRequest(request: NextRequest, path: string, method: string, body?: any) {
  // Use internal URL in production, public URL in development
  // Remove the /api/v1/ prefix from path if it exists, since we add it below
  const cleanPath = path.replace(/^api\/v1\//, '');
  // Use only public URL; allow UI override header
  const overrideBase = request.headers.get('x-backend-base-url') || ''
  const resolvedBase = overrideBase && /^https?:\/\//.test(overrideBase)
    ? overrideBase
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001')

  const base = normalizeBaseUrl(resolvedBase)
  const search = request.nextUrl?.search || ''
  const backendUrl = `${base}/api/v1/${cleanPath}${search}`

  console.log(`[Backend-Tester API Proxy] ${method} ${path} → ${backendUrl}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Always include API key for backend requests
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    console.log(`[Backend-Tester API Proxy] Using API key for ${method} ${path}`);
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

    // Parse JSON response directly
    try {
      return await response.json();
    } catch (jsonError) {
      console.error(`[Backend-Tester API Proxy] JSON parse error:`, jsonError);
      const parseMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
      return {
        error: 'Invalid JSON response from backend',
        parseError: parseMessage,
        backendUrl: backendUrl
      };
    }
  } catch (error) {
    console.error(`[Backend-Tester API Proxy] Error calling backend:`, error);
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
    
    // Parse request body; accept empty body for endpoints like exchange-rates/refresh
    let body: any = {};
    try {
      const raw = await request.text();
      if (raw && raw.trim().length > 0) {
        body = JSON.parse(raw);
      }
    } catch (_err) {
      body = {};
    }
    
    // Validate input
    if (!validateInput(body)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Proxy to backend
    const result = await makeBackendRequest(request, path, 'POST', body);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Backend-Tester API Proxy] POST error:', error);
    
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
    const result = await makeBackendRequest(request, path, 'GET');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Backend-Tester API Proxy] GET error:', error);
    
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
