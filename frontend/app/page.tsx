import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CountryCard } from "@/components/country-card"
import { mockCountries } from "@/lib/mock-data"

export default function Home() {
  // Get 3 featured countries
  const featuredCountries = mockCountries.slice(0, 3)

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl max-w-3xl">
        Find Your Perfect Tax-Friendly Destination
      </h1>
      
      <p className="mt-6 text-xl text-muted-foreground max-w-[600px]">
        Get personalized recommendations based on your income, lifestyle, and preferences.
      </p>
      
      <div className="mt-12">
        <Link href="/quiz">
          <Button size="lg" className="text-lg px-8">
            Get Your Guide
          </Button>
        </Link>
      </div>

      <div className="mt-24 w-full">
        <h2 className="text-2xl font-semibold mb-8">Popular Destinations</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {featuredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      </div>
    </div>
  )
}
