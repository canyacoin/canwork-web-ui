/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  theme: {
    fontSize: {
      h1: '56px',
      h2: '48px',
      h3: '40px',
      h4: '32px',
      h5: '24px',
      h6: '20px',
      b1: '16px',
      b2: '14px',
      b3: '12px',
    },
    screens: {
      xxs: '425px',
      xs: '500px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: "'General Sans', sans-serif",
      },
      colors: {
        // Neutral
        N0: '#ffffff',
        N10: '#fafafb',
        N20: '#f6f6f6',
        N30: '#eceded',
        N40: '#e1e1e2',
        N50: '#c5c6c8',
        N60: '#b7b8ba',
        N70: '#abadaf',
        N80: '#9d9fa2',
        N90: '#8f9295',
        N100: '#818488',
        N200: '#73767a',
        N300: '#65696d',
        N400: '#5a5d62',
        N500: '#4c4f55',
        N600: '#40444a',
        N700: '#30343a',
        N800: '#22262d',
        N900: '#161b22',
        // Cyan
        C100: '#ebf9ff',
        C200: '#aee6ff',
        C300: '#54A6FD',
        C400: '#5BCCFF',
        C500: '#3AC2FF',
        C600: '#2988B3',
        C700: '#23769C',
        C800: '#005E89',
        // Blue
        B50: '#e6f0ff',
        B75: '#97c0ff',
        B100: '#6ca6ff',
        B200: '#2c7fff',
        B300: '#0165ff',
        B400: '#0147b3',
        B500: '#013e9c',
        // Red
        R50: '#ffece8',
        R75: '#ffb09f',
        R100: '#ff9077',
        R200: '#ff603c',
        R300: '#ff3f14',
        R400: '#b32c0e',
        R500: '#9c260c ',
        // Yellow
        Y50: '#fef6e6',
        Y75: '#f9d999',
        Y100: '#f6c96e',
        Y200: '#f3b230',
        Y300: '#f0a205',
        Y400: '#a87104',
        Y500: '#926303',
        // Gray
        G0: '#FFF',
        G50: '#F8FAFC',
        G100: '#F1F5F9',
        G200: '#E2E8F0',
        G300: '#CBD5E1',
        G400: '#94A3B8',
        G500: '#64748B',
        G600: '#475569',
        G700: '#334155',
        G800: '#1E293B',
        G900: '#0F172A',
        // Secondary colors
        black: '#000000',
        white: '#FFFFFF',
        mint: '#4ED7BE',
        yellow: '#FCBA00',
        orange: '#F74C53',
        violet: '#F18FD1',
        lightGreen: '#2CE8DA',
        // background colors
        'blue-10': 'rgba(58, 194, 255, 0.10)',
        'blue-50': 'rgba(58, 194, 255, 0.50)',
        'blue-500': 'rgba(0, 159, 230, 0.50)',
        //gradients
        'start-g1': '#FFC600',
        'end-g1': '#F74C53',
        'start-g2': '#F18FD1',
        'end-g2': '#39C2FF',
        'start-g3': '#39C2FF',
        'end-g3': '#1264B4',
        'start-g4': '#4ED7BE',
        'end-g4': '#39C2FF',
        'start-g5': '#F74C53',
        'end-g5': '#F18FD1',
        'start-g6': '#4ED7BE',
        'end-g6': '#FCBA00',
        'start-g7': '#F18FD1',
        'end-g7': '#1264B4',
        'start-g8': '#FCBA00',
        'end-g8': '#F18FD1',
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/massimo/images/landing-top-bg.png')",
      },
      boxShadow: {
        community:
          '0px 4px 4px -2px rgba(140, 154, 172, 0.50), 0px 5px 15px 0px rgba(170, 181, 196, 0.50), 0px -4px 4px 0px #D8DFE8 inset',
        basicButton:
          '0px 4px 10px -2px rgba(0, 0, 0, 0.05), 0px 2px 2px -1px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
