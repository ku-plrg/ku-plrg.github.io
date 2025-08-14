---
layout: article
title: Publications
---
<div class="post-content">
{%- for _pair in site.data.publications -%}
{%- assign _year = _pair[0] -%}
<h4>{{ _year }}</h4>
<ul>
{%- assign _publications = _pair[1] -%}
{%- for _publication in _publications -%}
  {%- include publication.html publication=_publication -%}
{%- endfor -%}
</ul>
{%- endfor -%}
</div>
