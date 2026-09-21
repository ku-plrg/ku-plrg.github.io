"""Control flow graphs for MiniPy.

A graph is a set of *program points* joined by edges, and every edge carries
one command: an assignment, `pass`, or `assume(e)`. A run of the program is a
path from the entry point to the exit point along which every `assume` held.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field

from syntax import *


@dataclass(frozen=True)
class Assume:
    """Passable only when `cond` is true. A condition becomes two of these."""
    cond: Expr


Cmd = Assign | IndexAssign | Pass | Assume

NodeId = int     # a program point: just a number
EdgeId = int     # an edge's position in `CFG.edges`


@dataclass(frozen=True)
class Edge:
    id: EdgeId
    src: NodeId
    cmd: Cmd
    dst: NodeId

    def __str__(self) -> str:
        return show_cmd(self.cmd)


DOT_STYLE = """\
  graph [ranksep=.5, nodesep=.4];
  node [shape=circle, fixedsize=true, width=.3, fontsize=11];
  edge [fontname=monospace, fontsize=11, arrowsize=.7];"""
DOT_END = "shape=box, style=rounded, fixedsize=false, fontname=monospace"


@dataclass
class CFG:
    params: tuple[str, ...]                  # bound at the entry: the input
    ret: Expr                                # evaluated at the exit: the output
    edges: list[Edge] = field(default_factory=list)
    succ: dict[NodeId, list[Edge]] = field(default_factory=dict)
    pred: dict[NodeId, list[Edge]] = field(default_factory=dict)
    loop_heads: set[NodeId] = field(default_factory=set)
    entry: NodeId = -1
    exit: NodeId = -1

    # -- construction ------------------------------------------------------

    def add(self) -> NodeId:                 # a fresh program point
        p = len(self.succ)
        self.succ[p] = []
        self.pred[p] = []
        return p

    def edge(self, src: NodeId, cmd: Cmd, dst: NodeId) -> Edge:
        e = Edge(len(self.edges), src, cmd, dst)
        self.edges.append(e)
        self.succ[src].append(e)
        self.pred[dst].append(e)
        return e

    # -- queries -----------------------------------------------------------

    @property
    def nodes(self) -> list[NodeId]:
        return sorted(self.succ)

    def __iter__(self):
        return iter(self.nodes)

    def to_dot(self) -> str:
        head = "entry(" + ", ".join(self.params) + ")"
        tail = "return " + show_expr(self.ret)
        out = ["digraph cfg {", DOT_STYLE,
               f'  {self.entry} [{DOT_END}, label="{head}"];',
               f'  {self.exit} [{DOT_END}, label="{tail}"];',
               f"  {{rank=sink; {self.exit}}}"]
        for e in self.edges:
            out.append(f'  {e.src} -> {e.dst} [label="{e}"];')
        return "\n".join(out + ["}"])


def build(prog: Prog) -> CFG:
    """Translate a program into a control flow graph.

    The graph has one entry and one exit, because a MiniPy program is one
    function whose `return` is its last line.
    """
    g = CFG(prog.params, prog.ret)
    g.entry = g.add()
    g.exit = g.add()
    _block(g, prog.body, g.entry, g.exit)
    return g


def _block(g: CFG, body: Block, src: NodeId, dst: NodeId) -> None:
    """Edges for `body`, from point src to point dst."""
    if not body:
        g.edge(src, Pass(), dst)
        return
    for st in body[:-1]:
        mid = g.add()
        _stmt(g, st, src, mid)
        src = mid
    _stmt(g, body[-1], src, dst)


def _stmt(g: CFG, st: Stmt, src: NodeId, dst: NodeId) -> None:
    match st:
        case If(cond, then, els):
            _branch(g, cond, then, src, dst)
            _branch(g, UnOp("not", cond), els, src, dst)
        case While(cond, body):
            g.loop_heads.add(src)
            _branch(g, cond, body, src, src)
            g.edge(src, Assume(UnOp("not", cond)), dst)
        case _:                          # x = e | x[e] = e | pass
            g.edge(src, st, dst)


def _branch(g: CFG, cond: Expr, body: Block, src: NodeId, dst: NodeId) -> None:
    """src --assume(cond)--> body --> dst."""
    if not body:
        g.edge(src, Assume(cond), dst)
    else:
        mid = g.add()
        g.edge(src, Assume(cond), mid)
        _block(g, body, mid, dst)


# ------------------------------------------------------------------ worklist

class Worklist:
    """A queue of points that holds each point at most once."""

    def __init__(self, points):
        self.queue, self.members = deque(), set()
        for p in points:
            self.push(p)

    def push(self, p: NodeId) -> None:
        if p not in self.members:
            self.queue.append(p)
            self.members.add(p)

    def pop(self) -> NodeId:
        p = self.queue.popleft()
        self.members.remove(p)
        return p

    def __bool__(self) -> bool:
        return bool(self.queue)


# ---------------------------------------------------------------- dominators

def dominators(g: CFG) -> dict[NodeId, set[NodeId]]:
    """dom(p) = {p} union (intersection of dom(q) for every edge q -> p)."""
    # initial: the entry is its own dominator; every other point starts full
    dom = {p: (set(g.nodes) if p != g.entry else {g.entry}) for p in g}
    # worklist: every point but the entry, whose equation is already solved
    work = Worklist(p for p in g if p != g.entry)
    while work:
        p = work.pop()
        # transfer: the equation for p
        new = {p} | set.intersection(*(dom[e.src] for e in g.pred[p]))
        if new != dom[p]:
            dom[p] = new
            for e in g.succ[p]:
                if e.dst != g.entry:
                    work.push(e.dst)
    return dom


def idom(g: CFG) -> dict[NodeId, NodeId | None]:
    """The immediate dominator of each point: its closest strict dominator."""
    dom = dominators(g)
    out: dict[NodeId, NodeId | None] = {}
    for p in g:
        strict = dom[p] - {p}
        out[p] = max(strict, key=lambda d: len(dom[d]), default=None)
    return out


def frontier(g: CFG) -> dict[NodeId, set[NodeId]]:
    """Dominance frontier: where a definition leaving d stops being the only one.

    p is in DF(d) when d dominates a predecessor of p but not p itself, so
    control reaches p both through d and around it -- exactly where SSA needs
    a phi-function.
    """
    dom, out = dominators(g), {p: set() for p in g}
    for p in g:
        for e in g.pred[p]:
            for d in dom[e.src]:
                if d not in dom[p] or d == p:
                    out[d].add(p)
    return out


# ------------------------------------------------------------------ printing

def show_expr(e: Expr) -> str:
    match e:
        case Num(n):            return str(n)
        case Str(s):            return repr(s)
        case Bool(b):           return str(b)
        case NoneLit():         return "None"
        case Var(x):            return x
        case BinOp(op, l, r):   return f"{show_expr(l)} {op} {show_expr(r)}"
        case UnOp(op, v):       return f"{op} {show_expr(v)}"
        case ListLit(items):    return "[" + ", ".join(map(show_expr, items)) + "]"
        case Index(b, i):       return f"{show_expr(b)}[{show_expr(i)}]"
        case _:                 raise NotImplementedError(e)


def show_cmd(c: Cmd) -> str:
    match c:
        case Assume(cond):           return f"assume({show_expr(cond)})"
        case Pass():                 return "pass"
        case Assign(x, e):           return f"{x} = {show_expr(e)}"
        case IndexAssign(x, i, e):   return f"{x}[{show_expr(i)}] = {show_expr(e)}"
        case _:                      raise NotImplementedError(c)


def find(g: CFG, text: str) -> Edge:
    """The edge whose command prints as `text` (the first one, if several)."""
    return next(e for e in g.edges if str(e) == text)


if __name__ == "__main__":
    import sys
    print(build(parse(open(sys.argv[1]).read())).to_dot())
