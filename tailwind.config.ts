import type { Config } from 'tailwindcss'

export default <Partial<Config>> {
  theme: {
    extend: {
      colors: {
        herb: {
          50: '#effcf8',
          100: '#d7f7ed',
          200: '#b3eedc',
          300: '#79dfc1',
          400: '#45cba7',
          500: '#29b592',
          600: '#1e9175',
          700: '#1c755f',
          800: '#1b5d4e',
          900: '#194d42',
          950: '#082b24'
        },
        mint_leaf: {
          DEFAULT: '#29b592',
          100: '#08251e',
          200: '#11493b',
          300: '#196e59',
          400: '#219276',
          500: '#29b592',
          600: '#45d5b1',
          700: '#73dfc4',
          800: '#a2ead8',
          900: '#d0f4eb'
        },
        alabaster_grey: {
          DEFAULT: '#e8e8e8',
          100: '#2e2e2e',
          200: '#5d5d5d',
          300: '#8b8b8b',
          400: '#bababa',
          500: '#e8e8e8',
          600: '#ededed',
          700: '#f1f1f1',
          800: '#f6f6f6',
          900: '#fafafa'
        },
        eggshell: {
          DEFAULT: '#f1ecd9',
          100: '#433b19',
          200: '#867532',
          300: '#c0aa54',
          400: '#d8cb97',
          500: '#f1ecd9',
          600: '#f4f0e1',
          700: '#f7f4e9',
          800: '#f9f8f0',
          900: '#fcfbf8'
        },
        ash_grey: {
          DEFAULT: '#b9cac2',
          100: '#212c27',
          200: '#43584e',
          300: '#648575',
          400: '#8da99c',
          500: '#b9cac2',
          600: '#c7d5ce',
          700: '#d5dfdb',
          800: '#e3eae7',
          900: '#f1f4f3'
        },
        pine_teal: {
          DEFAULT: '#204533',
          100: '#060e0a',
          200: '#0d1c15',
          300: '#132a1f',
          400: '#1a3829',
          500: '#204533',
          600: '#3a7e5d',
          700: '#57b286',
          800: '#8fccae',
          900: '#c7e5d7'
        },
        carbon_black: {
          DEFAULT: '#222222',
          100: '#070707',
          200: '#0d0d0d',
          300: '#141414',
          400: '#1b1b1b',
          500: '#222222',
          600: '#4e4e4e',
          700: '#7a7a7a',
          800: '#a6a6a6',
          900: '#d3d3d3'
        },
        linen: {
          DEFAULT: '#fef5e9',
          100: '#5d3604',
          200: '#b96d09',
          300: '#f59f2e',
          400: '#f9c98a',
          500: '#fef5e9',
          600: '#fef6ec',
          700: '#fef8f0',
          800: '#fffbf5',
          900: '#fffdfa'
        },
        meal: {
          cream: '#fffaf4',
          paper: '#fffdfa',
          ink: '#222222',
          muted: '#4e4e4e',
          line: '#d5dfdb',
          sage: '#8da99c',
          herb: '#29b592',
          harvest: '#f59f2e',
          tomato: '#C95842'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ],
        display: [
          'Fraunces',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif'
        ]
      },
      boxShadow: {
        soft: '0 18px 50px -32px rgb(41 37 31 / 0.45)'
      }
    }
  }
}
