"""A semi-naive Datalog engine, and analyses written as rules.

The engine is the worklist algorithm again: only facts derived in the last
round can produce new ones, so each derivation is made exactly once.
"""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass


@dataclass(frozen=True)
class V:
    """A logic variable. Anything else in an atom is a constant."""
    name: str

    def __str__(self) -> str:
        return self.name


@dataclass(frozen=True)
class Atom:
    pred: str
    args: tuple

    def __str__(self) -> str:
        return f"{self.pred}({', '.join(map(str, self.args))})"


@dataclass(frozen=True)
class Not:
    atom: Atom

    def __str__(self) -> str:
        return f"!{self.atom}"


@dataclass(frozen=True)
class Rule:
    head: Atom
    body: tuple

    def __str__(self) -> str:
        return f"{self.head} :- {', '.join(map(str, self.body))}."


def subst(a: Atom, th: dict) -> Atom:
    return Atom(a.pred, tuple(th.get(x, x) if isinstance(x, V) else x
                              for x in a.args))


def unify(a: Atom, f: Atom, th: dict) -> dict | None:
    """Match the pattern `a` against the ground fact `f`, extending `th`."""
    if a.pred != f.pred or len(a.args) != len(f.args):
        return None
    out = dict(th)
    for pat, val in zip(a.args, f.args):
        if isinstance(pat, V):
            if pat in out and out[pat] != val:
                return None
            out[pat] = val
        elif pat != val:
            return None
    return out


def index(db: set[Atom]) -> dict[str, set[Atom]]:
    by = defaultdict(set)
    for f in db:
        by[f.pred].add(f)
    return by


def solve(facts: set[Atom], rules: list[Rule]) -> set[Atom]:
    """Every fact the rules derive from the given ones, by semi-naive evaluation.

    Negated atoms are checked against the facts given as input, so they must
    name input relations only.
    """
    db, delta, edb = set(facts), set(facts), index(facts)
    while delta:
        by_db, by_delta, by_old = index(db), index(delta), index(db - delta)
        new: set[Atom] = set()
        for rule in rules:
            for i, b in enumerate(rule.body):
                if isinstance(b, Not):
                    continue
                # atom i matches a new fact, the ones before it an older fact
                for th in join(rule.body, i, by_delta, by_db, edb, by_old):
                    h = subst(rule.head, th)
                    if h not in db:
                        new.add(h)
        db |= new
        delta = new
    return db


def naive(facts: set[Atom], rules: list[Rule]) -> set[Atom]:
    """The same answer, the slow way: every round joins every fact again."""
    db, edb = set(facts), index(facts)
    while True:
        by_db = index(db)
        new = {subst(rule.head, th) for rule in rules
               for th in join(rule.body, -1, {}, by_db, edb)} - db
        if not new:
            return db
        db |= new


def join(body: tuple, i: int, by_delta, by_db, edb, by_old=None):
    """Substitutions satisfying the body, with atom i matched against delta.

    The atoms before i match only the older facts, so that a derivation
    whose body has two new facts is found once, not twice.
    """
    def go(k: int, th: dict):
        if k == len(body):
            yield th
            return
        item = body[k]
        if isinstance(item, Not):
            probe = subst(item.atom, th)
            if any(unify(probe, f, {}) is not None for f in edb.get(probe.pred, ())):
                return
            yield from go(k + 1, th)
            return
        if k == i:
            source = by_delta
        elif k < i and by_old is not None:
            source = by_old
        else:
            source = by_db
        for f in source.get(item.pred, ()):
            th2 = unify(item, f, th)
            if th2 is not None:
                yield from go(k + 1, th2)

    yield from go(0, {})


def query(db: set[Atom], pred: str) -> set[tuple]:
    return {f.args for f in db if f.pred == pred}


# ============================================================== analyses

ATOM = re.compile(r"(!?)(\w+)\(([^)]*)\)")


def rules(text: str) -> list[Rule]:
    """Rules as text: `head :- atom, !atom.` A capital letter starts a variable."""
    out = []
    for rule in text.split("."):
        atoms = []
        for neg, pred, args in ATOM.findall(rule):
            a = Atom(pred, tuple(V(x) if x[0].isupper() else x
                                 for x in map(str.strip, args.split(","))))
            atoms.append(Not(a) if neg else a)
        if atoms:
            out.append(Rule(atoms[0], tuple(atoms[1:])))
    return out


def transitive_closure() -> list[Rule]:
    """The example every Datalog tutorial starts with."""
    return rules("""
        path(X, Y) :- edge(X, Y).
        path(X, Z) :- path(X, Y), edge(Y, Z).
    """)


def ancestors() -> list[Rule]:
    """Input: parent(X, Y). The same closure, on a family tree."""
    return rules("""
        anc(X, Y) :- parent(X, Y).
        anc(X, Z) :- parent(X, Y), anc(Y, Z).
    """)


def andersen() -> list[Rule]:
    """Input: alloc(X, O), copy(X, Y), load(X, Y, K), store(X, K, Y).

    These four rules are the 150 lines of pointer.py.
    """
    return rules("""
        pt(X, O)     :- alloc(X, O).
        pt(X, O)     :- copy(X, Y), pt(Y, O).
        pt(X, P)     :- load(X, Y, K), pt(Y, O), hpt(O, K, P).
        hpt(O, K, P) :- store(X, K, Y), pt(X, O), pt(Y, P).
    """)


def aliases() -> list[Rule]:
    """May-alias, in one more rule: two names that may point to one object."""
    return andersen() + rules("""
        alias(X, Y) :- pt(X, O), pt(Y, O).
    """)


def taint() -> list[Rule]:
    """Input: source(X), sink(X), binop(X, Y), and the four pointer relations.

    Taint through the heap needs pt, so the pointer rules come along: that is
    the aliasing bug of lecture 4, fixed by two extra lines.
    """
    return andersen() + rules("""
        tainted(X)     :- source(X).
        tainted(X)     :- copy(X, Y), tainted(Y).
        tainted(X)     :- binop(X, Y), tainted(Y).
        tainted(X)     :- load(X, Y, K), pt(Y, O), htainted(O, K).
        htainted(O, K) :- store(X, K, Y), pt(X, O), tainted(Y).
        alarm(X)       :- sink(X), tainted(X).
    """)


def reaching_definitions() -> list[Rule]:
    """Input: edge(E, P, Q), def(E, X), and reach(P, X, D) for the parameters.

    Output: reach(Q, X, D) -- the definition of X by edge D reaches point Q.
    The first rule is gen; the `!` in the second is kill.
    """
    return rules("""
        reach(Q, X, E) :- edge(E, P, Q), def(E, X).
        reach(Q, X, D) :- edge(E, P, Q), reach(P, X, D), !def(E, X).
    """)


# =========================================== facts, read off a MiniPy program

def cfg_facts(g) -> set[Atom]:
    """edge(E, P, Q) and def(E, X), the input of the reaching-definitions rules."""
    from syntax import Assign
    out = {Atom("edge", (e.id, e.src, e.dst)) for e in g.edges}
    out |= {Atom("def", (e.id, e.cmd.x)) for e in g.edges
            if isinstance(e.cmd, Assign)}
    # -1 is the "edge" that defines the parameters: the call itself
    return out | {Atom("reach", (g.entry, x, -1)) for x in g.params}


def pointer_facts(prog) -> set[Atom]:
    """alloc/copy/load/store, from the constraints of lecture 7."""
    from pointer import constraints, Alloc, Copy, Load, Store, UNK
    cs = constraints(prog)
    if not any(UNK in (c.x, c.y) for c in cs if not isinstance(c, Alloc)):
        cs = cs[1:]                      # nothing unmodelled: no need for `?`
    out = set()
    for c in cs:
        match c:
            case Alloc(x, o):    out.add(Atom("alloc", (x, str(o))))
            case Copy(x, y):     out.add(Atom("copy", (x, y)))
            case Load(x, y, f):  out.add(Atom("load", (x, y, f)))
            case Store(x, f, y): out.add(Atom("store", (x, f, y)))
    return out


def taint_facts(prog) -> set[Atom]:
    """source/sink/binop, and the loads and stores hidden inside expressions.

    Datalog has no expressions, so a value that is not a variable needs a
    name: `t0` below is the three-address code the rules force us to write.
    """
    from pointer import field
    from syntax import (Var, Index, BinOp, UnOp, ListLit, Assign, IndexAssign,
                        If, While)
    out = {Atom("source", (p,)) for p in prog.params}
    tmp = 0

    def flow(x: str, e) -> None:
        """The facts of x = e."""
        match e:
            case Index(b, i):
                if (y := value(b)) is not None:
                    out.add(Atom("load", (x, y, field(i))))
            case _:
                for sub in parts(e):
                    if (y := value(sub)) is not None and y != x:
                        out.add(Atom("binop", (x, y)))

    def parts(e) -> list:
        """The expressions whose values make up the value of e."""
        match e:
            case Var(_):
                return [e]
            case BinOp(_, l, r):
                return [l, r]
            case UnOp(_, v):
                return [v]
            case ListLit(items):
                return list(items)
            case _:
                return []

    def value(e) -> str | None:
        """A variable that holds the value of e."""
        nonlocal tmp
        match e:
            case Var(x):
                return x
            case _ if not read(e):
                return None                            # only variables carry taint
            case _:
                t = f"t{tmp}"
                tmp += 1
                flow(t, e)
                return t

    def stmt(st) -> None:
        match st:
            case Assign(x, e):
                flow(x, e)
            case IndexAssign(x, i, e):
                if (v := value(e)) is not None:
                    out.add(Atom("store", (x, field(i), v)))
            case If(_, then, els):
                for s in then: stmt(s)
                for s in els:  stmt(s)
            case While(_, body):
                for s in body: stmt(s)

    for s in prog.body:
        stmt(s)
    if (v := value(prog.ret)) is not None:
        out.add(Atom("sink", (v,)))
    return out


def read(e) -> set[str]:
    """The variables e reads."""
    from taint import vars_of
    return set(vars_of(e))


def facts_of(prog) -> set[Atom]:
    """Every input relation the rules above need, for one program."""
    from pointer import STAR
    out = pointer_facts(prog) | taint_facts(prog)
    keys = {a.args[2] for a in out if a.pred == "load"}
    keys |= {a.args[1] for a in out if a.pred == "store"}
    # a computed index may be any element: read, or write, every one of them
    for a in list(out):
        if a.pred == "load" and a.args[2] == STAR:
            out |= {Atom("load", (a.args[0], a.args[1], k)) for k in keys}
        if a.pred == "store" and a.args[1] == STAR:
            out |= {Atom("store", (a.args[0], k, a.args[2])) for k in keys}
    # what a parameter points to came from the caller: its elements are tainted
    ins = {a.args[1] for a in out if a.pred == "alloc" and a.args[0] in prog.params}
    return out | {Atom("htainted", (o, k)) for o in ins for k in keys}
