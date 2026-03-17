import { useEffect, useState } from 'react';

import { SessionDetailDto } from '@workspace/contract';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui';

import { AccountPageShell } from '@/components/AccountPageShell';
import { LoadingView } from '@/components/LoadingView';
import { StatusAlert } from '@/components/StatusAlert';
import { apiClient } from '@/lib/api/client';
import { getErrorMessage, unwrapApiData } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/format';

const SESSION_ERROR_MESSAGES: Record<string, string> = {
  CURRENT_SESSION_CANNOT_BE_DELETED: '현재 사용 중인 세션은 여기서 종료할 수 없습니다.',
  SESSION_NOT_FOUND: '이미 종료되었거나 찾을 수 없는 세션입니다.',
};

export function SessionsPage() {
  const [sessions, setSessions] = useState<SessionDetailDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoadError(null);

    try {
      const response = await apiClient.me.sessions.list();
      const nextSessions = unwrapApiData<SessionDetailDto[]>(
        response,
        '세션 목록을 불러오지 못했습니다.',
      );
      setSessions(nextSessions);
    } catch (error) {
      setLoadError(getErrorMessage(error, '세션 목록을 불러오지 못했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await apiClient.me.sessions.list();
        const nextSessions = unwrapApiData<SessionDetailDto[]>(
          response,
          '세션 목록을 불러오지 못했습니다.',
        );

        if (cancelled) return;
        setSessions(nextSessions);
      } catch (error) {
        if (cancelled) return;
        setLoadError(getErrorMessage(error, '세션 목록을 불러오지 못했습니다.'));
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteSession = async (targetSession: SessionDetailDto) => {
    setDeletingSessionId(targetSession.sessionId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.me.sessions.delete({
        params: {
          sessionId: targetSession.sessionId,
        },
      });
      unwrapApiData<{ success: true }>(response, '세션을 종료하지 못했습니다.');
      setSuccessMessage('선택한 세션을 종료했습니다.');
      await loadSessions();
    } catch (error) {
      const message =
        error instanceof Error && 'code' in error && typeof error.code === 'string'
          ? (SESSION_ERROR_MESSAGES[error.code] ??
            getErrorMessage(error, '세션을 종료하지 못했습니다.'))
          : getErrorMessage(error, '세션을 종료하지 못했습니다.');

      setActionError(message);
    } finally {
      setDeletingSessionId(null);
    }
  };

  if (isLoading) {
    return <LoadingView title="세션 로딩" description="현재 활성 세션을 조회하고 있습니다." />;
  }

  return (
    <AccountPageShell
      title="세션 관리"
      description="현재 로그인한 기기 목록을 확인하고 다른 기기의 세션을 종료할 수 있습니다."
    >
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>활성 세션</CardTitle>
          <CardDescription>
            현재 세션은 보호되어 있어 이 화면에서 삭제할 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loadError ? (
            <StatusAlert title="세션 조회 실패" description={loadError} variant="destructive" />
          ) : null}
          {actionError ? (
            <StatusAlert title="세션 종료 실패" description={actionError} variant="destructive" />
          ) : null}
          {successMessage ? <StatusAlert title="처리 완료" description={successMessage} /> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>세션</TableHead>
                <TableHead>기기</TableHead>
                <TableHead>생성 시각</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.sessionId}>
                  <TableCell className="min-w-64">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{session.name}</span>
                        {session.isCurrent ? <Badge>현재 세션</Badge> : null}
                      </div>
                      <p className="text-muted-foreground whitespace-normal break-all text-xs">
                        {session.userAgent}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{session.device}</span>
                      <span className="text-muted-foreground text-xs">{session.os}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {session.isCurrent ? (
                      <Button type="button" variant="secondary" size="sm" disabled>
                        현재 세션
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            세션 종료
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>세션을 종료할까요?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {session.name} 세션을 종료하면 해당 기기에서 다시 로그인해야 합니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingSessionId === session.sessionId}>
                              취소
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={deletingSessionId === session.sessionId}
                              onClick={() => void handleDeleteSession(session)}
                            >
                              {deletingSessionId === session.sessionId ? '종료 중...' : '세션 종료'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AccountPageShell>
  );
}
