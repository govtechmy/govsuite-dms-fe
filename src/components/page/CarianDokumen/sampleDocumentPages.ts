import dataSample from '@/components/page/KatalogDokumen/DokumenID/sampleDokumenHtml'

// The backend's `contentEditor` is plain HTML, so wrap each item in the page/frame
// nodes the viewer expects: an A4 sheet (96 DPI) that grows with its content, and
// one frame in normal flow instead of the converter's absolute positioning
const PAGE_STYLE = 'width: 794px; min-height: 1123px'
const FRAME_STYLE = 'position: relative; padding: 72px; font-size: 14px; line-height: 1.6'

// Built once so the viewer's `pages` reference stays stable across renders.
// TODO: replace the sample pages with the record view API
export const SAMPLE_PAGES = dataSample.data.items.map(
  ({ pageNumber, contentEditor }) =>
    `<div data-type="page" data-page="${pageNumber}" style="${PAGE_STYLE}"><div data-type="frame" style="${FRAME_STYLE}">${contentEditor}</div></div>`
)
