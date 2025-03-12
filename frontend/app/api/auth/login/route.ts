import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("[AUTH_LOGIN] Received login request for email:", email)

    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error("[AUTH_LOGIN] BACKEND_API_URL is not set")
      throw new Error("Server configuration error")
    }

    // Create form data
    const formData = new FormData()
    formData.append("username", email) // OAuth2 form expects 'username' field
    formData.append("password", password)

    console.log("[AUTH_LOGIN] Sending request to backend:", BACKEND_API_URL + "/auth/login")
    const response = await fetch(BACKEND_API_URL + "/auth/login", {
      method: "POST",
      body: formData,
    })

    console.log("[AUTH_LOGIN] Backend response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[AUTH_LOGIN] Backend error:", errorData)

      // Handle specific error cases
      if (response.status === 403 && errorData.detail?.code === "EMAIL_NOT_VERIFIED") {
        return NextResponse.json(
          {
            error: "Please verify your email before logging in",
            code: "EMAIL_NOT_VERIFIED",
            email: errorData.detail.email,
          },
          { status: 403 }
        )
      }

      throw new Error(errorData.detail || "Login failed")
    }

    const data = await response.json()
    console.log("[AUTH_LOGIN] Login successful")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[AUTH_LOGIN] Error during login:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
} 