/**
 * Seed lessons so the feed runs with no backend.
 *
 * Shaped like the `FeedLesson` contract in API.md, so switching to the real
 * `getFeed` query is an import change rather than a rewrite.
 *
 * The videos are Google's public sample clips — stable, no auth, no rate
 * limits. They're landscape and obviously not lessons; they exist to exercise
 * the player. Real vertical content arrives with GitHub issue #2.
 */

export type SeedCreator = {
  id: string;
  handle: string;
  displayName: string;
};

export type SeedCourse = {
  id: string;
  title: string;
  lessonCount: number;
};

export type FeedLesson = {
  id: string;
  title: string;
  topic: string;
  videoUrl: string;
  durationSeconds: number;
  likeCount: number;
  viewCount: number;
  creator: SeedCreator;
  /** null = standalone top-of-funnel clip. Drives whether the CTA card shows. */
  course: SeedCourse | null;
};

const CREATORS: Record<string, SeedCreator> = {
  thandi: { id: 'c1', handle: 'thandishoots', displayName: 'Thandi Nkosi' },
  marco: { id: 'c2', handle: 'marcocooks', displayName: 'Marco Bianchi' },
  ayesha: { id: 'c3', handle: 'ayeshafinance', displayName: 'Ayesha Patel' },
  dave: { id: 'c4', handle: 'davesixstrings', displayName: 'Dave Mokoena' },
};

const COURSES: Record<string, SeedCourse> = {
  photo: { id: 'co1', title: 'Phone Photography That Looks Expensive', lessonCount: 14 },
  knife: { id: 'co2', title: 'Knife Skills in One Weekend', lessonCount: 9 },
  money: { id: 'co3', title: 'Your First R10,000 Invested', lessonCount: 11 },
};

const V = (name: string) =>
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`;

export const seedLessons: FeedLesson[] = [
  {
    id: 'l1',
    title: 'Why your photos look flat (and the one fix)',
    topic: 'Photography',
    videoUrl: V('BigBuckBunny'),
    durationSeconds: 48,
    likeCount: 1284,
    viewCount: 21400,
    creator: CREATORS.thandi,
    course: COURSES.photo,
  },
  {
    id: 'l2',
    title: 'Hold your knife like this, not like that',
    topic: 'Cooking',
    videoUrl: V('ElephantsDream'),
    durationSeconds: 39,
    likeCount: 892,
    viewCount: 15200,
    creator: CREATORS.marco,
    course: COURSES.knife,
  },
  {
    id: 'l3',
    title: 'Compound interest, explained with a jar',
    topic: 'Money',
    videoUrl: V('ForBiggerBlazes'),
    durationSeconds: 55,
    likeCount: 3410,
    viewCount: 68900,
    creator: CREATORS.ayesha,
    course: COURSES.money,
  },
  {
    id: 'l4',
    title: 'The only 4 chords you need this week',
    topic: 'Guitar',
    videoUrl: V('ForBiggerEscapes'),
    durationSeconds: 42,
    likeCount: 620,
    viewCount: 9800,
    creator: CREATORS.dave,
    course: null, // standalone — no CTA card
  },
  {
    id: 'l5',
    title: 'Golden hour is a lie. Shoot at this time instead',
    topic: 'Photography',
    videoUrl: V('ForBiggerFun'),
    durationSeconds: 51,
    likeCount: 2145,
    viewCount: 40300,
    creator: CREATORS.thandi,
    course: COURSES.photo,
  },
  {
    id: 'l6',
    title: 'Salt earlier. Here is why it matters',
    topic: 'Cooking',
    videoUrl: V('ForBiggerJoyrides'),
    durationSeconds: 36,
    likeCount: 1502,
    viewCount: 27700,
    creator: CREATORS.marco,
    course: COURSES.knife,
  },
  {
    id: 'l7',
    title: 'Emergency fund before investing. Always',
    topic: 'Money',
    videoUrl: V('ForBiggerMeltdowns'),
    durationSeconds: 47,
    likeCount: 980,
    viewCount: 18600,
    creator: CREATORS.ayesha,
    course: COURSES.money,
  },
  {
    id: 'l8',
    title: 'Your strumming hand is too tense',
    topic: 'Guitar',
    videoUrl: V('Sintel'),
    durationSeconds: 44,
    likeCount: 733,
    viewCount: 12100,
    creator: CREATORS.dave,
    course: null,
  },
  {
    id: 'l9',
    title: 'Portrait mode vs. actually moving closer',
    topic: 'Photography',
    videoUrl: V('SubaruOutbackOnStreetAndDirt'),
    durationSeconds: 53,
    likeCount: 1876,
    viewCount: 33400,
    creator: CREATORS.thandi,
    course: COURSES.photo,
  },
  {
    id: 'l10',
    title: 'A dull knife is the dangerous one',
    topic: 'Cooking',
    videoUrl: V('TearsOfSteel'),
    durationSeconds: 40,
    likeCount: 2290,
    viewCount: 51800,
    creator: CREATORS.marco,
    course: COURSES.knife,
  },
  {
    id: 'l11',
    title: 'Fees eat more than you think',
    topic: 'Money',
    videoUrl: V('VolkswagenGTIReview'),
    durationSeconds: 49,
    likeCount: 4102,
    viewCount: 88200,
    creator: CREATORS.ayesha,
    course: COURSES.money,
  },
  {
    id: 'l12',
    title: 'Practise slower than feels useful',
    topic: 'Guitar',
    videoUrl: V('WeAreGoingOnBullrun'),
    durationSeconds: 38,
    likeCount: 545,
    viewCount: 7400,
    creator: CREATORS.dave,
    course: null,
  },
];
