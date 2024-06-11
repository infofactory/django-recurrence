function initRecurrenceWidget(name) {
  const input = document.getElementById(name);
  if (!input) return;

  const container = input.parentNode;
  if (!container) return;

  if (!recurrence.display) recurrence.display = {};
  if (!recurrence.display.translations_loaded) {
    recurrence.display = {
      ...recurrence.display,
      ...JSON.parse(container.getElementsByClassName('recurrence-display-i18n')[0].textContent),
      translations_loaded: true
    };
  }

  new recurrence.widget.Widget(input, {});
}
