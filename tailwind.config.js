/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        hermes: {
          canvas: '#fcf7f1',      // rgb(252, 247, 241) Fond principal chaud
          panel: '#fffcf7',       // Blanc crème panneau superposé
          secondary: '#f6f1eb',   // rgb(246, 241, 235) Fond secondaire/footer
          border: '#f6f1eb',
          black: '#000000',
          hover: '#2e2d2d',
          muted: '#696969',
          disabled: '#919191',
          track: '#e2d8ce',       // rgb(226, 216, 206)
          white: '#ffffff',
        }
      },
      fontFamily: {
        primary: ['var(--font-primary)'],
        edito: ['var(--font-edito)'],
        secondary: ['var(--font-secondary)'],
      },
      screens: {
        'mobile': {'max': '1023px'},
        'desktop': '1024px',
        'wide': '1290px',
        'ultrawide': '1920px',
      },
      spacing: {
        'header-desktop': '110px',
        'header-desktop-bar': '64px',
        'header-menu': '46px',
        'header-mobile': '50px',
      },
      transitionTimingFunction: {
        'hermes-quart': 'cubic-bezier(.165, .84, .44, 1)',
        'hermes-cubic': 'cubic-bezier(.215, .61, .355, 1)',
      }
    },
  },
  plugins: [],
}
