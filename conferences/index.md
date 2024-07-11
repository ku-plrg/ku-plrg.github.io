---
layout: article
title: Conferences
---
<ul class="conference-list">
  {%- for conference in site.data.conferences -%}
  {%- include conferences.html conference=conference -%}
  {%- endfor -%}
</ul>