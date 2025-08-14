---
layout: article
title: Talks
---
{%- for _pair in site.data.talks -%}
{%- assign _year = _pair[0] -%}
<h4>{{ _year }}</h4>
{%- assign _talks = _pair[1] -%}
<ul>
{%- for _talk in _talks -%}
{%- include talk.html talk=_talk -%}
{%- endfor -%}
</ul>
{%- endfor -%}
