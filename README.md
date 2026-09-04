# Shipaton 2026

A short-form video app for learning — you scroll a vertical feed the way you'd scroll TikTok, except every clip is a byte-sized lesson. For course creators, the feed is the top of the funnel: free micro-lessons that earn attention and lead into their paid courses.

## The idea

Course creators have a discovery problem. Their paid courses live behind a landing page nobody visits, and the platforms where audiences actually are aren't built to convert viewers into students.

This app closes that gap:

- **Learners** open the app and scroll. Each clip teaches one small thing in under a minute. Scrolling is how you discover more content, not a distraction from it.
- **Creators** upload byte-sized lessons and attach them to a course. A lesson that lands becomes an ad that doesn't feel like one.
- **The funnel** runs from feed → creator profile → course page → purchase, without the learner ever leaving the app.

The bet is that the same mechanic that makes short-form video addictive also makes it a good teaching format, provided each clip is self-contained and the next step is always one tap away.

## How it works

**For learners**

- Vertical, full-screen feed of lessons that auto-play as you scroll
- Follow creators and topics to shape what you get served
- Save lessons to come back to
- When a lesson belongs to a course, a CTA surfaces the full course inline

**For creators**

- Upload short lessons from the phone
- Group lessons into a course and mark which are free teasers vs. paid
- Point the free feed content at the paid course
- See which lessons actually convert to course views and purchases

## Status

Early. The concept is defined and the stack is chosen; the app itself isn't built yet.

## Planned stack

| Layer | Choice | Why |
|---|---|---|
| App | Expo / React Native | One codebase to both app stores, `expo-video` handles the feed |
| Backend | Supabase | Postgres + Auth + Storage in one; courses and lessons are relational data |
| Payments | RevenueCat | Cross-platform subscriptions and course purchases without per-store billing code |

## Roadmap

1. Vertical lesson feed with smooth scroll-to-play
2. Auth and creator profiles
3. Lesson upload and course grouping
4. Course landing page reached from the feed
5. Paywall and entitlement checks
6. Creator analytics on funnel conversion

## License

See [LICENSE](./LICENSE).
