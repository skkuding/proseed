export class UploadUrlResponseDto {
  /** presigned upload URL (PUT 대상) */
  url: string

  /** DB에 저장할 S3 object key */
  key: string
}

export class DownloadUrlResponseDto {
  /** presigned download URL */
  url: string
}

export class BucketStatusResponseDto {
  bucket: string
  status: string
  objectCount: number
}
