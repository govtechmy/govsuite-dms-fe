/**
 * TEMPORARY placeholder values for the Carian Dokumen result lists.
 *
 * /record/search only returns `recordId` and `title`, so the fields below are
 * shown as neutral placeholders until the backend provides them. They are kept
 * in one file so they are easy to find and remove.
 *
 * Used by: FullTextRecordResultSearch, HybridRecordResultSearch (via DocumentMetaTag).
 * Delete this file once every value comes from the API.
 */

// TODO: replace once /record/search returns the document type and date for each record.
export const PLACEHOLDER_JENIS_DOKUMEN = 'Jenis Dokumen'
export const PLACEHOLDER_TARIKH = '--/--/----'

// TODO: replace once hybrid search returns a passage and relevance score for each record.
export const PLACEHOLDER_PASSAGE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
export const PLACEHOLDER_RELEVANCE = 80
