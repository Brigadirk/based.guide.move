import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check backend health via internal network
    const response = await fetch('http://bonobo-backend.railway.internal/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const backendHealth = await response.json();
    
    // Return combined health status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      frontend: 'operational',
      backend: backendHealth,
      proxy: 'operational'
    });
    
  } catch (error) {
    console.error('[Health Check] Backend unreachable:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        frontend: 'operational',
        backend: 'unreachable',
        proxy: 'operational',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
