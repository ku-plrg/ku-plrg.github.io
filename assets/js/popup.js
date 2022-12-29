document.body.onkeydown = (e) => {if (e.which == 27) close();}
function show(filename) {
  const popup = document.getElementById("popup");
  const title = document.getElementById("title");
  const download = document.getElementById("popup-download");
  const content = document.getElementById("content");
  const url = '/assets/data/bib/' + filename;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      // set title
      title.innerText = filename

      // set content
      content.innerText = text;

      // set donwload link
      download.href = url;

      // show popup
      popup.style.visibility = 'visible';
      popup.style.opacity = 1;
    });
}
function copy() {
  const title = document.getElementById("title");
  const content = document.getElementById("content");
  navigator.clipboard.writeText(content.innerText);
  Swal.fire({
    icon: 'success',
    title: `The content of "${title.innerText}" has been successfully copied to the clipboard`,
    showConfirmButton: false,
    timer: 1500
  })
}
function close() {
  const popup = document.getElementById("popup");
  popup.style.visibility = 'hidden';
  popup.style.opacity = 0;
}
