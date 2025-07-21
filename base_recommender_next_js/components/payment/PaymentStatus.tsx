import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type PaymentStatusProps = {
  type: 'success' | 'error' | 'cancel'
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  autoRedirect?: {
    path: string
    delay: number
  }
}

export function PaymentStatus({
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
  autoRedirect
}: PaymentStatusProps) {
  const router = useRouter()

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-accent-positive" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-destructive" />
      case 'cancel':
        return <XCircle className="h-12 w-12 text-destructive" />
    }
  }

  if (autoRedirect) {
    setTimeout(() => {
      router.push(autoRedirect.path)
    }, autoRedirect.delay)
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-center">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="w-full"
              variant="default"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              className="w-full"
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 