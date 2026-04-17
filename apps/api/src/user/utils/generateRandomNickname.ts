import { getRandomNickname } from '@woowa-babble/random-nickname'

export function generateRandomNickname(): string {
  const types = ['animals', 'heros', 'characters', 'monsters'] as const

  let username = ''
  let isInvalid = true

  while (isInvalid) {
    const randomType = types[Math.floor(Math.random() * types.length)]
    username = getRandomNickname(randomType)

    if (username.length > 12) {
      continue
    }

    isInvalid = false
  }
  return username
}
