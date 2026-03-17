import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { UserDto } from '@workspace/contract';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from '@workspace/ui';

import { AccountPageShell } from '@/components/AccountPageShell';
import { LoadingView } from '@/components/LoadingView';
import { StatusAlert } from '@/components/StatusAlert';
import { useAuthSession } from '@/features/auth/auth-session';
import { apiClient } from '@/lib/api/client';
import { getErrorMessage, unwrapApiData } from '@/lib/api/errors';
import { getInitials } from '@/lib/format';
import { ACCEPTED_PROFILE_IMAGE_TYPES, validateProfileImageFile } from '@/lib/profile-image';

export function ProfilePage() {
  const { setAuthenticatedUser } = useAuthSession();
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [name, setName] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoadError(null);

      try {
        const response = await apiClient.me.get();
        const currentProfile = unwrapApiData<UserDto>(
          response,
          '프로필 정보를 불러오지 못했습니다.',
        );

        if (cancelled) return;

        setProfile(currentProfile);
        setName(currentProfile.name);
        setAuthenticatedUser(currentProfile);
      } catch (error) {
        if (cancelled) return;
        setLoadError(getErrorMessage(error, '프로필 정보를 불러오지 못했습니다.'));
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [setAuthenticatedUser]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingName(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.me.updateProfile({
        body: {
          name: name.trim(),
        },
      });
      const updatedProfile = unwrapApiData<UserDto>(response, '프로필 이름을 저장하지 못했습니다.');

      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setAuthenticatedUser(updatedProfile);
      setSuccessMessage('프로필 이름을 저장했습니다.');
    } catch (error) {
      setSaveError(getErrorMessage(error, '프로필 이름을 저장하지 못했습니다.'));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const validationMessage = validateProfileImageFile(file);

    setAvatarError(null);
    setSuccessMessage(null);

    if (validationMessage) {
      setAvatarError(validationMessage);
      event.target.value = '';
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await apiClient.me.updateAvatar({
        body: {
          file: file!,
        },
      });
      const updatedProfile = unwrapApiData<UserDto>(
        response,
        '프로필 이미지를 업로드하지 못했습니다.',
      );

      setProfile(updatedProfile);
      setAuthenticatedUser(updatedProfile);
      setSuccessMessage('프로필 이미지를 업데이트했습니다.');
    } catch (error) {
      setAvatarError(getErrorMessage(error, '프로필 이미지를 업로드하지 못했습니다.'));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  if (isLoading) {
    return <LoadingView title="프로필 로딩" description="현재 사용자 정보를 불러오고 있습니다." />;
  }

  return (
    <AccountPageShell
      title="프로필 관리"
      description="현재 로그인한 계정 정보를 확인하고 이름과 아바타를 업데이트하세요."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>이름 변경은 즉시 현재 세션에 반영됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-5"
              onSubmit={(event) => void handleProfileSubmit(event)}
            >
              {loadError ? (
                <StatusAlert
                  title="프로필 조회 실패"
                  description={loadError}
                  variant="destructive"
                />
              ) : null}
              {saveError ? (
                <StatusAlert
                  title="프로필 저장 실패"
                  description={saveError}
                  variant="destructive"
                />
              ) : null}
              {successMessage ? (
                <StatusAlert title="저장 완료" description={successMessage} />
              ) : null}
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="profile-name">이름</FieldLabel>
                    <FieldContent>
                      <Input
                        id="profile-name"
                        value={name}
                        maxLength={20}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="표시할 이름을 입력하세요"
                      />
                      <FieldDescription>최대 20자까지 입력할 수 있습니다.</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingName || name.trim().length === 0}>
                  {isSavingName ? '저장 중...' : '이름 저장'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>아바타</CardTitle>
            <CardDescription>
              GIF, JPG, PNG, WEBP 형식의 5MB 이하 이미지만 업로드할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-20 border border-border/70">
                  {profile?.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {profile ? getInitials(profile.name) : '--'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">{profile?.name ?? '이름 없음'}</p>
                  <p className="text-muted-foreground text-sm">{profile?.email}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile ? <Badge variant="outline">{profile.status}</Badge> : null}
                    {profile ? <Badge variant="outline">{profile.role}</Badge> : null}
                  </div>
                </div>
              </div>
              {avatarError ? (
                <StatusAlert
                  title="아바타 업로드 실패"
                  description={avatarError}
                  variant="destructive"
                />
              ) : null}
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="profile-avatar">프로필 이미지 업로드</FieldLabel>
                  <FieldContent>
                    <Input
                      id="profile-avatar"
                      type="file"
                      accept={ACCEPTED_PROFILE_IMAGE_TYPES}
                      disabled={isUploadingAvatar}
                      onChange={(event) => void handleAvatarChange(event)}
                    />
                    <FieldDescription>파일 선택 후 바로 업로드가 시작됩니다.</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldSet>
              <div className="text-muted-foreground text-sm">
                {isUploadingAvatar
                  ? '이미지를 업로드하고 있습니다...'
                  : '현재 이미지가 즉시 반영됩니다.'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountPageShell>
  );
}
