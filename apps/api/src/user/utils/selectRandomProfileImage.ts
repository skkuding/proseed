export function selectRandomProfileImage(): string {
  const PROFILEIMAGES = [
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
  return PROFILEIMAGES[Math.floor(Math.random() * PROFILEIMAGES.length)]
}
