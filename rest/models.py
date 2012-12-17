from django.db import models

"""
Testing objects for the API:

    <Dummy> * - * <DummyStuff>
      *
      |
      1
    <DummyType>

"""

class DummyStuff(models.Model):
    name = models.CharField(max_length=255)


class DummyType(models.Model):
    name = models.CharField(max_length=255)
    clearof = models.OneToOneField('self', related_name='clearedby', null=True)

    def __unicode__(self):
        return "DT_%d" % self.id


class Dummy(models.Model):
    name = models.CharField(max_length=255)
    dummy_type = models.ForeignKey(DummyType, null=True)
    dummy_stuff = models.ManyToManyField(DummyStuff)


class SecurityTest(models.Model):
    name = models.CharField(max_length=255)
