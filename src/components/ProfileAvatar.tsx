'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { PLACEHOLDER_PFP, profilePhotoUrl } from '@/libs/profilePhoto';

type ProfileAvatarProps = {
  userId?: string | null;
  size?: number;
  cacheKey?: string | number;
  className?: string;
  alt?: string;
};

export default function ProfileAvatar({
  userId,
  size = 48,
  cacheKey,
  className,
  alt = 'Profile photo',
}: ProfileAvatarProps) {
  const [src, setSrc] = useState(() =>
    profilePhotoUrl(userId, cacheKey)
  );

  useEffect(() => {
    setSrc(profilePhotoUrl(userId, cacheKey));
  }, [userId, cacheKey]);

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={clsx('h-full w-full object-cover', className)}
      onError={() => setSrc(profilePhotoUrl(PLACEHOLDER_PFP))}
    />
  );
}
