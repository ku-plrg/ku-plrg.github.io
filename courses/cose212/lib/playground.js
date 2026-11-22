// Online interpreters on the course page: CodeMirror editor (book-editor.js, same as the textbook)
// + Scala.js interpreters (interp.js). Markup: <div class="pl-playground"></div>
(function () {
  "use strict";
  const EXAMPLES = {
  "AE": "1 + 2 * 3",
  "VAE": "val x = 1;\nval y = 2;\nx + y",
  "F1VAE": "def inc(x) = x + 1;\ninc(42)",
  "FVAE": "val twice = f => x => f(f(x));\nval inc = x => x + 1;\ntwice(inc)(42)",
  "FAE": "(f => x => f(f(x)))(x => x + 1)(42)",
  "RFAE": "def fact(n) = if (n > 0) n * fact(n - 1) else 1;\nfact(10)",
  "BFAE": "val inc = x => x.set(x.get + 1);\nval b = Box(7);\ninc(b);\ninc(b);\nb.get",
  "MFAE": "var x = 7;\nvar add = y => x = x + y;\nadd(3);\nadd(5);\nx",
  "LFAE": "val z = 42;\nval x = 1(2);\nz + 1",
  "KFAE": "{\n  vcc done;\n  val f = { vcc esc; done(1 + { vcc k; esc(k) }) };\n  f(3)\n}",
  "TFAE": "(x: Number) => {\n  val y = x + 1;\n  (z: Number) => z + y * z\n}",
  "TRFAE": "def sum(n: Number): Number =\n  def iter(k: Number): Number => Number = (acc: Number) =>\n    if (k > n) acc\n    else iter(k + 1)(acc + k);\n  iter(1)(0);\nsum(100)",
  "ATFAE": "enum Tree {\n  case Leaf(Number)\n  case Node(Tree, Number, Tree)\n}\ndef sumTree(t: Tree): Number = t match {\n  case Leaf(x) => x\n  case Node(l, x, r) => sumTree(l) + x + sumTree(r)\n}\nsumTree(Node(Leaf(1), 2, Node(Leaf(3), 4, Leaf(5))))",
  "PTFAE": "val f = forall[T] (x: T) => x;\nf[Number => Number](f[Number])(42)",
  "STFAE": "(f: (Number => Number) => (Number => Number)) => {\n  val g: Number => Number = (x: Number) => exit;\n  val h: Number => Number = f(g);\n  f((x: Number) => x + 1)(3) + h(0)\n}",
  "TIFAE": "def gcd(x) = y => {\n  if (x == 0) y\n  else gcd(y % x)(x)\n}\ndef twice(f) = x => f(f(x))\ndef identity(x) = x\ntwice(identity)(gcd(3)(5))",
  "MiniFSharp": "let rec min x y = if x < y then x else y\nand max x y = if x > y then x else y\nand minMax xs =\n  match xs with\n  | [] -> None\n  | [x] -> Some (x, x)\n  | h :: t ->\n      match minMax t with\n      | Some (mn, mx) -> Some (min h mn, max h mx)\n      | None -> Some (h, h)\nin (minMax [5; 2; 8; 1; 9], minMax [])",
  "MiniPython": "def list(iterable):\n  result = []\n  if iterable is not None:\n    for item in iterable: result.append(item)\n  return result\n\ndef flatten(xs):\n  for x in xs:\n    try: yield from flatten(iter(x))\n    except: yield x\n\nlist(flatten([1, [2, 3], [[4], 5]]))",
  "MiniScala": "enum List[T] {\n  case Nil()\n  case Cons(head: T, tail: List[T])\n}\ndef sum(l: List[Number]): Number = l match {\n  case Nil() => 0\n  case Cons(x, xs) => x + sum(xs)\n}\ndef filter[T](l: List[T], f: T => Boolean): List[T] = l match {\n  case Nil() => Nil[T]()\n  case Cons(x, xs) => if (f(x)) Cons[T](x, filter[T](xs, f)) else filter[T](xs, f)\n}\nval list = Cons[Number](1, Cons[Number](2, Cons[Number](3, Nil[Number]())));\nsum(filter[Number](list, (x: Number) => x % 2 == 1))"
};
  const LANGS = Object.keys(EXAMPLES);

  function setup(root) {
    let name = root.dataset.lang || "AE";
    root.innerHTML = `
      <div class="pp-head">
        <select class="pp-lang" aria-label="language">${LANGS.map((l) => `<option${l === name ? " selected" : ""}>${l}</option>`).join("")}</select>
        <span class="pp-hint">Edit and run (Ctrl/Cmd + Enter)</span>
        <button class="pp-reset" title="Reset to the example">Reset</button>
        <button class="pp-run" title="Run"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg> Run</button>
      </div>
      <div class="pl-editor"></div>
      <pre class="pp-out" hidden></pre>`;
    const host = root.querySelector(".pl-editor"), out = root.querySelector(".pp-out");
    const select = root.querySelector(".pp-lang");
    host.addEventListener("keydown", (e) => e.stopPropagation());
    let ed = null;
    function make() {
      host.innerHTML = "";
      ed = PLEditor.create(host, name, EXAMPLES[name], { onRun: run, lineNumbers: true });
      out.hidden = true;
    }
    function run() {
      out.hidden = false;
      out.classList.remove("error");
      let r;
      try { r = String(interp[name](ed.getCode().trim())); } catch (e) { r = "Unexpected error: " + e; }
      out.textContent = r;
      if (r.startsWith("[PLError]") || r.startsWith("Unexpected")) out.classList.add("error");
    }
    select.addEventListener("change", () => {
      name = select.value;
      make();
    });
    root.querySelector(".pp-reset").addEventListener("click", make);
    root.querySelector(".pp-run").addEventListener("click", run);
    make();
  }

  function init() { document.querySelectorAll(".pl-playground").forEach(setup); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
