"""API authentication utilities."""

from fastapi import Header, HTTPException

from config import Config


async def verify_api_key(x_api_key: str | None = Header(None)) -> str | None:
    """
    Verify API key for testing endpoints.

    This is an optional authentication mechanism for testing endpoints.
    If no TESTING_API_KEY is configured, all requests are allowed.
    If TESTING_API_KEY is configured, requests must include a matching X-API-Key header.

    Args:
        x_api_key: API key from X-API-Key header

    Returns:
        The validated API key or None if no authentication required

    Raises:
        HTTPException: If API key authentication fails
    """
    # Get the appropriate API key for this environment
    expected_api_key = Config.get_api_key()

    # If no API key is configured, allow all requests
    if not expected_api_key:
        return None

    # If API key is configured, require it in header
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required. Include X-API-Key header for authenticated endpoints.",
        )

    if x_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key. Check your X-API-Key header.")

    return x_api_key


async def optional_api_key(x_api_key: str | None = Header(None)) -> str | None:
    """
    Optional API key verification for endpoints that support both authenticated and unauthenticated access.

    This variant doesn't raise an exception if no API key is provided,
    but validates it if present.

    Args:
        x_api_key: API key from X-API-Key header

    Returns:
        The validated API key or None if not provided/not required

    Raises:
        HTTPException: If API key is provided but invalid
    """
    # Get the appropriate API key for this environment
    expected_api_key = Config.get_api_key()

    # If no API key is configured, ignore any provided key
    if not expected_api_key:
        return None

    # If no key provided, that's OK for optional endpoints
    if not x_api_key:
        return None

    # If key provided, it must be valid
    if x_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key. Check your X-API-Key header.")

    return x_api_key
