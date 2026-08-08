import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// 다운로드 presigned URL은 고정 창 단위로 서명한다. 같은 창 안에서는 URL 문자열이
// 완전히 동일해져 Next 이미지 캐시와 브라우저 캐시가 적중한다.
// expiresIn은 창 시작 시각부터 세므로 창보다 길어야 창 끝에 받은 URL도 유효하다.
const DOWNLOAD_URL_WINDOW_MS = 6 * 60 * 60 * 1000
const DOWNLOAD_URL_EXPIRES_IN = 8 * 60 * 60

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private readonly s3Client: S3Client
  private readonly bucketName: string

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME!
    const endpoint = process.env.S3_ENDPOINT

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      // MinIO requires endpoint and forcePathStyle
      ...(endpoint && { endpoint, forcePathStyle: true }),
    })
  }

  async onModuleInit() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      )
      this.logger.log(`S3 bucket '${this.bucketName}' connection established`)
    } catch (error) {
      this.logger.error(
        `Failed to connect to S3 bucket '${this.bucketName}'`,
        error,
      )
      throw error
    }
  }

  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )

    return key
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    })

    return getSignedUrl(this.s3Client, command, { expiresIn })
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    return getSignedUrl(this.s3Client, command, {
      expiresIn: DOWNLOAD_URL_EXPIRES_IN,
      signingDate: this.downloadSigningDate(),
    })
  }

  // 현재 시각을 창 크기로 내림한 값. 창이 넘어갈 때만 URL이 바뀐다.
  private downloadSigningDate(): Date {
    return new Date(
      Math.floor(Date.now() / DOWNLOAD_URL_WINDOW_MS) * DOWNLOAD_URL_WINDOW_MS,
    )
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    )
  }

  async getBucketStatus() {
    const result = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      }),
    )

    return {
      bucket: this.bucketName,
      status: 'ok',
      objectCount: result.KeyCount ?? 0,
    }
  }
}
