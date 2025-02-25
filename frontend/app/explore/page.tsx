import { getCountries } from "@/lib/server-api"
import { CountryCard } from "@/components/country-card"

export default async function ExplorePage() {
  try {
    const countries = await getCountries()
    
    if (!countries || !Array.isArray(countries)) {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-8">Explore Tax Destinations</h1>
          <p>No countries available at the moment.</p>
        </div>
      )
    }
    
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
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Explore Tax Destinations</h1>
        <p>Error loading countries. Please try again later.</p>
      </div>
    )
  }
} 