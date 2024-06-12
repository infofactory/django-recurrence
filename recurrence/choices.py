from django.utils.translation import gettext_lazy as _
from django.utils import dates

import recurrence


FREQUENCY_CHOICES = (
    (recurrence.SECONDLY, _('secondly').capitalize()),
    (recurrence.MINUTELY, _('minutely').capitalize()),
    (recurrence.HOURLY, _('hourly').capitalize()),
    (recurrence.DAILY, _('daily').capitalize()),
    (recurrence.WEEKLY, _('weekly').capitalize()),
    (recurrence.MONTHLY, _('monthly').capitalize()),
    (recurrence.YEARLY, _('annually').capitalize()),
)

WEEKDAY_CHOICES = (
    (recurrence.MONDAY, dates.WEEKDAYS[recurrence.MONDAY.number]),
    (recurrence.TUESDAY, dates.WEEKDAYS[recurrence.TUESDAY.number]),
    (recurrence.WEDNESDAY, dates.WEEKDAYS[recurrence.WEDNESDAY.number]),
    (recurrence.THURSDAY, dates.WEEKDAYS[recurrence.THURSDAY.number]),
    (recurrence.FRIDAY, dates.WEEKDAYS[recurrence.FRIDAY.number]),
    (recurrence.SATURDAY, dates.WEEKDAYS[recurrence.SATURDAY.number]),
    (recurrence.SUNDAY, dates.WEEKDAYS[recurrence.SUNDAY.number]),
)

MONTH_CHOICES = (
    (recurrence.JANUARY, dates.MONTHS[recurrence.JANUARY]),
    (recurrence.FEBRUARY, dates.MONTHS[recurrence.FEBRUARY]),
    (recurrence.MARCH, dates.MONTHS[recurrence.MARCH]),
    (recurrence.APRIL, dates.MONTHS[recurrence.APRIL]),
    (recurrence.MAY, dates.MONTHS[recurrence.MAY]),
    (recurrence.JUNE, dates.MONTHS[recurrence.JUNE]),
    (recurrence.JULY, dates.MONTHS[recurrence.JULY]),
    (recurrence.AUGUST, dates.MONTHS[recurrence.AUGUST]),
    (recurrence.SEPTEMBER, dates.MONTHS[recurrence.SEPTEMBER]),
    (recurrence.OCTOBER, dates.MONTHS[recurrence.OCTOBER]),
    (recurrence.NOVEMBER, dates.MONTHS[recurrence.NOVEMBER]),
    (recurrence.DECEMBER, dates.MONTHS[recurrence.DECEMBER]),
)

EXCLUSION = False
INCLUSION = True
MODE_CHOICES = (
    (INCLUSION, _('including').capitalize()),
    (EXCLUSION, _('excluding').capitalize()),
)
