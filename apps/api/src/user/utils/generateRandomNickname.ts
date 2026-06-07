const COUNTRIES = [
  '한국',
  '일본',
  '중국',
  '영국',
  '미국',
  '독일',
  '프랑스',
  '캐나다',
  '브라질',
  '호주',
  '인도',
  '태국',
  '스페인',
  '이탈리아',
] as const

const EMOTIONAL_ADJECTIVES = [
  '행복한',
  '신나는',
  '설레는',
  '즐거운',
  '차분한',
  '씩씩한',
  '다정한',
  '유쾌한',
  '용감한',
  '명랑한',
  '수줍은',
  '느긋한',
] as const

const ANIMALS = [
  '강아지',
  '고양이',
  '토끼',
  '여우',
  '수달',
  '판다',
  '코알라',
  '기린',
  '펭귄',
  '햄스터',
  '고슴도치',
  '캥거루',
  '친칠라',
  '카피바라',
] as const

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function generateRandomNickname(): string {
  while (true) {
    const country = pickRandom(COUNTRIES)
    const adjective = pickRandom(EMOTIONAL_ADJECTIVES)
    const animal = pickRandom(ANIMALS)
    const nickname = `${country}의 ${adjective} ${animal}`

    if (nickname.length <= 12) {
      return nickname
    }
  }
}
