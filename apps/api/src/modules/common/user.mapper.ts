import { User } from '@workspace/database';
import { UserDto } from '@workspace/contract';

export const toUserDto = (user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl' | 'role' | 'status' | 'createdAt'>): UserDto => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
};
