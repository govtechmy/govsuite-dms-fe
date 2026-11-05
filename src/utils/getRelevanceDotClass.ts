// Relevance dot colour: 0–69 yellow, 70–100 green. Red if negative number
const HIGH_RELEVANCE_SCORE = 70
const LOW_RELEVANCE_SCORE = 50

export default function getRelevanceDotClass(score: number): string {
  let dotClass = ''

  if (score >= HIGH_RELEVANCE_SCORE) {
    dotClass = 'bg-success-600'
  } else if (score >= LOW_RELEVANCE_SCORE) {
    dotClass = 'bg-warning-600'
  } else {
    dotClass = 'bg-danger-600'
  }

  return dotClass
}
