import { CenterPage, Spinner } from '@workspace/ui';

interface LoadingViewProps {
  description?: string;
  title?: string;
}

export function LoadingView({
  title = '잠시만 기다려주세요',
  description = '인증 상태를 확인하고 있습니다.',
}: LoadingViewProps) {
  return (
    <CenterPage title={title} description={description} cardClassName="max-w-xl">
      <div className="flex min-h-32 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    </CenterPage>
  );
}
