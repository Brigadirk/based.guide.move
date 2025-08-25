"""Global middleware for API authentication."""

from fastapi import Request
from fastapi.responses import JSONResponse

from config import Config


async def api_key_middleware(request: Request, call_next):
    """
    Global middleware to check API key authentication for all endpoints.

    This middleware runs before any endpoint and validates the API key
    for all requests except the health check endpoint.
    """
    # Skip authentication for health check endpoint
    if request.url.path == "/health":
        response = await call_next(request)
        return response

    # Get the expected API key for this environment
    expected_api_key = Config.get_api_key()

    # If no API key is configured, allow all requests
    if not expected_api_key:
        response = await call_next(request)
        return response

    # Check for API key in headers
    api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")

    if not api_key:
        return JSONResponse(
            status_code=401,
            content={
                "detail": "API key required. Include X-API-Key header for all endpoints.",
                "error": "authentication_required",
            },
        )

    if api_key != expected_api_key:
        return JSONResponse(
            status_code=401,
            content={
                "detail": "Invalid API key. Check your X-API-Key header.",
                "error": "invalid_api_key",
            },
        )

    # API key is valid, proceed with the request
    response = await call_next(request)
    return response
