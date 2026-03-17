import { Alert, AlertDescription, AlertTitle } from '@workspace/ui';

interface StatusAlertProps {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export function StatusAlert({
  title = '안내',
  description,
  variant = 'default',
}: StatusAlertProps) {
  return (
    <Alert variant={variant}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
