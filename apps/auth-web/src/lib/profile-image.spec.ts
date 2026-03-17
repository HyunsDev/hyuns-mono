import { validateProfileImageFile } from './profile-image';

describe('validateProfileImageFile', () => {
  it('rejects non-image uploads', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    expect(validateProfileImageFile(file)).toBe(
      'GIF, JPG, PNG, WEBP 이미지 파일만 업로드할 수 있습니다.',
    );
  });

  it('rejects images over 5MB', () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });

    expect(validateProfileImageFile(file)).toBe(
      '프로필 이미지는 5MB 이하만 업로드할 수 있습니다.',
    );
  });

  it('accepts supported images within the size limit', () => {
    const file = new File([new Uint8Array(1024)], 'avatar.png', { type: 'image/png' });

    expect(validateProfileImageFile(file)).toBeNull();
  });
});
