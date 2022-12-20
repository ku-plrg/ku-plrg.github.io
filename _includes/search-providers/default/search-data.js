function unescape(s) {
  var span = document.createElement('span');
  span.innerHTML = s;
  return span.textContent || span.innerText;
}
function simpleString(s) {
  return s.replace(/\s+/g, ' ').toLowerCase();
};

window.TEXT_SEARCH_DATA={
  {%- for _collection in site.collections -%}
    {%- unless forloop.first -%},{%- endunless -%}
    '{{ _collection.label }}':[
      {%- for _article in _collection.docs -%}
      {%- unless forloop.first -%},{%- endunless -%}
      {
        'title': simpleString({{ _article.title | jsonify }}),
        'content': simpleString(unescape({{ _article.content | jsonify }})),
        'tags': {{ _article.tags | jsonify }}.map(simpleString),
        {%- include snippets/prepend-baseurl.html path=_article.url -%}
        {%- assign _url = __return -%}
        'url':{{ _url | jsonify }}
      }
      {%- endfor -%}
    ]
  {%- endfor -%}
};
