if (!recurrence) var recurrence = {};
recurrence.widget = {};

recurrence.widget.INCLUSION = true;
recurrence.widget.EXCLUSION = false;

recurrence.widget.date_today = function() {
  var date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
};

recurrence.widget.Widget = function(textarea, options){
  this.init(textarea, options);
}
recurrence.widget.Widget.prototype = {
  init: function(textarea, options){
    if (textarea.toLowerCase) textarea = document.getElementById(container);
    this.selected_panel = null;
    this.panels = [];
    this.data = recurrence.deserialize(textarea.value);
    this.textarea = textarea;
    this.options = options;

    this.default_freq = options.default_freq || recurrence.WEEKLY;

    this.init_dom();
    this.init_panels();
  },
  init_dom: function() {
    const widget = this;
    const container = this.textarea.parentNode;
    const root = container.querySelector("div.recurrence-widget");
    const panels = root.querySelector('.panels');
    const control = root.querySelector('.control');

    const add_rule = control.querySelector('.add-rule');
    add_rule.onclick = function () {widget.add_rule();}
    const add_date = control.querySelector('.add-date');
    add_date.onclick = function () {widget.add_date();}

    this.elements = {
      'root': root,
      'panels': panels,
      'control': control
    };
  },

  init_panels: function() {
    this.data.rrules.forEach(function(rule) {
      this.add_rule_panel(recurrence.widget.INCLUSION, rule);
    }, this);
    this.data.exrules.forEach(function(item) {
      this.add_rule_panel(recurrence.widget.EXCLUSION, item);
    }, this);
    this.data.rdates.forEach(function(item) {
      this.add_date_panel(recurrence.widget.INCLUSION, item);
    }, this);
    this.data.exdates.forEach(function(item) {
        this.add_date_panel(recurrence.widget.EXCLUSION, item);
    }, this);
  },

  add_panel: function(panel, body) {
    panel.onexpand = function() {
      if (panel.widget.selected_panel && panel.widget.selected_panel != this)
        panel.widget.selected_panel.collapse();
      panel.widget.selected_panel = this;
    };
    panel.onremove = function() {
      body.remove();
    };

    this.elements.panels.appendChild(panel.elements.root);
    this.panels.push(panel);
    this.update();
    return panel;
  },

  add_rule_panel: function(mode, rule) {
    const panel = new recurrence.widget.Panel(this);
    var form = new recurrence.widget.RuleForm(panel, mode, rule);
    return this.add_panel(panel, form);
  },

  add_date_panel: function(mode, date) {
    const panel = new recurrence.widget.Panel(this);
    var form = new recurrence.widget.DateForm(panel, mode, date);
    return this.add_panel(panel, form);
  },

  add_rule: function(rule) {
    var rule = rule || new recurrence.Rule(this.default_freq);
    this.data.rrules.push(rule);
    this.add_rule_panel(recurrence.widget.INCLUSION, rule).expand();
  },

  add_date: function(date) {
    var date = date || recurrence.widget.date_today();
    this.data.rdates.push(date);
    this.add_date_panel(recurrence.widget.INCLUSION, date).expand();
  },

  update: function() {
    this.textarea.value = this.data.serialize();
  }
}

recurrence.widget.Panel = function(widget, options) {
  this.init(widget, options);
};
recurrence.widget.Panel.prototype = {
  init: function(widget, options) {
    this.collapsed = false;
    this.widget = widget;
    this.options = options || {};

    if (this.options.onremove)
      this.onremove = this.options.onremove;
    if (this.options.onexpand)
      this.onexpand = this.options.onexpand;
    if (this.options.oncollapse)
      this.oncollapse = this.options.oncollapse;

    this.init_dom();
  },

  init_dom: function() {
    const panel = this;

    const panelTemplate = this.widget.elements.root.querySelector('[data-recurrence-template="panel"]');
    const root = panelTemplate.cloneNode(true);
    delete root.dataset.recurrenceTemplate;

    const header = root.querySelector('.header');
    const body = root.querySelector('.body');

    header.onclick = function () {
      if (panel.collapsed)
          panel.expand();
      else
          panel.collapse();
    }

    remove = root.querySelector('.remove');
    remove.onclick = function () {panel.remove();}

    const label = root.querySelector('.title');

    this.elements = {
      'root': root,
      'remove': remove,
      'label': label,
      'header': header,
      'body': body
    };

    this.collapse();
  },

  set_label: function(label) {
    this.elements.label.innerHTML = label;
  },

  set_body: function(element) {
    if (this.elements.body.childNodes.length)
      this.elements.body.removeChild(this.elements.body.childNodes[0]);
    this.elements.body.appendChild(element);
  },

  expand: function() {
    this.collapsed = false;
    this.elements.body.classList.remove('hidden');
    if (this.onexpand)
      this.onexpand(this);
  },

  collapse: function() {
    this.collapsed = true;
    this.elements.body.classList.add('hidden');
    if (this.oncollapse)
      this.oncollapse(this);
  },

  remove: function() {
    var parent = this.elements.root.parentNode;
    if (parent)
      parent.removeChild(this.elements.root);
    if (this.onremove)
      this.onremove(parent);
  }
};

recurrence.widget.RuleForm = function(panel, mode, rule, options) {
  this.init(panel, mode, rule, options);
};
recurrence.widget.RuleForm.prototype = {
  init: function(panel, mode, rule, options) {
    this.selected_freq = rule.freq;
    this.panel = panel;
    this.mode = mode;
    this.rule = rule;
    this.options = options || {};

    var rule_options = {
      dtstart: rule.dtstart,
      interval: rule.interval,
      until: rule.until,
      count: rule.count,
    };

    this.freq_rules = [
      new recurrence.Rule(recurrence.YEARLY, rule_options),
      new recurrence.Rule(recurrence.MONTHLY, rule_options),
      new recurrence.Rule(recurrence.WEEKLY, rule_options),
      new recurrence.Rule(recurrence.DAILY, rule_options)
    ];
    this.freq_rules[this.rule.freq].update(this.rule);

    this.init_dom();
    this.set_freq(this.selected_freq);
  },

  init_dom: function() {
    var form = this;

    const formTemplate = this.panel.widget.elements.root.querySelector('[data-recurrence-template="rule-form"]');
    const root = formTemplate.cloneNode(true);
    delete root.dataset.recurrenceTemplate;

    const showRRuleStart = form.panel.widget.options.showRRuleStart;
    const showRRuleEnd = form.panel.widget.options.showRRuleEnd;

    // dtstart
    const dtstart_container = root.querySelector('.dtstart');
    let dtstart_date_selector;
    if (showRRuleStart) {
      const dtstart_value = this.rule.dtstart ? recurrence.date.format(this.rule.dtstart, '%Y-%m-%d') : "";
      dtstart_date_selector = dtstart_container.querySelector('input[type="date"]');
      dtstart_date_selector.value = dtstart_value;
    } else {
      dtstart_container.remove();
    }

    // mode
    const mode_container = root.querySelector('.mode');
    const mode_checkbox = mode_container.querySelector('input[name="mode"]');

    if (this.mode == recurrence.widget.EXCLUSION) {
      mode_checkbox.checked = true;
      form.panel.elements.root.classList.add('exclusion');
    }

    // interval
    const interval_container = root.querySelector('.interval');
    const interval_field = interval_container.querySelector('input[name="interval"]');
    const freq_select = interval_container.querySelector('select[name="freq"]');

    // limit container
    const limit_container = root.querySelector('.limit');
    let limit_checkbox, until_date_selector, until_radio, count_radio, count_field;
    if (showRRuleEnd) {
      limit_checkbox = limit_container.querySelector('input[name="limit"]');
      const until_count_container = limit_container.querySelector('.until-count');

      // until
      const until_value = this.rule.until ? recurrence.date.format(this.rule.until, '%Y-%m-%d') : new Date().toISOString().slice(0, 10);
      const until_container = until_count_container.querySelector('.until');
      until_date_selector = until_count_container.querySelector('input[type="date"]');
      until_radio = until_container.querySelector('input[data-name="until_count"][value="until"]');
      until_date_selector.value = until_value;

      // count
      const count_container = until_count_container.querySelector('.count');
      count_radio = count_container.querySelector('input[data-name="until_count"][value="count"]');
      count_field = count_container.querySelector('input[name="count"]');

      if (this.rule.until || this.rule.count) {
        limit_checkbox.checked = true;
      } else {
        until_radio.disabled = true;
        count_radio.disabled = true;
        until_date_selector.disabled = true;
        until_count_container.classList.add('disabled');
      }
    } else {
      limit_container.remove();
    }

    // core
    const freq_form_container = root.querySelector('.form');

    // events

    if (showRRuleStart) dtstart_date_selector.onchange = function () {
      form.set_dtstart(dtstart_date_selector.value);
    };

    mode_checkbox.onclick = function() {
      form.set_mode(this.checked ? recurrence.widget.EXCLUSION : recurrence.widget.INCLUSION);
    };

    freq_select.onchange = function() {
      form.set_freq(parseInt(this.value), 10);
    };

    interval_field.onchange = function() {
      form.set_interval(parseInt(this.value), 10);
    };

    if (showRRuleEnd) {
      limit_checkbox.onclick = function() {
        if (this.checked) {
          limit_container.classList.remove('disabled');
          until_radio.disabled = false;
          count_radio.disabled = false;
          if (until_radio.checked) {
            until_date_selector.disabled = false;
            form.set_until(until_date_selector.value);
          }
          if (count_radio.checked) {
            count_field.disabled = false;
            form.set_count(parseInt(count_field.value));
          }
        } else {
          limit_container.classList.add('disabled');
          until_radio.disabled = true;
          count_radio.disabled = true;
          until_date_selector.disabled = true;
          count_field.disabled = true;
          form.freq_rules.forEach(function(rule) {
            rule.until = null;
            rule.count = null;
          });
          form.update();
        }
      }

      if (form.rule.count) {
        count_radio.checked = true;
        until_date_selector.disabled = true;
      } else {
        until_radio.checked = true;
        count_field.disabled = true;
      }

      until_radio.onclick = function () {
        this.checked = true;
        count_radio.checked = false;
        count_field.disabled = true;
        until_date_selector.disabled = false;
        form.set_until(until_date_selector.value);
      };

      count_radio.onclick = function () {
        this.checked = true;
        count_field.disabled = false;
        until_radio.checked = false;
        until_date_selector.disabled = true;
        form.set_count(parseInt(count_field.value), 10);
      };

      count_field.onchange = function () {
        form.set_count(parseInt(this.value), 10);
      };

      until_date_selector.onchange = function () {
        form.set_until(until_date_selector.value);
      };
    }

    this.elements = {
      'root': root,
      'dtstart_date_selector': dtstart_date_selector,
      'mode_checkbox': mode_checkbox,
      'freq_select': freq_select,
      'interval_field': interval_field,
      'freq_form_container': freq_form_container,
      'until_radio': until_radio,
      'until_date_selector': until_date_selector,
      'count_field': count_field,
      'count_radio': count_radio,
      'limit_checkbox': limit_checkbox
    };

    if (showRRuleEnd) {
      const count_value = this.rule.count ? this.rule.count : 1;
      this.update_count_text(count_value);
    }

    // freq forms
    const forms = [
        recurrence.widget.RuleYearlyForm,
        recurrence.widget.RuleMonthlyForm,
        recurrence.widget.RuleWeeklyForm,
        recurrence.widget.RuleDailyForm
    ];
    const freq_forms = forms.map(function(form, i) {
      const rule = this.freq_rules[i];
      const f = new form(this, rule);
      return f;
    }, this);

    this.freq_forms = freq_forms;

    // install dom
    this.panel.set_label(this.get_display_text());
    this.panel.set_body(root);
  },

  get_display_text: function() {
    let text = this.freq_rules[this.selected_freq].get_display_text();
    if (this.mode == recurrence.widget.EXCLUSION)
      text = recurrence.display.mode.exclusion + ' ' + text;
    return recurrence.string.capitalize(text);
  },

  set_dtstart: function(dtstart) {
    if (dtstart) dtstart = new Date(dtstart);
    else dtstart = null;
    this.freq_rules.forEach(function(rule) {
      rule.dtstart = dtstart;
    });
    this.update();
  },

  set_until: function(until) {
    if (until) {
      until = new Date(until);
    } else {
      until = recurrence.widget.date_today();
      this.elements.until_date_selector.value = until.toISOString().split('T')[0];
    }
    this.freq_rules.forEach(function(rule) {
      rule.count = null;
      rule.until = until;
    });
    this.update();
  },

  update_count_text: function(count) {
    let token;
    if (count == 1)
      token = recurrence.string.capitalize(recurrence.display.labels.count);
    else
      token = recurrence.string.capitalize(recurrence.display.labels.count_plural);
    const label1 = this.elements.count_field.previousElementSibling;
    const label2 = this.elements.count_field.nextElementSibling;
    label1.innerText = token.split('%(number)s')[0];
    label2.innerText = token.split('%(number)s')[1];
  },

  set_count: function(count) {
    this.update_count_text(count);
    this.freq_rules.forEach(function(rule) {
      rule.until = null;
      rule.count = count;
    });
    this.update();
  },

  set_interval: function(interval) {
    interval = parseInt(interval, 10);
    if (String(interval) == 'NaN') {
      // invalid value, reset to previous value
      this.elements.interval_field.value = (this.freq_rules[this.selected_freq].interval);
      return;
    }

    const options = Array.from(this.elements.freq_select.options);

    if (interval == 1){
      options.forEach(function(option) {
        option.innerText = option.dataset.singular;
      })
    } else {
      options.forEach(function(option) {
        option.innerText = option.dataset.plural;
      })
    }

    this.freq_rules.forEach(function(rule) {
      rule.interval = interval;
    });

    this.elements.interval_field.value = interval;
    this.update();
  },

  set_freq: function(freq) {
    this.freq_forms[this.selected_freq].hide();
    this.freq_forms[freq].show();
    this.elements.freq_select.value = freq;
    this.selected_freq = freq;
    // need to update interval to display different label
    this.set_interval(parseInt(this.elements.interval_field.value), 10);
    this.update();
  },

  set_mode: function(mode) {
    if (this.mode == mode) {
      this.update();
      return;
    }
    if (this.mode == recurrence.widget.INCLUSION) {
      recurrence.array.remove(
        this.panel.widget.data.rrules, this.rule);
      this.panel.widget.data.exrules.push(this.rule);
      this.panel.elements.root.classList.remove('inclusion');
      this.panel.elements.root.classList.add('exclusion');
    } else {
      recurrence.array.remove(
        this.panel.widget.data.exrules, this.rule);
      this.panel.widget.data.rrules.push(this.rule);
      this.panel.elements.root.classList.remove('exclusion');
      this.panel.elements.root.classList.add('inclusion');
    }
    this.mode = mode;
    this.update();
  },

  update: function() {
    this.panel.set_label(this.get_display_text());
    this.rule.update(this.freq_rules[this.selected_freq]);
    this.panel.widget.update();
  },

  remove: function() {
    const parent = this.elements.root.parentNode;
    if (parent)
      parent.removeChild(this.elements.root);
    if (this.mode == recurrence.widget.INCLUSION)
      recurrence.array.remove(this.panel.widget.data.rrules, this.rule);
    else
      recurrence.array.remove(this.panel.widget.data.exrules, this.rule);
    this.panel.widget.update();
  }
};

recurrence.widget.RuleYearlyForm = function(panel, rule) {
  this.init(panel, rule);
};
recurrence.widget.RuleYearlyForm.prototype = {
  init: function(panel, rule) {
      this.panel = panel;
      this.rule = rule;

      this.init_dom();
  },

  init_dom: function() {
    const form = this;

    const root = this.panel.elements.freq_form_container.querySelector('.yearly-form');

    // month selector
    const grid = root.querySelector('.grid.months');
    grid.querySelectorAll('td').forEach(function(cell) {
      if (form.rule.bymonth.indexOf(cell.dataset.value) > -1)
        cell.classList.add('active');
      cell.onclick = function () {
        this.classList.toggle('active');
        form.set_bymonth();
      };
    })

    // by weekday checkbox
    const byday_container = root.querySelector('.byday');
    const byday_checkbox = byday_container.querySelector('input[name="yearly"][value="byday"]');

    // weekday-position
    const position_select = byday_container.querySelector('select[name="position"]');
    const weekday_select = byday_container.querySelector('select[name="weekday"]');

    if (this.rule.byday.length) {
      if (form.rule.bysetpos.length) {
        position_select.value = String(form.rule.bysetpos[0]);
      } else {
        position_select.value = String(form.rule.byday[0].index);
      }
      weekday_select.value = String(form.rule.byday[0].number);
      byday_checkbox.checked = true;
    } else {
      position_select.disabled = true;
      weekday_select.disabled = true;
    }

    // events

    byday_checkbox.onclick = function () {
      if (this.checked) {
        position_select.disabled = false;
        weekday_select.disabled = false;
        form.set_byday();
      } else {
        position_select.disabled = true;
        weekday_select.disabled = true;
        form.rule.byday = [];
        form.panel.update();
      }
    };

    position_select.onchange = function () {
      form.set_byday();
    };

    weekday_select.onchange = function () {
      form.set_byday();
    };

    this.elements = {
      'root': root,
      'grid': grid,
      'byday_checkbox': byday_checkbox,
      'position_select': position_select,
      'weekday_select': weekday_select
    };
  },

  get_weekday: function() {
    const number = parseInt(this.elements.weekday_select.value, 10);
    const index = parseInt(this.elements.position_select.value, 10);
    return new recurrence.Weekday(number, index);
  },

  set_bymonth: function() {
    const bymonth = [];
    this.elements.grid.querySelectorAll('td').forEach(function(cell) {
      if (cell.classList.contains('active'))
        bymonth.push(cell.dataset.value);
    })
    this.rule.bymonth = bymonth;
    this.panel.update();
  },

  set_byday: function() {
    this.rule.byday = [this.get_weekday()];
    this.panel.update();
  },

  show: function() {
    this.elements.root.classList.remove('hidden');
  },

  hide: function() {
    this.elements.root.classList.add('hidden');
  }
};


recurrence.widget.RuleMonthlyForm = function(panel, rule) {
  this.init(panel, rule);
};
recurrence.widget.RuleMonthlyForm.prototype = {
  init: function(panel, rule) {
    this.panel = panel;
    this.rule = rule;

    this.init_dom();
  },

  init_dom: function() {
    const form = this;

    const root = this.panel.elements.freq_form_container.querySelector('.monthly-form');

    // monthday
    const monthday_container = root.querySelector('.monthday');
    const monthday_grid = monthday_container.querySelector('table.grid');

    monthday_grid.querySelectorAll('td').forEach(function(cell) {
      if (form.rule.bymonthday.indexOf(parseInt(cell.dataset.value, 10)) > -1){
        cell.classList.add('active');
      }
      cell.onclick = function () {
        if (monthday_grid.dataset.readonly) return;
        const day = parseInt(this.dataset.value, 10) || null;
        if (day) {
          this.classList.toggle('active');
          form.set_bymonthday();
        }
      }
    })

    const monthday_radio = root.querySelector('input[data-name="monthly"][value="monthday"]');

    // weekday
    const weekday_container = root.querySelector('.weekday');
    const position_select = weekday_container.querySelector('select[name="position"]');
    const weekday_select = weekday_container.querySelector('select[name="weekday"]');
    const weekday_radio = weekday_container.querySelector('input[data-name="monthly"][value="weekday"]');

    // events
    if (form.rule.byday.length) {
      weekday_radio.checked = true;
      if (form.rule.bysetpos.length) {
        position_select.value = String(form.rule.bysetpos[0]);
      } else {
        position_select.value = String(form.rule.byday[0].index);
      }
      weekday_select.value = String(form.rule.byday[0].number);
      monthday_grid.dataset.readonly = true;
    } else {
      monthday_radio.checked = true;
      position_select.disabled = true;
      weekday_select.disabled = true;
    }

    monthday_radio.onclick = function () {
      this.checked = true;
      weekday_radio.checked = false;
      position_select.disabled = true;
      weekday_select.disabled = true;
      delete monthday_grid.dataset.readonly;
      form.set_bymonthday();
    };

    weekday_radio.onclick = function () {
      this.checked = true;
      monthday_radio.checked = false;
      position_select.disabled = false;
      weekday_select.disabled = false;
      monthday_grid.dataset.readonly = true;
      form.set_byday();
    };

    position_select.onchange = function () {
      form.set_byday();
    }

    weekday_select.onchange = function () {
      form.set_byday();
    };

    this.elements = {
      'root': root,
      'monthday_grid': monthday_grid,
      'monthday_radio': monthday_radio,
      'weekday_radio': weekday_radio,
      'position_select': position_select,
      'weekday_select': weekday_select
    }
  },

  get_weekday: function() {
    const number = parseInt(this.elements.weekday_select.value, 10);
    const index = parseInt(this.elements.position_select.value, 10);
    return new recurrence.Weekday(number, index);
  },

  set_byday: function() {
    this.rule.bymonthday = [];
    this.rule.bysetpos = [];
    this.rule.byday = [this.get_weekday()];
    this.panel.update();
  },

  set_bymonthday: function() {
    this.rule.bysetpos = [];
    this.rule.byday = [];
    const monthdays = [];
    this.elements.monthday_grid.querySelectorAll('td').forEach(function(cell) {
      const day = parseInt(cell.dataset.value, 10) || null;
      if (day && cell.classList.contains('active'))
        monthdays.push(day);
    });
    this.rule.bymonthday = monthdays;
    this.panel.update();
  },

  show: function() {
    this.elements.root.classList.remove('hidden');
  },

  hide: function() {
    this.elements.root.classList.add('hidden');
  }
};


recurrence.widget.RuleWeeklyForm = function(panel, rule) {
  this.init(panel, rule);
};
recurrence.widget.RuleWeeklyForm.prototype = {
  init: function(panel, rule) {
    this.panel = panel;
    this.rule = rule;

    this.init_dom();
  },

  init_dom: function() {
    const form = this;
    const root = this.panel.elements.freq_form_container.querySelector('.weekly-form');

    const weekday_grid = root.querySelector('.weekday-grid');
    const weekdays = weekday_grid.querySelectorAll('.weekday');

    const days = form.rule.byday.map(function(day) {
      return recurrence.to_weekday(day).number;
    })

    weekdays.forEach(function(weekday) {
      if (days.indexOf(weekday.value) >= 0)
        weekday.classList.add('active');

      weekday.onclick = function() {
        if (weekday_grid.disabled) return;
        this.classList.toggle('active');
        form.set_byday();
      }
    })

    this.elements = {
      'root': root,
      'weekday_grid': weekday_grid
    };
  },

  set_byday: function() {
    var byday = [];
    this.elements.weekday_grid.querySelectorAll('.weekday').forEach(function(cell) {
      if (cell.classList.contains('active'))
        byday.push(new recurrence.Weekday(cell.value));
    });
    this.rule.byday = byday;
    this.panel.update();
  },

  show: function() {
    this.elements.root.classList.remove('hidden');
  },

  hide: function() {
    this.elements.root.classList.add('hidden');
  }
};


recurrence.widget.RuleDailyForm = function(panel, rule) {
  this.init(panel, rule);
};
recurrence.widget.RuleDailyForm.prototype = {
  init: function(panel, rule) {
    this.panel = panel;
    this.rule = rule;

    this.init_dom();
  },

  init_dom: function() {
    const root = this.panel.elements.freq_form_container.querySelector('.daily-form');
    this.elements = {'root': root};
  },

  show: function() {
    this.elements.root.classList.remove('hidden');
  },

  hide: function() {
    this.elements.root.classList.add('hidden');
  }
};


recurrence.widget.DateForm = function(panel, mode, date) {
  this.init(panel, mode, date);
};
recurrence.widget.DateForm.prototype = {
  init: function(panel, mode, date) {
    this.collapsed = true;
    this.panel = panel;
    this.mode = mode;
    this.date = date;

    this.init_dom();
  },

  init_dom: function() {
    var form = this;

    // mode
    const formTemplate = this.panel.widget.elements.root.querySelector('[data-recurrence-template="date-form"]');
    const root = formTemplate.cloneNode(true);
    delete root.dataset.recurrenceTemplate;

    // mode
    const mode_container = root.querySelector('.mode');
    const mode_checkbox = mode_container.querySelector('input[name="mode"]');
    mode_checkbox.onclick = function() {
      form.set_mode(this.checked ? recurrence.widget.EXCLUSION : recurrence.widget.INCLUSION);
    }

    if (this.mode == recurrence.widget.EXCLUSION)
      mode_checkbox.checked = true;

    // date
    const date_container = root.querySelector('.date-value');
    const date_selector = date_container.querySelector('input[type="date"]');
    date_selector.value = recurrence.date.format(this.date, '%Y-%m-%d');
    date_selector.onchange = function() {
      form.date = new Date(this.value);
      form.update();
    }
    // init dom
    this.panel.set_label(this.get_display_text());
    this.panel.set_body(root);
    this.elements = {'root': root};
  },

  get_display_text: function() {
    let text = recurrence.date.format(this.date, recurrence.display.day_format);
    if (this.mode == recurrence.widget.EXCLUSION)
      text = recurrence.display.mode.exclusion + ' ' + text;
    return recurrence.string.capitalize(text);
  },

  set_mode: function(mode) {
      if (this.mode != mode) {
          if (this.mode == recurrence.widget.INCLUSION) {
              recurrence.array.remove(
                  this.panel.widget.data.rdates, this.date);
              this.panel.widget.data.exdates.push(this.date);
              recurrence.widget.remove_class(
                  this.elements.root, 'inclusion');
              recurrence.widget.add_class(
                  this.elements.root, 'exclusion');
              this.update();
          } else {
              recurrence.array.remove(
                  this.panel.widget.data.exdates, this.date);
              this.panel.widget.data.rdates.push(this.date);
              recurrence.widget.remove_class(
                  this.elements.root, 'exclusion');
              recurrence.widget.add_class(
                  this.elements.root, 'inclusion');
              this.update();
          }
          this.mode = mode;
      }
      this.update();
  },

  update: function() {
    this.panel.set_label(this.get_display_text());
    this.panel.widget.update();
  },

  remove: function() {
    const parent = this.elements.root.parentNode;
    if (parent)
      parent.removeChild(this.elements.root);
    if (this.mode == recurrence.widget.INCLUSION)
      recurrence.array.remove(this.panel.widget.data.rdates, this.date);
    else
      recurrence.array.remove(this.panel.widget.data.exdates, this.date);
    this.panel.widget.update();
  }
};
