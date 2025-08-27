import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
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

function getApiKeyFromEnv(): string | undefined {
  return (
    process.env.PRODUCTION_API_KEY ||
    process.env.STAGING_API_KEY ||
    process.env.LOCAL_API_KEY
  );
}

async function makeBackendRequest(path: string, method: string, body?: any, clientHeaders?: Headers) {
  // Use internal URL in production, public URL in development
  // Remove the /api/v1/ prefix from path if it exists, since we add it below
  const cleanPath = path.replace(/^api\/v1\//, '');
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'}/api/v1/${cleanPath}`;
  const isProduction = process.env.NODE_ENV === 'production';

  console.log(`[API Proxy] ${method} ${path} using ${isProduction ? 'internal' : 'public'} URL`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Always include API key for backend requests
  const apiKey = getApiKeyFromEnv() || clientHeaders?.get('x-api-key') || clientHeaders?.get('X-API-Key') || undefined;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
    console.log(`[API Proxy] Using API key for ${method} ${path}`);
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
      // Try to read error body
      let detail: string | undefined = undefined;
      try {
        const errJson = await response.json();
        detail = (errJson && (errJson.detail || errJson.error)) as string | undefined;
      } catch (_) {
        // ignore parse error
      }

      const isUnauthorized = response.status === 401;
      const message = isUnauthorized
        ? (detail || 'Backend rejected request: missing or invalid API key. Configure LOCAL_API_KEY/STAGING_API_KEY/PRODUCTION_API_KEY on both frontend and backend and restart.')
        : (detail || `Backend responded with ${response.status}: ${response.statusText}`);

      const err: any = new Error(message);
      err.status = response.status;
      throw err;
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
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Rate limiting
    if (!rateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get the API path (await params per Next.js dynamic API contract)
    const { path: pathParts } = await context.params;
    const path = pathParts.join('/');
    
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
    
    const anyErr: any = error;
    const status = typeof anyErr?.status === 'number' ? anyErr.status : 500;
    const message = anyErr?.message || 'Internal server error';
    return NextResponse.json(
      {
        error: status === 401 ? 'authentication_required' : 'proxy_error',
        detail: status === 401
          ? 'Backend requires an API key. Set LOCAL_API_KEY/STAGING_API_KEY/PRODUCTION_API_KEY consistently in frontend and backend, then restart.'
          : message,
      },
      { status }
    );
    
  }
}

// Handle GET requests
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Rate limiting
    if (!rateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get the API path (await params per Next.js dynamic API contract)
    const { path: pathParts } = await context.params;
    const path = pathParts.join('/');
    
    // Proxy to backend
    const result = await makeBackendRequest(path, 'GET', undefined, request.headers);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[API Proxy] GET error:', error);
    
    const anyErr: any = error;
    const status = typeof anyErr?.status === 'number' ? anyErr.status : 500;
    const message = anyErr?.message || 'Internal server error';
    return NextResponse.json(
      {
        error: status === 401 ? 'authentication_required' : 'proxy_error',
        detail: status === 401
          ? 'Backend requires an API key. Set LOCAL_API_KEY/STAGING_API_KEY/PRODUCTION_API_KEY consistently in frontend and backend, then restart.'
          : message,
      },
      { status }
    );
  }
}
