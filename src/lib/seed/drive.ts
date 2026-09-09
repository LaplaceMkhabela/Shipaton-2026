/**
 * Google Drive media registry for the seeded backend (issue #2).
 *
 * Every file lives in the shared Shipaton_2026 Drive folder:
 * https://drive.google.com/drive/folders/1czP7C6_LVdvYjimW0igS_iVeR-da7Jce
 *
 * We stream via `drive.usercontent.google.com`, which serves `video/mp4` with
 * HTTP range support (verified: 206 Partial Content), so AVPlayer/ExoPlayer
 * can seek instead of buffering the whole clip. The `export=download&confirm=t`
 * query bypasses Drive's virus-scan interstitial for public files.
 *
 * NOTE: Drive is not a CDN. A real backend serves these from Supabase Storage
 * (see schema.txt) — this exists so the feed runs while issue #2 is open.
 */

export const DRIVE = {
  // Introduction to Calculus — Dr. Elara Voss (10 lessons)
  calc_what_is_a_limit: '14vIG2tegIAVYKvLgcPSUukSGpRbuYIub',
  calc_one_sided_limits: '1abgDhkmQmueIJG6bMYkMr9A9cRUoL01d',
  calc_limit_notation: '1Gbp-i_deC7TvNGNA8eIRq6TDKnzwV1XM',
  calc_computing_limits: '1afh4I4JvUlgo0Q6uBDeIR_xmoJnJPlLp',
  calc_limits_at_infinity: '1dE1Y1yvKRdFpQF_U9g5RaFaI16bEhDy_',
  calc_infinite_limits: '1qjn_A9U4gf6N0DC1957W4jaxsUPm52ih',
  calc_continuity_defined: '16KVryLz6AqEHZzhOHz6ssUM1qbXIIc4f',
  calc_discontinuities: '1Ksxoblb2PMZQ-6pKMQGZpe4UdAiPOY3n',
  calc_ivt: '1lz3KmAPsuBFcODh0fasaZMbocyT0SGkS',
  calc_summary: '1UTCsiwsFjsB5uJkG7ykS6U--7XC_7UQ2',

  // Learning the Piano — Julian Keys (9 lessons)
  piano_welcome: '1L5B-GTbvs5iy4Wx7mF3RuUF9D-IkCc5s',
  piano_keyboard: '13EtM40DFj3jaFKdTrbyWuz4C0uhLPHp4',
  piano_middle_c: '1y-kD6m_L1z-obVloYEkeH1dhY-rZpR2R',
  piano_finger_numbers: '1euBD50naFWeslHNRYB8o2h6-eS7H1X9m',
  piano_rhythm: '1Vb-8cu5OEABGlGXAwkLYYNorO7IJVaA_',
  piano_notes: '14QJ-qLvABArD5EwBN7oicSPyCsc0h-cx',
  piano_chords: '11_CzfTejnAg6lZVngeMvHWJ88aaZed_i',
  piano_scales: '1oZHib7eTOUfHgz2QCYrK6SwJ7-PpakCX',
  piano_simple_music: '1wK7Q2_JGzQzP8Fv-pr5oy28aFCFCdZZq',

  // Saving Money — Elias Vance (9 lessons)
  money_audit: '1Tf824sTrBPvFNyNVFnaITb0h5_esWUeq',
  money_automate_buckets: '1wwojPGz4eVlO8UxSZKH2Fmcsqt9-HRaZ',
  money_automate_savings: '10rFZwibESGcreodykJR98oCBeZkb3sL8',
  money_compound_interest: '15vqfCXXjmvJ57vnjv0sqbmFN-ZZ61zGM',
  money_emergency_fund: '1pQNE2ZloNESbANJ0VbXIetZeQuYpz6at',
  money_gamify: '1n-OVK_9ED3Cc9BezYg_olD3cCAwAL0NL',
  money_high_yield: '1o4mNXyDF3J_Uzx9XhEt-kpuACw8jJSS4',
  money_micro_savings: '1wxXuXyQlNS8YjvnUBZcF2SbK-6h_TWyd',
  money_write_goal: '1HBG_YmoI-_6QA7EjpzDArTmItmWUg8LJ',
} as const;

export type DriveKey = keyof typeof DRIVE;

export function driveVideo(key: DriveKey): string {
  return `https://drive.usercontent.google.com/download?id=${DRIVE[key]}&export=download&confirm=t`;
}