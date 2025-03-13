import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your authentication request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could be because:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid</li>
          </ul>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/signup">
                Try signing up again
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 