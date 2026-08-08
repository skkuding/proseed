import { StorageService } from './storage.service'

const WINDOW_MS = 6 * 60 * 60 * 1000

//2026-08-06T09:00:00Z — 06:00 창 한가운데
const MID_WINDOW = Date.parse('2026-08-06T09:00:00Z')

describe('StorageService.getSignedDownloadUrl', () => {
  let service: StorageService

  beforeAll(() => {
    process.env.S3_BUCKET_NAME = 'test-bucket'
    process.env.AWS_REGION = 'ap-northeast-2'
    process.env.AWS_ACCESS_KEY_ID = 'AKIATEST'
    process.env.AWS_SECRET_ACCESS_KEY = 'secret'
    service = new StorageService()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const urlAt = (now: number) => {
    jest.spyOn(Date, 'now').mockReturnValue(now)
    return service.getSignedDownloadUrl('uploads/example.png')
  }

  //URL이 매 호출 달라지면 Next 이미지 캐시·브라우저 캐시가 전부 빗나간다
  it('같은 창 안에서는 호출 시각이 달라도 동일한 URL을 반환한다', async () => {
    const first = await urlAt(MID_WINDOW)
    const second = await urlAt(MID_WINDOW + 42 * 1000)

    expect(second).toBe(first)
  })

  it('서명 시각을 창 시작으로 내림한다', async () => {
    const url = await urlAt(MID_WINDOW)

    //09:00 요청이지만 창 시작인 06:00으로 서명된다
    expect(url).toContain('X-Amz-Date=20260806T060000Z')
  })

  it('창이 넘어가면 URL이 바뀐다', async () => {
    const before = await urlAt(MID_WINDOW)
    const after = await urlAt(MID_WINDOW + WINDOW_MS)

    expect(after).not.toBe(before)
  })

  //창 시작에 발급된 URL을 창 끝에 받는 사용자도 쓸 수 있어야 한다
  it('만료 기간이 창 길이보다 길다', async () => {
    const url = await urlAt(MID_WINDOW)
    const expiresIn = Number(
      new URL(url).searchParams.get('X-Amz-Expires') ?? '0',
    )

    expect(expiresIn * 1000).toBeGreaterThan(WINDOW_MS)
  })
})
