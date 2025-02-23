import { Country } from "@/types/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface CountryCardProps {
  country: Country
}

export function CountryCard({ country }: CountryCardProps) {
  return (
    <Link href={`/countries/${country.id}`}>
      <Card className="hover:bg-accent transition-colors">
        <CardHeader>
          <CardTitle>{country.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tax Score</span>
              <span className="font-medium">{country.taxScore}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Living Cost</span>
              <span className="font-medium">${country.livingCost}/mo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 