import uuid

from django.db import migrations, models


def populate_share_tokens(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    for course in Course.objects.all():
        course.share_token = uuid.uuid4()
        course.save(update_fields=["share_token"])


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0001_initial"),
    ]

    operations = [
        # Add the column nullable/non-unique first so existing rows can each get
        # their own token, then tighten to the unique constraint.
        migrations.AddField(
            model_name="course",
            name="share_token",
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.RunPython(populate_share_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="course",
            name="share_token",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
