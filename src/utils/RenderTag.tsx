import { Tag } from '@govtechmy/myds-react/tag'

export function renderStatusTag(statusTag: string) {
  if (!statusTag) return null
  const tag = statusTag.toUpperCase()
  if (tag === 'DITERBITKAN') {
    return (
      <Tag mode="pill" size="small" variant="success">
        Diterbitkan
      </Tag>
    )
  } else if (tag === 'DALAM_SEMAKAN') {
    return (
      <Tag mode="pill" size="small" variant="warning">
        Dalam Semakan
      </Tag>
    )
  } else if (tag === 'DRAF') {
    return (
      <Tag mode="pill" size="small">
        Draf
      </Tag>
    )
  } else if (tag === 'TIDAK_DILULUSKAN') {
    return (
      <Tag mode="pill" size="small" variant="danger">
        Tidak Diluluskan
      </Tag>
    )
  } else {
    return (
      <Tag mode="pill" size="small" variant="primary">
        {statusTag}
      </Tag>
    )
  }
}

export function renderSecretTag(secretTag: string) {
  if (!secretTag) return null
  const tag = secretTag.toUpperCase()
  if (tag === 'TERBUKA') {
    return (
      <Tag size="small" variant="success">
        Terbuka
      </Tag>
    )
  } else if (tag === 'TERHAD') {
    return <Tag size="small">Terhad</Tag>
  } else if (tag === 'SULIT') {
    return (
      <Tag size="small" variant="warning">
        Sulit
      </Tag>
    )
  } else if (tag === 'RAHSIA') {
    return (
      <Tag size="small" variant="danger">
        Rahsia
      </Tag>
    )
  } else if (tag === 'RAHSIA_BESAR') {
    return (
      <Tag size="small" variant="danger">
        Rahsia Besar
      </Tag>
    )
  } else {
    return <Tag size="small">{secretTag}</Tag>
  }
}
