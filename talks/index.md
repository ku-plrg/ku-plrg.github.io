---
layout: article
title: Talks
---
<ul>
{%- for _talk in site.data.talks -%}
  {%- include talk.html talk=_talk -%}
{%- endfor -%}
</ul>
