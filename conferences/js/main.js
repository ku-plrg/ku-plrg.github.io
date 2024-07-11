---
---
deadlineByConf = {};

local_timezone = '';
try {
  local_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
} catch (e) {}

{% for conf in site.data.conferences.list %}
{% if conf.deadline[0] == "TBA" %}
{% assign conf_id = conf.name | append: conf.year | append: '-0' | slugify %}
$('#{{ conf_id }} .timer').html("TBA");
$('#{{ conf_id }} .deadline-time').html("TBA");
deadlineByConf["{{ conf_id }}"] = null;
{% endif %}
var rawDeadlines = {{ conf.deadline | jsonify }} || [];
if (rawDeadlines.constructor !== Array) {
  rawDeadlines = [rawDeadlines];
}
var parsedDeadlines = [];
while (rawDeadlines.length > 0) {
  var rawDeadline = rawDeadlines.pop();
  // deal with year template in deadline
  year = {{ conf.year }};
  rawDeadline = rawDeadline.replace('%y', year).replace('%Y', year - 1);
  // adjust date according to deadline timezone
  {% if conf.timezone %}
  var deadline = moment.tz(rawDeadline, "{{ conf.timezone }}");
  {% else %}
  var deadline = moment.tz(rawDeadline, "Etc/GMT+12"); // Anywhere on Earth
  {% endif %}

  // post-process date
  if (deadline.minutes() === 0) {
    deadline.subtract(1, 'seconds');
  }
  if (deadline.minutes() === 59) {
    deadline.seconds(59);
  }
  parsedDeadlines.push(deadline);
}
// due to pop before; we need to reverse such that the i index later matches
// the right parsed deadline
parsedDeadlines.reverse();

{% assign range_end = conf.deadline.size | minus: 1 %}
{% for i in (0..range_end) %}
{% assign conf_id = conf.name | append: conf.year | append: '-' | append: i | slugify %}
var deadlineId = {{ i }};
if (deadlineId < parsedDeadlines.length) {
  var confDeadline = parsedDeadlines[deadlineId];

  // render countdown timer
  if (confDeadline) {
    function make_update_countdown_fn(confDeadline) {
      return function(event) {
        diff = moment() - confDeadline
        if (diff <= 0) {
           $(this).html(event.strftime('%D days %Hh %Mm %Ss'));
        } else {
          $(this).html(confDeadline.fromNow());
        }
      }
    }
    $('#{{ conf_id }} .timer').countdown(confDeadline.toDate(), make_update_countdown_fn(confDeadline));
    // check if date has passed, add 'past' class to it
    if (moment() - confDeadline > 0) {
      $('#{{ conf_id }}').addClass('past');
    }
    var confDeadlineStr = confDeadline.local().format('D MMM YYYY, h:mm:ss a');
    if (local_timezone) {
      confDeadlineStr += ' in ' + local_timezone;
    }
    $('#{{ conf_id }} .deadline-time').html(confDeadlineStr);
    deadlineByConf["{{ conf_id }}"] = confDeadline;
  }
}
{% endfor %}
{% endfor %}

// Reorder list
var today = moment();
var confs = $('.conf').detach();
confs.sort(function(a, b) {
  var aDeadline = deadlineByConf[a.id];
  var bDeadline = deadlineByConf[b.id];
  var aDiff = today.diff(aDeadline);
  var bDiff = today.diff(bDeadline);
  if (aDiff < 0) {
    if (bDiff > 0) return -1;
    return bDiff - aDiff;
  } else {
    if (bDiff < 0) return 1;
    return aDiff - bDiff;
  }
});
$('#conf-list').append(confs);
