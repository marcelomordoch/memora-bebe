import { S3Client } from '@aws-sdk/client-s3'

export function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME!

export function getPublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!
  return `${base.replace(/\/$/, '')}/${key}`
}
