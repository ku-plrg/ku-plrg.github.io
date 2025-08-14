---
layout: article
title: Trips
---
{%- for _pair in site.data.trips -%}
{%- assign _year = _pair[0] -%}
<h4>{{ _year }}</h4>
{%- assign _trips = _pair[1] -%}
<ul>
{%- for _trip in _trips -%}
{%- include trip.html trip=_trip -%}
{%- endfor -%}
</ul>
{%- endfor -%}
