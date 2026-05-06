import { getRandomNickname } from '@woowa-babble/random-nickname'

// @woowa-babble/random-nickname doesn't ship types; assert the signature we use.
const getRandomNicknameTyped = getRandomNickname as (
  type: 'animals' | 'heros' | 'characters' | 'monsters',
) => string

export function generateRandomNickname(): string {
  const types = ['animals', 'heros', 'characters', 'monsters'] as const

  let username = ''
  let isInvalid = true

  while (isInvalid) {
    const randomType = types[Math.floor(Math.random() * types.length)]
    username = getRandomNicknameTyped(randomType)

    if (username.length > 12) {
      continue
    }

    isInvalid = false
  }
  return username
}
