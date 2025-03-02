import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container max-w-6xl mx-auto px-4 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">🙈 Oops! Our Ape Got Lost</h1>
        <p className="text-xl text-muted-foreground">
          Even Mr. Pro Bonobo couldn&apos;t find what you&apos;re looking for.
          <br />
          Maybe he&apos;s busy eating bananas? 🍌
        </p>
        <Button asChild>
          <Link href="/">
            Back to Base
          </Link>
        </Button>
      </div>
    </div>
  )
} 