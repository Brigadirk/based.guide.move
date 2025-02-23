import { getCountries } from "@/lib/api"
import { CountryCard } from "@/components/country-card"

export default async function ExplorePage() {
  const countries = await getCountries()
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Explore Tax Destinations</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </div>
  )
} 