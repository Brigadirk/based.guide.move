import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/api"

interface ProductCardProps {
  product: Product;
  onPurchase: (productId: string) => void;
  loading?: boolean;
}

export function ProductCard({ product, onPurchase, loading }: ProductCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      <div className="text-2xl font-bold mb-4">${(product.price / 100).toFixed(2)}</div>
      
      {product.type === 'member_bundle' ? (
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>3 Analysis Tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Lifetime Discord Access</span>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-lg">
            {product.tokenAmount} Analysis Tokens
          </div>
          <div className="text-sm text-muted-foreground">
            ${((product.price / 100) / product.tokenAmount!).toFixed(2)} per token
          </div>
        </div>
      )}

      <Button 
        className="w-full" 
        onClick={() => onPurchase(product.id)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Purchase'}
      </Button>
    </Card>
  )
} 