const PROFILE_IMAGES = [
  '/profile_avocado.svg',
  '/profile_cake.svg',
  '/profile_fish.svg',
  '/profile_fortunecookie.svg',
  '/profile_juice.svg',
  '/profile_maple.svg',
  '/profile_onikiri.svg',
  '/profile_salmonsushi.svg',
  '/profile_shrimp.svg',
  '/profile_tunasushi.svg',
] as const

export function selectRandomProfileImage(): string {
  return PROFILE_IMAGES[Math.floor(Math.random() * PROFILE_IMAGES.length)]
}
