import { Tag } from '@govtechmy/myds-react/tag'
import NormalizeWord from './NormalizeWord'

export function renderStatusTag(statusTag: string) {
  if (!statusTag) return null
  const tag = statusTag.toUpperCase()
  if (tag === 'DITERBITKAN') {
    return (
      <Tag mode="pill" size="small" variant="success">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'DALAM_SEMAKAN') {
    return (
      <Tag mode="pill" size="small" variant="warning">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'DRAF') {
    return (
      <Tag mode="pill" size="small">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'TIDAK_DILULUSKAN') {
    return (
      <Tag mode="pill" size="small" variant="danger">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else {
    return (
      <Tag mode="pill" size="small" variant="danger">
        Not set
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
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'TERHAD') {
    return (
      <Tag size="small" variant="default">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'SULIT') {
    return (
      <Tag size="small" variant="warning">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'RAHSIA') {
    return (
      <Tag size="small" variant="danger">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else if (tag === 'RAHSIA_BESAR') {
    return (
      <Tag size="small" variant="danger">
        {NormalizeWord(tag)}
      </Tag>
    )
  } else {
    return (
      <Tag size="small" variant="danger">
        Not Set
      </Tag>
    )
  }
}

export const renderInProgressTag = () => (
  <Tag
    variant="primary"
    size="small"
    mode="default"
    className="h-auto shrink-0 flex-col gap-0 whitespace-normal py-1 text-center leading-none text-[10px]/[12px] p-[4px] "
  >
    Akan
    <br />
    Datang
  </Tag>
)
