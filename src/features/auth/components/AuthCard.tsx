import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type AuthCardProps = {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({
  title,
  description,
  children,
}: AuthCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
