-- Denormalised lesson_count on courses — same rationale as lessons.like_count
-- in 0001_init.sql. getFeed must return course title + lesson count in the
-- same call as the feed page (API.md gotcha), and schema.txt's guiding
-- principle #2 rules out a live aggregate on the hot path. A trigger-kept
-- column is the established pattern here, not a new one.

alter table courses add column lesson_count int not null default 0;

update courses c
set lesson_count = (
  select count(*) from lessons l
  where l.course_id = c.id and l.published
);

create function bump_course_lesson_count() returns trigger language plpgsql as $$
declare
  old_counts boolean := tg_op <> 'INSERT' and old.published and old.course_id is not null;
  new_counts boolean := tg_op <> 'DELETE' and new.published and new.course_id is not null;
begin
  if tg_op = 'DELETE' then
    if old_counts then
      update courses set lesson_count = lesson_count - 1 where id = old.course_id;
    end if;
    return old;
  end if;

  if old_counts and new_counts and old.course_id is distinct from new.course_id then
    update courses set lesson_count = lesson_count - 1 where id = old.course_id;
    update courses set lesson_count = lesson_count + 1 where id = new.course_id;
  elsif old_counts and not new_counts then
    update courses set lesson_count = lesson_count - 1 where id = old.course_id;
  elsif new_counts and not old_counts then
    update courses set lesson_count = lesson_count + 1 where id = new.course_id;
  end if;

  return new;
end $$;

create trigger lessons_course_count_trg after insert or update or delete on lessons
  for each row execute function bump_course_lesson_count();
