import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CountryCard } from "@/components/features/country/country-card"
import { getCountries } from "@/lib/supabase/queries"
import { Country } from "@/types/api"

export default async function HomePage() {
  // Get all countries and take first 3 for featured section
  const countries = await getCountries()
  const featuredCountries = countries.slice(0, 3)

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-col flex-1">
        <div className="relative w-full h-[400px]">
          <Image
            src="/data/images/landing_header.jpg"
            alt="Tax Haven Destinations"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">
            Find Your New Home
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-[400px] mx-auto">
            See if they'll let you in and at what cost.
          </p>
          <div className="mt-6">
            <Link href="/products">
              <Button size="lg" className="text-lg px-8">
                Get Your Guide
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <h2 className="text-2xl font-semibold mb-8 text-center">Popular Bases</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCountries.map((country: Country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/explore">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Explore All Bases
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
