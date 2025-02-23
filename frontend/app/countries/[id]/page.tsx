import { getCountry } from "@/lib/api"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CountryPageProps {
  params: {
    id: string
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const country = await getCountry(params.id)
  
  if (!country) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{country.name}</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tax Information</h2>
          <div className="prose max-w-none">
            <p>{country.taxDescription}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Living Costs</h2>
          <div className="prose max-w-none">
            <p>Average monthly living cost: ${country.livingCost}</p>
            <p>{country.livingCostDescription}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Quality of Life</h2>
          <div className="prose max-w-none">
            <p>{country.qualityOfLifeDescription}</p>
          </div>
        </section>

        <section className="mt-12 bg-muted p-8 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Want to know if {country.name} is right for you?</h2>
          <p className="text-muted-foreground mb-6">
            Get a personalized assessment based on your specific situation
          </p>
          <Link href="/quiz">
            <Button size="lg" className="text-lg px-8">
              Get Your Guide
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
} 