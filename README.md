> [!NOTE]  
> This is a fork of [jazzband/django-recurrence](https://github.com/jazzband/django-recurrence)
> that has been modified to the core and can't be easily upstreamed without accepting blindly all changes

# django-recurrence

[![Stars](https://img.shields.io/github/stars/infofactory/django-recurrence.svg?label=Stars&style=social)](https://github.com/infofactory/django-recurrence)

django-recurrence is a utility for working with recurring dates in Django.

## Functionality

* Recurrence/Rule objects using a subset of rfc2445  
  (wraps ``dateutil.rrule``) for specifying recurring dates,
* ``RecurrenceField`` for storing recurring datetimes in the database, and
* JavaScript widget.

``RecurrenceField`` provides a Django model field which serializes
recurrence information for storage in the database.

For example - say you were storing information about a university course
in your app. You could use a model like this:

```python
from recurrence.fields import RecurrenceField

class Course(models.Model):
    title = models.CharField(max_length=200)
    start = models.TimeField()
    end = models.TimeField()
    recurrences = RecurrenceField()
```

You’ll notice that I’m storing my own start and end time.  
The recurrence field only deals with *recurrences*
not with specific time information.  
I have an event that starts at 2pm.
Its recurrences would be “every Friday”.


## Documentation
> [!WARNING]  
> Currently there is no documentation for this fork, you can check the original documentation here

https://django-recurrence.readthedocs.io/


## Issues

If you have questions or have trouble using the app please file a bug report at:

https://github.com/infofactory/django-recurrence/issues


## Contributions

All contributions are welcome!

It is best to separate proposed changes and PRs into small, distinct patches
by type so that they can be merged faster into upstream and released quicker.

One way to organize contributions would be to separate PRs for e.g.

* bugfixes,
* new features,
* code and design improvements,
* documentation improvements, or
* tooling and CI improvements.

Merging contributions requires passing the checks configured
with the CI. This includes running tests and linters successfully
on the currently officially supported Python and Django versions.

The test automation is run automatically with GitHub Actions, but you can
run it locally with the ``tox`` command before pushing commits.
