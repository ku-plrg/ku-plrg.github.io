"""Abstract domains, and the abstract interpreter that runs on any of them."""

from __future__ import annotations


from cfg import CFG, Cmd, Assume, NodeId, Worklist
from syntax import *


class Domain:
    """An abstract domain: a lattice plus sound transformers.

    Implementations provide bot, top, le, join and the operations; widen and
    narrow default to join and meet, which is correct on finite lattices.
    """

    bot: object
    top: object

    def le(self, a, b) -> bool: raise NotImplementedError
    def join(self, a, b): raise NotImplementedError
    def meet(self, a, b): raise NotImplementedError
    def alpha(self, ns: set[int]): raise NotImplementedError
    def gamma(self, a) -> str: raise NotImplementedError
    def of_num(self, n: int): raise NotImplementedError
    def binop(self, op: str, a, b): raise NotImplementedError
    def unop(self, op: str, a): raise NotImplementedError

    def widen(self, a, b):  return self.join(a, b)
    def narrow(self, a, b): return self.meet(a, b)

    def refine(self, op: str, a, b) -> tuple:
        """Refine (a, b) assuming `a op b` holds. Sound to return (a, b)."""
        return a, b


# --------------------------------------------------------------- sign domain

BOT, NEG, ZERO, POS, TOP = "bot", "-", "0", "+", "top"
NONPOS, NONNEG, NONZERO = "-0", "0+", "-+"

# an element is a set of the three signs; its name is the key
ATOMS = {BOT: "", NEG: "-", ZERO: "0", POS: "+",
         NONPOS: "-0", NONNEG: "0+", NONZERO: "-+", TOP: "-0+"}
NAME = {frozenset(v): k for k, v in ATOMS.items()}

ADD = {("-", "-"): "-", ("-", "0"): "-", ("-", "+"): "-0+",
       ("0", "0"): "0", ("0", "+"): "+", ("+", "+"): "+"}
MUL = {("-", "-"): "+", ("-", "0"): "0", ("-", "+"): "-",
       ("0", "0"): "0", ("0", "+"): "0", ("+", "+"): "+"}


def sign(n: int) -> str:
    return "-" if n < 0 else "0" if n == 0 else "+"


class Sign(Domain):
    bot, top = BOT, TOP

    def le(self, a, b):
        return set(ATOMS[a]) <= set(ATOMS[b])

    def join(self, a, b):
        return NAME[frozenset(ATOMS[a] + ATOMS[b])]

    def meet(self, a, b):
        return NAME[frozenset(ATOMS[a]) & frozenset(ATOMS[b])]

    def alpha(self, ns):
        return NAME[frozenset(sign(n) for n in ns)]

    def gamma(self, a):
        return {BOT: "{}", NEG: "{n | n < 0}", ZERO: "{0}", POS: "{n | n > 0}",
                NONPOS: "{n | n <= 0}", NONNEG: "{n | n >= 0}",
                NONZERO: "{n | n != 0}", TOP: "Z"}[a]

    def of_num(self, n):
        return sign(n)

    def binop(self, op, a, b):
        if a == BOT or b == BOT:
            return BOT
        table = {"+": ADD, "*": MUL}.get(op)
        if table is None:
            return TOP                           # comparisons: not numbers
        out = ""
        for x in ATOMS[a]:                       # every pair of signs
            for y in ATOMS[b]:
                out += table.get((x, y)) or table[(y, x)]
        return NAME[frozenset(out)]

    def unop(self, op, a):
        if a == BOT:
            return BOT
        if op != "-":
            return TOP
        flip = {"-": "+", "0": "0", "+": "-"}
        return NAME[frozenset(flip[x] for x in ATOMS[a])]


# ------------------------------------------------------------ abstract state

State = dict          # variable -> abstract value; missing means bot


def st_le(dom: Domain, s: State, t: State) -> bool:
    return all(dom.le(s.get(x, dom.bot), t.get(x, dom.bot))
               for x in set(s) | set(t))


def st_join(dom: Domain, s: State, t: State) -> State:
    return {x: dom.join(s.get(x, dom.bot), t.get(x, dom.bot))
            for x in set(s) | set(t)}


def st_widen(dom: Domain, s: State, t: State) -> State:
    return {x: dom.widen(s.get(x, dom.bot), t.get(x, dom.bot))
            for x in set(s) | set(t)}


def st_narrow(dom: Domain, s: State, t: State) -> State:
    return {x: dom.narrow(s.get(x, dom.bot), t.get(x, dom.bot))
            for x in set(s) | set(t)}


# ------------------------------------------------------- abstract evaluation

def eval_abs(dom: Domain, e: Expr, s: State):
    # A variable absent from the state has no value yet: that is bottom, not
    # top. Treating it as top would make an unreachable state say `anything`.
    match e:
        case Num(n):          return dom.of_num(n)
        case Var(x):          return s.get(x, dom.bot)
        case BinOp(op, l, r): return dom.binop(op, eval_abs(dom, l, s),
                                               eval_abs(dom, r, s))
        case UnOp(op, v):     return dom.unop(op, eval_abs(dom, v, s))
        case _:               return dom.top


def assume(dom: Domain, cond: Expr, s: State) -> State:
    """Refine s with the knowledge that cond holds."""
    flip = {"<": ">=", "<=": ">", ">=": "<", ">": "<=", "==": "!=", "!=": "=="}
    match cond:
        case UnOp("not", BinOp(op, l, r)) if op in flip:
            return assume(dom, BinOp(flip[op], l, r), s)
        case BinOp(op, l, r) if op in flip:
            a, b = eval_abs(dom, l, s), eval_abs(dom, r, s)
            a2, b2 = dom.refine(op, a, b)
            out = dict(s)
            if isinstance(l, Var): out[l.x] = a2
            if isinstance(r, Var): out[r.x] = b2
            return out
        case _:
            return s


# ---------------------------------------------------- the abstract interpreter

def analyze(g: CFG, dom: Domain, widening: bool = True,
            narrowing: bool = True, limit: int = 10000) -> dict[NodeId, State]:
    """A sound abstract state per program point.

    The parameters are the input, so they start at top: the analysis is asked
    to hold for every call. Then an ascending phase with widening at loop
    heads, and a descending phase with narrowing to win back some of what
    widening threw away.
    """
    inn: dict[NodeId, State] = {n: {} for n in g}
    inn[g.entry] = {p: dom.top for p in g.params}
    work = Worklist(g)
    seen: dict[NodeId, int] = {n: 0 for n in g}

    steps = 0
    while work:
        steps += 1
        if steps > limit:
            raise RuntimeError("no fixpoint: is the transfer monotone, "
                               "and is widening applied at every loop head?")
        n = work.pop()
        if n != g.entry:
            joined = incoming(dom, g, n, inn)
            widen_here = widening and n in g.loop_heads and seen[n] > 0
            new = st_widen(dom, inn[n], joined) if widen_here else joined
            seen[n] += 1
            if eq(dom, new, inn[n]):
                continue
            inn[n] = new
        for e in g.succ[n]:
            work.push(e.dst)

    if narrowing:
        for _ in range(limit):
            changed = False
            for n in g:
                if n == g.entry:
                    continue
                new = st_narrow(dom, inn[n], incoming(dom, g, n, inn))
                if not eq(dom, new, inn[n]):
                    inn[n], changed = new, True
            if not changed:
                break
    return inn


def returned(g: CFG, dom: Domain, res: dict[NodeId, State]):
    """The abstract value of the program's output."""
    return eval_abs(dom, g.ret, res[g.exit])


def incoming(dom: Domain, g: CFG, n: NodeId, inn: dict[NodeId, State]) -> State:
    joined: State = {}
    for e in g.pred[n]:
        joined = st_join(dom, joined, step(dom, e.cmd, inn[e.src]))
    return joined


def eq(dom: Domain, s: State, t: State) -> bool:
    return st_le(dom, s, t) and st_le(dom, t, s)


def step(dom: Domain, c: Cmd, s: State) -> State:
    """The abstract transformer of one command."""
    match c:
        case Assume(cond):
            return assume(dom, cond, s)
        case Assign(x, e):
            return {**s, x: eval_abs(dom, e, s)}
        case _:
            return s
