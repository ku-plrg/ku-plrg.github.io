---
layout: article
title: Publications
---
<div id="pub-content">
{%- for _pair in site.data.publications -%}
{%- assign _year = _pair[0] -%}
<h3>{{ _year }}</h3>
<ul>
{%- assign _publications = _pair[1] -%}
{%- for _publication in _publications -%}
  {%- include publication.html publication=_publication -%}
{%- endfor -%}
</ul>
{%- endfor -%}
</div>
