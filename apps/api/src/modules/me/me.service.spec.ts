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
});
