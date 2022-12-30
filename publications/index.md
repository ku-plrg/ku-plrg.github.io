---
layout: article
title: Publications
---
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="/assets/js/popup.js"></script>
<div id="popup">
  <div id="overlay" onclick="window.close()"></div>
	<div class="popup">
    <h3 id="title"></h3>
    <a class="popup-button" id="popup-copy" data-tooltip="Copy" onclick="window.copy()">
      <svg version="1.1" viewBox="0 0 30 30" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M11,24c-2.206,0-4-1.794-4-4V7H6C4.895,7,4,7.895,4,9v16c0,1.105,0.895,2,2,2h13c1.105,0,2-0.895,2-2v-1H11z"/><path d="M25.707,7.793l-5.5-5.5C20.019,2.105,19.765,2,19.5,2H11C9.895,2,9,2.895,9,4v16c0,1.105,0.895,2,2,2h13  c1.105,0,2-0.895,2-2V8.5C26,8.235,25.895,7.981,25.707,7.793z M20,9c-0.552,0-1-0.448-1-1V3.904L24.096,9H20z"/></svg>
    </a>
    <a class="popup-button" id="popup-download" data-tooltip="Download" href="">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title/><g data-name="Layer 2" id="Layer_2"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM9.71,10.29,11,11.59V6h2v5.59l1.29-1.29,1.41,1.41L12,15.41,8.29,11.71ZM16,18H8V16h8Z"/></g></svg>
    </a>
    <a class="popup-button" id="popup-close" onclick="window.close()">
      <svg version="1.1" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/></svg>
    </a>
    <pre id="content"></pre>
	</div>
</div>

<div class="post-content">
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
