import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CountryCard } from "@/components/country-card"
import { getCountries } from "@/lib/server-api"
import { Country } from "@/types/api"

export default async function Home() {
  // Get all countries and take first 3 for featured section
  const countries = await getCountries()
  const featuredCountries = countries.slice(0, 3)

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-full h-[400px]">
        <Image
          src="/data/images/landing_header.jpg"
          alt="Tax Haven Destinations"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-3xl px-4 mt-10">
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

      <div className="mt-24 w-full px-4">
        <h2 className="text-2xl font-semibold mb-8">Popular Bases</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
  )
}
