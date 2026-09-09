# Shared Drive — Media Folder Map

Reference for navigating the shared `Shipaton_2026` Drive folder. Every asset the
seed backend (see `API.md`, `schema.txt`) streams is stored here and registered in
[`src/lib/seed/drive.ts`](../src/lib/seed/drive.ts).

- Root folder: <https://drive.google.com/drive/folders/1czP7C6_LVdvYjimW0igS_iVeR-da7Jce>
- Media is streamed through `drive.usercontent.google.com` with the file IDs below
  (`driveVideo()` / `driveImage()` in `drive.ts`).

## Folder structure

```
Shipaton_2026/                          # shared root (see URL above)
├── Introduction to Calculus/           # Dr. Elara Voss
│   ├── creator.png                     # avatar — calc_creator_image
│   ├── What is a Limit.mp4             # 14vIG2tegIAVYKvLgcPSUukSGpRbuYIub
│   ├── One-Sided Limits.mp4
│   ├── Limit Notation.mp4
│   ├── Computing Limits Algebraically.mp4
│   ├── Limits at Infinity.mp4
│   ├── Infinite Limits.mp4
│   ├── Continuity Defined.mp4
│   ├── Types of Discontinuities.mp4
│   ├── Intermediate Value Theorem.mp4
│   └── Limit & Continuity Summary.mp4
├── Learning the Piano/                 # Julian Keys
│   ├── creator.png                     # avatar — piano_creator_image
│   ├── Welcome to Piano.mp4
│   ├── Understanding the Keyboard.mp4
│   ├── Finding Middle C.mp4
│   ├── Finger Numbers.mp4
│   ├── Rhythm.mp4
│   ├── Notes.mp4
│   ├── Chords.mp4
│   ├── Scales.mp4
│   └── Playing Simple Music.mp4
└── Saving Money/                       # Elias Vance
    ├── creator.png                     # avatar — money_creator_image
    ├── Write Your Savings Goal.mp4
    ├── Micro-Savings.mp4
    ├── Gamify Your Savings.mp4
    ├── Automate Your Savings.mp4
    ├── Emergency Fund Shield.mp4
    ├── High-Yield Savings.mp4
    ├── Automate Wealth Buckets.mp4
    ├── Compound Interest.mp4
    └── Audit Your Expenses.mp4
```

Each folder holds the free lessons (the ones already in the feed) and a
`creator.png` at the folder root. Paid lessons are outlined in
`src/lib/seed/courses.ts` but have no Drive media yet.

## Conventions

- **Naming**: Drive file names are human-readable lesson titles.
- **Codex keys**: `src/lib/seed/drive.ts` uses slugified snake_case
  (`<course>_<lesson>`); creator avatars are exactly
  `{course}_creator_image`. Every Drive file above has a matching key there so
  UI code never holds raw IDs.
- **Streaming**: lessons use `driveVideo()` (`export=download&confirm=t`, bypasses
  the virus-scan interstitial); images use `driveImage()`. Playback is verified to
  support range requests (206) so players can seek.
- **Authority**: `drive.ts` is the source of truth for IDs — if you add or move a
  file in Drive, update both the key table below and `drive.ts` together.

## Key → file ID index

| Key | File | Drive ID |
| --- | --- | --- |
| `calc_creator_image` | Introduction to Calculus/creator.png | `1safKUhSaM8STkRFF5rzdb4EM8QtxCPBv` |
| `calc_what_is_a_limit` | Introduction to Calculus/What is a Limit.mp4 | `14vIG2tegIAVYKvLgcPSUukSGpRbuYIub` |
| `calc_one_sided_limits` | Introduction to Calculus/One-Sided Limits.mp4 | `1abgDhkmQmueIJG6bMYkMr9A9cRUoL01d` |
| `calc_limit_notation` | Introduction to Calculus/Limit Notation.mp4 | `1Gbp-i_deC7TvNGNA8eIRq6TDKnzwV1XM` |
| `calc_computing_limits` | Introduction to Calculus/Computing Limits Algebraically.mp4 | `1afh4I4JvUlgo0Q6uBDeIR_xmoJnJPlLp` |
| `calc_limits_at_infinity` | Introduction to Calculus/Limits at Infinity.mp4 | `1dE1Y1yvKRdFpQF_U9g5RaFaI16bEhDy_` |
| `calc_infinite_limits` | Introduction to Calculus/Infinite Limits.mp4 | `1qjn_A9U4gf6N0DC1957W4jaxsUPm52ih` |
| `calc_continuity_defined` | Introduction to Calculus/Continuity Defined.mp4 | `16KVryLz6AqEHZzhOHz6ssUM1qbXIIc4f` |
| `calc_discontinuities` | Introduction to Calculus/Types of Discontinuities.mp4 | `1Ksxoblb2PMZQ-6pKMQGZpe4UdAiPOY3n` |
| `calc_ivt` | Introduction to Calculus/Intermediate Value Theorem.mp4 | `1lz3KmAPsuBFcODh0fasaZMbocyT0SGkS` |
| `calc_summary` | Introduction to Calculus/Limit & Continuity Summary.mp4 | `1UTCsiwsFjsB5uJkG7ykS6U--7XC_7UQ2` |
| `piano_creator_image` | Learning the Piano/creator.png | `1QH-FxKfwrWUb9K_R2RqnVtQ3_SKUBKrz` |
| `piano_welcome` | Learning the Piano/Welcome to Piano.mp4 | `1L5B-GTbvs5iy4Wx7mF3RuUF9D-IkCc5s` |
| `piano_keyboard` | Learning the Piano/Understanding the Keyboard.mp4 | `13EtM40DFj3jaFKdTrbyWuz4C0uhLPHp4` |
| `piano_middle_c` | Learning the Piano/Finding Middle C.mp4 | `1y-kD6m_L1z-obVloYEkeH1dhY-rZpR2R` |
| `piano_finger_numbers` | Learning the Piano/Finger Numbers.mp4 | `1euBD50naFWeslHNRYB8o2h6-eS7H1X9m` |
| `piano_rhythm` | Learning the Piano/Rhythm.mp4 | `1Vb-8cu5OEABGlGXAwkLYYNorO7IJVaA_` |
| `piano_notes` | Learning the Piano/Notes.mp4 | `14QJ-qLvABArD5EwBN7oicSPyCsc0h-cx` |
| `piano_chords` | Learning the Piano/Chords.mp4 | `11_CzfTejnAg6lZVngeMvHWJ88aaZed_i` |
| `piano_scales` | Learning the Piano/Scales.mp4 | `1oZHib7eTOUfHgz2QCYrK6SwJ7-PpakCX` |
| `piano_simple_music` | Learning the Piano/Playing Simple Music.mp4 | `1wK7Q2_JGzQzP8Fv-pr5oy28aFCFCdZZq` |
| `money_creator_image` | Saving Money/creator.png | `1QYFWHco88ExVlLllyfKfQBgI1iBHmz6A` |
| `money_audit` | Saving Money/Audit Your Expenses.mp4 | `1Tf824sTrBPvFNyNVFnaITb0h5_esWUeq` |
| `money_automate_buckets` | Saving Money/Automate Wealth Buckets.mp4 | `1wwojPGz4eVlO8UxSZKH2Fmcsqt9-HRaZ` |
| `money_automate_savings` | Saving Money/Automate Your Savings.mp4 | `10rFZwibESGcreodykJR98oCBeZkb3sL8` |
| `money_compound_interest` | Saving Money/Compound Interest.mp4 | `15vqfCXXjmvJ57vnjv0sqbmFN-ZZ61zGM` |
| `money_emergency_fund` | Saving Money/Emergency Fund Shield.mp4 | `1pQNE2ZloNESbANJ0VbXIetZeQuYpz6at` |
| `money_gamify` | Saving Money/Gamify Your Savings.mp4 | `1n-OVK_9ED3Cc9BezYg_olD3cCAwAL0NL` |
| `money_high_yield` | Saving Money/High-Yield Savings.mp4 | `1o4mNXyDF3J_Uzx9XhEt-kpuACw8jJSS4` |
| `money_micro_savings` | Saving Money/Micro-Savings.mp4 | `1wxXuXyQlNS8YjvnUBZcF2SbK-6h_TWyd` |
| `money_write_goal` | Saving Money/Write Your Savings Goal.mp4 | `1HBG_YmoI-_6QA7EjpzDArTmItmWUg8LJ` |