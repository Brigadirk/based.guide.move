import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/api"

interface ProductCardProps {
  product: Product;
  onPurchase: (productId: string) => void;
  loading?: boolean;
}

export function ProductCard({ product, onPurchase, loading }: ProductCardProps) {
  const getPricePerBanana = () => {
    if (!product.bananaAmount || product.bananaAmount <= 0) return null;
    return (product.price / 100 / product.bananaAmount).toFixed(2);
  }

  const getFormattedTitle = () => {
    if (product.type === 'banana_pack') {
      return `${product.bananaAmount} Bananas 🍌`;
    }
    return product.name;
  }

  const pricePerBanana = getPricePerBanana();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{getFormattedTitle()}</h3>
        <div className="text-2xl font-bold">${(product.price / 100).toFixed(2)}</div>
      </div>
      
      {product.type === 'member_bundle' ? (
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <span>🍌</span>
            <span>3 Fresh Bananas</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💬</span>
            <span>VIP Access to Bonobo&apos;s Jungle (Discord)</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Perfect for those who want to chat with fellow nomads!
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-lg text-muted-foreground">
            ${pricePerBanana} per banana
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