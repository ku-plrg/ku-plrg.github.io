---
layout: page
title: Conferences
---
Last Update: {{ site.data.conferences.last_update }}


<link rel="stylesheet" type="text/css" href="./css/deadlines.css?t={{site.time | date: '%s'}}" media="screen,projection">
<script type="text/javascript" src="./js/jquery.min.js"></script>
<script type="text/javascript" src="./js/jquery.countdown.min.js"></script>
<script src="./js/moment.min.js"></script>
<script src="./js/moment-timezone-with-data.min.js"></script>
<script type="text/javascript">
window.onload = function() {
  let tags = document.getElementById("tag-list").getElementsByClassName("tag");
  for (tag of tags) {
    let tr = tag.parentElement.parentElement;
    tr.onclick = function() {
      if (this.classList.contains("highlighted")) {
        this.classList.remove("highlighted");
      } else {
        this.classList.add("highlighted");
      }
      redrawConfList();
    }
  }
};
function redrawConfList() {
  let selectedTags = [];
  let tags = document.getElementById("tag-list").getElementsByClassName("tag");
  for (tag of tags) {
    let tr = tag.parentElement.parentElement;
    if (tr.classList.contains("highlighted")) selectedTags.push(tag.innerText);
  }
  console.log(selectedTags);
  let confs = document.getElementsByClassName("conf");
  for (conf of confs) {
    let tag = conf.getElementsByClassName("tag")[0].innerText;
    console.log(tag);
    if (selectedTags.length == 0 || selectedTags.indexOf(tag) >= 0) {
      conf.style.display = "block";
    } else {
      conf.style.display = "none";
    }
  }
}
</script>
<div id="conf-list">
  <div class="row">
    <div class="col-xs-12 col-sm-6">
      <table class="styled-table" id="tag-list">
        <thead><tr><th>Tag</th><th>Description</th></tr></thead>
        <tr><td><p class="tag pl">PL</p></td><td>Programming Languages</td></tr>
        <tr><td><p class="tag se">SE</p></td><td>Software Engineering</td></tr>
        <tr><td><p class="tag sec">SEC</p></td><td>Security</td></tr>
        <tr><td><p class="tag db">ARCH</p></td><td>Architecture</td></tr>
        <tr><td><p class="tag db">LOGIC</p></td><td>Logic and Verification</td></tr>
      </table>
    </div>
    <div class="col-xs-12 col-sm-6">
      <ul class="styled-list">
        <li> <a href="https://www.kiise.or.kr/TopConferences/data/BK21%ED%94%8C%EB%9F%AC%EC%8A%A4%EC%82%AC%EC%97%85_CS%EB%B6%84%EC%95%BC_%EC%9A%B0%EC%88%98%EA%B5%AD%EC%A0%9C%ED%95%99%EC%88%A0%EB%8C%80%ED%9A%8C%EB%AA%A9%EB%A1%9D_2018.pdf">BK21</a> - IF 1-4</li>
        <li> <a href="https://www.kiise.or.kr/TopConferences/data/SW%EB%B6%84%EC%95%BC%EC%9A%B0%EC%88%98%ED%95%99%EC%88%A0%EB%8C%80%ED%9A%8C%EB%AA%A9%EB%A1%9D_2024.pdf">KIISE</a> - 최우수 / 우수 </li>
        <li> <a href="https://portal.core.edu.au/conf-ranks/">CORE</a> - A* / A / B / C / Other</li>
      </ul>
    </div>
  </div>
  <br>
  <div class="top-strip"></div>
  {% for conf in site.data.conferences.list %}
  {% assign info = site.data.conferences.infos[conf.name] %}
  {% assign num_deadlines = conf.deadline.size %}
  {% assign range_end = conf.deadline.size | minus: 1 %}
  {% for i in (0..range_end) %}
  {% assign year = conf.year %}
  {% assign prevyear = conf.year | minus: 1 %}
  {% assign deadline = conf.deadline[i] | replace: '%y', year | replace: '%Y', prevyear %}
  {% assign conf_id = conf.name | append: conf.year | append: '-' | append: i | slugify %}
  <div id="{{conf_id}}" class="conf">
    <div class="row">
      <div class="col-xs-12 col-sm-6">
        <a class="conf-name" href="{{conf.link}}">{{conf.name}} {{conf.year}}</a>
        <span class="tags">
          {% for tag in info.tags %}
          <p class="tag {{ tag | downcase }}">{{ tag }}</p>
          {% endfor %}
        </span>
        <span class="rank">
        (IF{{ info.bk21 }}
        / {{ info.kiise }}
        / <a href="https://portal.core.edu.au/conf-ranks/{{ info.rank-id }}">{{ info.rank }}</a>)
        </span>
        <div class="meta">
          <span class="conf-date">{{conf.date}} / </span>
          <span class="conf-place">
            {% if conf.place == "Online" %}
            <a href="#">{{conf.place}}</a>.
            {% else %}
            <a href="http://maps.google.com/?q={{conf.place}}">{{conf.place}}</a>.
            {% endif %}
          </span>
        </div>
        {% if conf.note %}
        <div class="note">
          {{conf.note}}
        </div>
        {% endif %}
      </div>
      <div class="col-xs-12 col-sm-6">
        <span class="timer"></span>
        <div class="deadline">
          <div>
            {% if num_deadlines >=2 %}
            Deadline ({{ i | plus: 1 }} / {{ num_deadlines }}):
            {% else %}
            Deadline:
            {% endif %}
            <span class="deadline-time">
              {{ deadline }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <hr>
  </div>
  {% endfor %}
  {% endfor %}
</div>
<script type="text/javascript" src="./js/main.js"></script>
