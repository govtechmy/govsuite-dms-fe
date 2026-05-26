import { Tag } from '@govtechmy/myds-react/tag'

export function renderStatusTag(statusTag: string) {
  if (!statusTag) return null
  const tag = statusTag.toLowerCase()
  if (tag === 'diterbitkan') {
    return (
      <Tag mode="pill" variant="success">
        Diterbitkan
      </Tag>
    )
  } else if (tag === 'menunggu kelulusan') {
    return (
      <Tag mode="pill" variant="warning">
        Menunggu Kelulusan
      </Tag>
    )
  } else if (tag === 'draf') {
    return <Tag mode="pill">Draf</Tag>
  } else {
    return <Tag mode="pill">{statusTag}</Tag>
  }
}

export function renderSecretTag(secretTag: string) {
  if (!secretTag) return null
  const tag = secretTag.toLowerCase()
  if (tag === 'rahsia besar') {
    return <Tag variant="danger">Rahsia Besar</Tag>
  } else if (tag === 'terbuka') {
    return <Tag variant="success">Terbuka</Tag>
  } else if (tag === 'sulit') {
    return <Tag variant="warning">Sulit</Tag>
  } else {
    return <Tag>{secretTag}</Tag>
  }
}
