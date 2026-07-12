"""Delete topics (and exams left with no topics) that hold no questions.

Re-importing a CSV upserts questions by (course, code). When a question's
Section/Category changes it moves to a new Exam/Topic, which can leave the old
ones empty — they then clutter the dashboard as "0 questions" rows. New imports
prune these automatically (see courses.importer), but this command cleans up
data imported before that behaviour existed.

    python manage.py prune_empty_topics            # every course
    python manage.py prune_empty_topics --course 3 # one course by id
    python manage.py prune_empty_topics --dry-run  # report only, delete nothing
"""

from django.core.management.base import BaseCommand, CommandError

from courses.models import Course, Exam, Topic


class Command(BaseCommand):
    help = "Delete topics with no questions and exams left with no topics."

    def add_arguments(self, parser) -> None:
        parser.add_argument("--course", type=int, help="Restrict to a single course id.")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would be deleted without deleting anything.",
        )

    def handle(self, *args, **options) -> None:
        topics = Topic.objects.filter(questions__isnull=True)
        exams = Exam.objects.filter(topics__isnull=True)
        if options["course"] is not None:
            if not Course.objects.filter(pk=options["course"]).exists():
                raise CommandError(f"No course with id {options['course']}.")
            topics = topics.filter(exam__course_id=options["course"])
            exams = exams.filter(course_id=options["course"])

        if options["dry_run"]:
            for t in topics:
                self.stdout.write(f"would delete topic '{t.name}' (exam '{t.exam.name}')")
            # Report only exams that are *already* empty; pruning topics below can
            # empty more, but a dry run must not compute that by mutating data.
            for e in exams:
                self.stdout.write(f"would delete exam '{e.name}'")
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {topics.count()} topic(s), {exams.count()} exam(s) already empty."
                )
            )
            return

        topics_deleted, _ = topics.delete()
        # Re-evaluate exams after topic deletion — some may only now be empty.
        exams_deleted, _ = exams.delete()
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {topics_deleted} empty topic(s) and {exams_deleted} empty exam(s)."
            )
        )
