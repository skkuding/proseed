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
    },
  },
}

export default config
