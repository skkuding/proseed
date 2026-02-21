import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['var(--font-pretendard)'],
      },
      fontSize: {
        // ── Heading ──────────────────────────────────────────
        head0_sb_52: ['52px', { lineHeight: '130%', letterSpacing: '-0.04em', fontWeight: '600' }],
        head1_sb_42: ['42px', { lineHeight: '130%', letterSpacing: '-0.04em', fontWeight: '600' }],
        head2_m_42: ['42px', { lineHeight: '130%', letterSpacing: '-0.04em', fontWeight: '500' }],
        head3_sb_36: ['36px', { lineHeight: '130%', letterSpacing: '-0.04em', fontWeight: '600' }],
        head4_m_36: ['36px', { lineHeight: '130%', letterSpacing: '-0.04em', fontWeight: '500' }],

        // ── title ─────────────────────────────────────────────
        title1_sb_24: ['24px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '600' }],
        title2_m_24: ['24px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '500' }],
        title3_sb_20: ['20px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '600' }],
        title4_m_20: ['20px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '500' }],

        // ── Sub ──────────────────────────────────────────────
        sub1_sb_18: ['18px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '600' }],
        sub2_m_18: ['18px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '500' }],
        sub3_sb_16: ['16px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '600' }],
        sub4_sb_14: ['14px', { lineHeight: '140%', letterSpacing: '-0.04em', fontWeight: '600' }],

        // ── Body ────────────────────────────────────────────
        body1_m_16: ['16px', { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '500' }],
        body2_m_14: ['14px', { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '500' }],
        body3_r_16: ['16px', { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '400' }],
        body4_r_14: ['14px', { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '400' }],
        // ── Caption ──────────────────────────────────────────
        caption1_m_13: [
          '13px',
          { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '500' },
        ],
        caption2_m_12: [
          '12px',
          { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '500' },
        ],
        caption3_r_13: [
          '13px',
          { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '400' },
        ],
        caption4_r_12: [
          '12px',
          { lineHeight: '160%', letterSpacing: '-0.04em', fontWeight: '400' },
        ],
      },
      colors: {
        primary: {
          DEFAULT: '#FF754F',
          strong: '#F65225',
          light: '#FFF1ED',
        },
        white: '#FFFFFF',
        black: '#0D0D0D',
        neutral: {
          99: '#F5F5F5',
          95: '#E5E5E5',
          90: '#C4C4C4',
          80: '#B0B0B0',
          70: '#9B9B9B',
          60: '#8A8A8A',
          50: '#737373',
          40: '#5C5C5C',
          30: '#474747',
          20: '#2A2A2A',
          15: '#1C1C1C',
          10: '#171717',
          5: '#0F0F0F',
        },
        CoolNeutral: {
          99: '#F2F6F7',
          95: '#E9EEF0',
          90: '#DCE3E5',
          80: '#C4CACC',
          70: '#AAB1B2',
          60: '#909799',
          50: '#787E80',
          40: '#5F6566',
          30: '#484C4D',
          20: '#303333',
          15: '#242626',
          10: '#191A1A',
          5: '#141414',
        },
        background: {
          normal: '#F4F4F6',
        },
      },
    },
  },
}

export default config
