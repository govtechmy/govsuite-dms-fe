import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// @govtechmy/myds-style bundles a remote `@import url(https://fonts.googleapis.com/...)`
// for Inter/Poppins. This app self-hosts those fonts (see src/index.css), so that
// remote import is stripped here to avoid any outbound network request at runtime.
const stripGoogleFontsImport = () => ({
  postcssPlugin: 'strip-google-fonts-import',
  AtRule: {
    import: (atRule) => {
      if (/fonts\.googleapis\.com/.test(atRule.params)) {
        atRule.remove()
      }
    },
  },
})
stripGoogleFontsImport.postcss = true

export default {
  plugins: [stripGoogleFontsImport, tailwindcss(), autoprefixer()],
}
