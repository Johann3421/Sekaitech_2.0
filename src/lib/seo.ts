import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Hyper-Logic"

export function createMetadata({
  title,
  description,
  image,
  path = "",
}: {
  title: string
  description: string
  image?: string
  path?: string
}): Metadata {
  const url = `${BASE_URL}${path}`
  return {
    title: `${title} | ${STORE_NAME}`,
    description,
    openGraph: {
      title: `${title} | ${STORE_NAME}`,
      description,
      url,
      siteName: STORE_NAME,
      images: image ? [{ url: image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${STORE_NAME}`,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
  }
}
