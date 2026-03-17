import * as React from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components';
import { cn } from '../../utils';

export interface CenterPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  cardClassName?: string;
  children: React.ReactNode;
}

export function CenterPage({
  title,
  description,
  headerAction,
  footer,
  className,
  contentClassName,
  cardClassName,
  children,
}: CenterPageProps) {
  const hasHeader = !!title || !!description || !!headerAction;

  return (
    <main
      className={cn(
        'flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 lg:px-8',
        className,
      )}
    >
      <div className="w-full max-w-4xl">
        <Card
          className={cn(
            'border-border/70 bg-card/95 overflow-hidden shadow-xl backdrop-blur',
            cardClassName,
          )}
        >
          {hasHeader ? (
            <CardHeader className="border-b border-border/70 bg-muted/35">
              {title ? <CardTitle className="text-2xl tracking-tight">{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
              {headerAction ? <CardAction>{headerAction}</CardAction> : null}
            </CardHeader>
          ) : null}
          <CardContent className={cn('px-5 py-5 sm:px-6 sm:py-6', contentClassName)}>
            {children}
          </CardContent>
          {footer ? (
            <CardFooter className="border-t border-border/70 bg-muted/20">{footer}</CardFooter>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
