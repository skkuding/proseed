export const refreshTokenCacheKey = (userId: number, refreshToken: string) =>
  `auth:refresh:user:${userId}:${refreshToken}`
