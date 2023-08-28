---
layout: article
title: Trips
---
{%- for _pair in site.data.trips -%}
{%- assign _year = _pair[0] -%}
<h3>{{ _year }}</h3>
{%- assign _trips = _pair[1] -%}
<ul>
{%- for _trip in _trips -%}
{%- include trip.html trip=_trip -%}
{%- endfor -%}
</ul>
{%- endfor -%}
