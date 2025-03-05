import { TaxScore, VisaScore } from "@/components/features/scores/score-display"

interface CountryScoresProps {
  taxScore: number;
  visaScore: number;
  className?: string;
  showLabels?: boolean;
}

export function CountryScores({ 
  taxScore, 
  visaScore, 
  className = '',
  showLabels = false
}: CountryScoresProps) {
  return (
    <div className={`absolute inset-x-3 top-3 flex justify-between ${className}`}>
      <TaxScore 
        score={taxScore} 
        size="sm" 
        showLabel={showLabels}
        className="backdrop-blur-sm"
      />
      {visaScore !== undefined && (
        <VisaScore 
          score={visaScore} 
          size="sm" 
          showLabel={showLabels}
          className="backdrop-blur-sm"
        />
      )}
    </div>
  );
} 