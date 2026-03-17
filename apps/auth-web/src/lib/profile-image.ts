const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/gif', 'image/jpeg', 'image/png', 'image/webp']);

export const ACCEPTED_PROFILE_IMAGE_TYPES = Array.from(SUPPORTED_IMAGE_TYPES).join(',');

export function validateProfileImageFile(file: File | null) {
  if (!file) {
    return '업로드할 이미지를 선택해주세요.';
  }

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return 'GIF, JPG, PNG, WEBP 이미지 파일만 업로드할 수 있습니다.';
  }

  if (file.size === 0 || file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return '프로필 이미지는 5MB 이하만 업로드할 수 있습니다.';
  }

  return null;
}
