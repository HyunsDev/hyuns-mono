import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { AccessDeniedError, DomainException, PrismaService, S3Service, SessionService } from '@workspace/backend-core';
import { ApiErrors, SessionDetailDto, UserRole, UserStatus } from '@workspace/contract';

const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const IMAGE_MIME_TO_EXTENSION: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

interface UploadedFileLike {
  filename?: string;
  mimetype?: string;
  toBuffer?: () => Promise<Buffer>;
}

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly sessionService: SessionService,
  ) {}

  async getCurrentUser(userId: string) {
    return this.getActiveUserOrThrow(userId);
  }

  async listSessions(userId: string, currentSessionId: string) {
    await this.getActiveUserOrThrow(userId);

    const sessions = await this.sessionService.listUserSessions(userId);

    return sessions.map((session) => {
      return {
        sessionId: session.sessionId,
        userId: session.userId,
        name: session.name,
        os: session.os,
        device: session.device,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        isCurrent: session.sessionId === currentSessionId,
      } satisfies SessionDetailDto;
    });
  }

  async updateProfile(userId: string, name?: string) {
    await this.getActiveUserOrThrow(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(name !== undefined ? { name } : {}),
      },
    });
  }

  async updateAvatar(userId: string, file: UploadedFileLike) {
    const user = await this.getActiveUserOrThrow(userId);
    const mimetype = file.mimetype;
    const extension = mimetype ? IMAGE_MIME_TO_EXTENSION[mimetype] : null;

    if (!mimetype || !extension || !file.toBuffer) {
      return { error: ApiErrors.InvalidProfileImage } as const;
    }

    const buffer = await file.toBuffer();

    if (buffer.length === 0 || buffer.length > MAX_IMAGE_FILE_SIZE_BYTES) {
      return { error: ApiErrors.InvalidProfileImage } as const;
    }

    const key = `users/${userId}/avatars/${randomUUID()}.${extension}`;
    const avatarUrl = await this.s3Service.uploadObject({
      key,
      body: buffer,
      contentType: mimetype,
    });

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl,
      },
    });

    if (user.avatarUrl && this.s3Service.isManagedUrl(user.avatarUrl)) {
      const oldKey = this.s3Service.extractKey(user.avatarUrl);
      if (oldKey) {
        await this.s3Service.deleteObject(oldKey).catch(() => undefined);
      }
    }

    return { user: updatedUser } as const;
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return { error: ApiErrors.UserNotFound } as const;
    }

    if (user.status === UserStatus.Banned) {
      throw new DomainException(new AccessDeniedError());
    }

    if (user.role === UserRole.Admin) {
      return { error: ApiErrors.AdminCannotBeDeleted } as const;
    }

    const deletedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.Deleted,
        deletedAt: new Date(),
      },
    });

    await this.sessionService.revokeUserSessions(userId);

    return { user: deletedUser } as const;
  }

  async deleteSession(userId: string, currentSessionId: string, targetSessionId: string) {
    await this.getActiveUserOrThrow(userId);

    if (targetSessionId === currentSessionId) {
      return { error: ApiErrors.CurrentSessionCannotBeDeleted } as const;
    }

    const deleted = await this.sessionService.revokeUserSession(userId, targetSessionId);

    if (!deleted) {
      return { error: ApiErrors.SessionNotFound } as const;
    }

    return {
      success: true as const,
    };
  }

  private async getActiveUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.status !== UserStatus.Active) {
      throw new DomainException(new AccessDeniedError());
    }

    return user;
  }
}
