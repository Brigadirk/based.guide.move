interface CountryScoresProps {
  basedScore: number;
  visaScore?: number;
  className?: string;
}

export function CountryScores({ basedScore, visaScore, className = '' }: CountryScoresProps) {
  return (
    <div className={`absolute inset-x-3 top-3 flex justify-between ${className}`}>
      <div className="bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1.5">
        <span className="text-xs font-medium">Based</span>
        <span className="text-xs font-medium">{basedScore}</span>
      </div>
      {visaScore !== undefined && (
        <div className="bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="text-xs font-medium">Visa</span>
          <span className="text-xs font-medium">{visaScore}</span>
        </div>
      )}
    </div>
  );
} 