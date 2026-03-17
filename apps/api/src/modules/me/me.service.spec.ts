import { ApiErrors, UserRole, UserStatus } from '@workspace/contract';

import { MeService } from './me.service';

describe('MeService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const s3Service = {
    deleteObject: jest.fn(),
    extractKey: jest.fn(),
    isManagedUrl: jest.fn(),
    uploadObject: jest.fn(),
  };
  const sessionService = {
    listUserSessions: jest.fn(),
    revokeUserSession: jest.fn(),
    revokeUserSessions: jest.fn(),
  };

  const service = new MeService(prisma as never, s3Service as never, sessionService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an invalid profile image error when file metadata is missing', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      avatarUrl: null,
      role: UserRole.User,
      status: UserStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      adminMemo: null,
    });

    const result = await service.updateAvatar('user-id', {});

    expect(result).toEqual({ error: ApiErrors.InvalidProfileImage });
  });

  it('returns an admin delete error for admin accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-id',
      email: 'admin@example.com',
      name: 'Admin',
      avatarUrl: null,
      role: UserRole.Admin,
      status: UserStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      adminMemo: null,
    });

    const result = await service.deleteAccount('admin-id');

    expect(result).toEqual({ error: ApiErrors.AdminCannotBeDeleted });
    expect(sessionService.revokeUserSessions).not.toHaveBeenCalled();
  });

  it('maps active sessions and marks the current session', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      avatarUrl: null,
      role: UserRole.User,
      status: UserStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      adminMemo: null,
    });
    sessionService.listUserSessions.mockResolvedValue([
      {
        sessionId: 'session-2',
        userId: 'user-id',
        userRole: UserRole.User,
        name: 'Chrome on macOS',
        os: 'macOS',
        device: 'Desktop',
        userAgent: 'ua-2',
        createdAt: '2026-03-17T08:00:00.000Z',
      },
      {
        sessionId: 'session-1',
        userId: 'user-id',
        userRole: UserRole.User,
        name: 'Safari on macOS',
        os: 'macOS',
        device: 'Desktop',
        userAgent: 'ua-1',
        createdAt: '2026-03-17T09:00:00.000Z',
      },
    ]);

    const result = await service.listSessions('user-id', 'session-1');

    expect(result).toEqual([
      {
        sessionId: 'session-2',
        userId: 'user-id',
        name: 'Chrome on macOS',
        os: 'macOS',
        device: 'Desktop',
        userAgent: 'ua-2',
        createdAt: '2026-03-17T08:00:00.000Z',
        isCurrent: false,
      },
      {
        sessionId: 'session-1',
        userId: 'user-id',
        name: 'Safari on macOS',
        os: 'macOS',
        device: 'Desktop',
        userAgent: 'ua-1',
        createdAt: '2026-03-17T09:00:00.000Z',
        isCurrent: true,
      },
    ]);
  });

  it('rejects deleting the current session', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      avatarUrl: null,
      role: UserRole.User,
      status: UserStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      adminMemo: null,
    });

    const result = await service.deleteSession('user-id', 'session-1', 'session-1');

    expect(result).toEqual({ error: ApiErrors.CurrentSessionCannotBeDeleted });
    expect(sessionService.revokeUserSession).not.toHaveBeenCalled();
  });

  it('returns session not found when target session does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      name: 'User',
      avatarUrl: null,
      role: UserRole.User,
      status: UserStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      adminMemo: null,
    });
    sessionService.revokeUserSession.mockResolvedValue(false);

    const result = await service.deleteSession('user-id', 'session-1', 'session-2');

    expect(result).toEqual({ error: ApiErrors.SessionNotFound });
  });
});
