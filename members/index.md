---
layout: article
title: Members
---
{%- for _pairs in site.data.members -%}
{%- assign _category = _pairs[0] -%}

<!-- Current Members Section -->
{%- if _category != "Alumni" -%}
<h2>{{ _category }}</h2>
<div class="author-profiles">
{%- assign _names = _pairs[1] -%}
{%- for _name in _names -%}
{%- assign _author = site.data.authors[_name] -%}
{%- include article/footer/author-profile.html path=_author -%}
{%- endfor -%}
</div>


<!-- Alumni Section -->
{%- else -%}
<h2>{{ _category }}</h2>
{%- assign _members = _pairs[1] -%}
<ul>
  {%- for _member in _members -%}
  <li>
    {%- assign _name = _member.name -%}
    {%- assign _author = site.data.authors[_name] -%}
    <a href="{{ _author.url }}">{{ _name }}</a>
    ({{ _member.category }}, {{ _member.year }})
    {%- if _member.job -%}
    {{ " @ " }} {{ _member.job }}
    {%- endif -%}
  </li>
  {%- endfor -%}
</ul>
{%- endif -%}

{%- endfor -%}
