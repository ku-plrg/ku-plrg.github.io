"""Static taint analysis: does data from outside reach a dangerous place?

MiniPy has no calls, so the model is given by *name*: the sources are the
parameters (or any set of them), and a sink is the returned expression or a
variable the model names. There is no `escape(...)` to call; what makes data
clean here is a check (`assume(x == literal)`, a validator) or a literal.
The question is the one every taint analysis asks -- can a value the
attacker controls reach a place where it does damage.

It is lecture 3's dataflow analysis with a different gen and kill: a source
generates a fact, an assignment of clean data kills one, and the answer is a
*may* answer, so the join is union. The facts are field sensitive: `xs[0]`
and `xs[1]` are kept apart when the index is a literal.
"""

from __future__ import annotations

from cfg import CFG, Edge, NodeId, Assume, show_expr
from dataflow import Analysis, Data, solve
from syntax import *

STAR = "*"                      # an element we cannot name, or the variable itself
Fact = tuple[str, int | str]    # (variable, literal index) or (variable, STAR)


def of(x: str, t: Data) -> Data:
    """The facts about the variable x."""
    return frozenset(f for f in t if f[0] == x)


def show(t: Data) -> list[str]:
    """The facts as they read: `uid`, `xs[0]`."""
    return sorted(x if i == STAR else f"{x}[{i}]" for x, i in t)


def vars_of(e: Expr) -> frozenset[str]:
    """The variables that occur in e."""
    match e:
        case Num(_) | Str(_) | Bool(_) | NoneLit():
            return frozenset()
        case Var(x):
            return frozenset({x})
        case BinOp(_, l, r):
            return vars_of(l) | vars_of(r)
        case UnOp(_, v):
            return vars_of(v)
        case ListLit(items):
            return frozenset().union(*map(vars_of, items))
        case Index(b, i):
            return vars_of(b) | vars_of(i)
        case _:
            raise NotImplementedError(e)


def tainted(e: Expr, t: Data) -> bool:
    """May e evaluate to attacker-controlled data, given the facts t?"""
    match e:
        case Num(_) | Str(_) | Bool(_) | NoneLit():
            return False
        case Var(x):
            return bool(of(x, t))                   # any part of x
        case Index(Var(x), Num(n)):             # that element, or an unnamed one
            return (x, n) in t or (x, STAR) in t
        case Index(b, _):
            return tainted(b, t)                    # any element of b
        case BinOp(_, l, r):
            return tainted(l, t) or tainted(r, t)
        case UnOp(_, v):
            return tainted(v, t)
        case ListLit(items):
            return any(tainted(i, t) for i in items)
        case _:
            raise NotImplementedError(e)


def gen(x: str, rhs: Expr, t: Data) -> Data:
    """The facts that x = rhs creates, given the facts t."""
    match rhs:
        case ListLit(vs):                       # one fact per element
            return frozenset((x, i) for i, v in enumerate(vs)
                             if tainted(v, t))
        case Var(y):                            # a copy keeps the shape
            return frozenset((x, i) for _, i in of(y, t))
        case _:
            return gen1(x, STAR, rhs, t)


def gen1(x: str, i, rhs: Expr, t: Data) -> Data:
    """The fact x[i] = rhs creates: {(x, i)} when rhs is tainted."""
    return frozenset({(x, i)}) if tainted(rhs, t) else frozenset()


def analysis(g: CFG, sources: frozenset[str] | None = None) -> Analysis:
    """Taint as a may-analysis over sets of facts.

    `sources` are the tainted parameters (all of them by default).
    """
    src = frozenset(g.params) if sources is None else frozenset(sources)

    def transfer(e: Edge, t: Data) -> Data:
        match e.cmd:
            case Assign(x, rhs):               # kill x, then gen
                t = (t - of(x, t)) | gen(x, rhs, t)
            case IndexAssign(x, Num(n), rhs):  # weak update
                t = t | gen1(x, n, rhs, t)
            case IndexAssign(x, _, rhs):
                t = t | gen1(x, STAR, rhs, t)
            case Assume(BinOp("==", Var(x), c)) if not vars_of(c):
                t = t - of(x, t)               # validator: x is c
        return t

    init = frozenset((x, STAR) for x in src)
    return Analysis(True, frozenset(), init, frozenset.union, transfer)


def facts(g: CFG, sources=None) -> dict[NodeId, Data]:
    """The taint facts at each program point."""
    return solve(g, analysis(g, sources))


def alarms(g: CFG, sources=None,
           sinks: frozenset[str] = frozenset()) -> list[tuple[NodeId, str]]:
    """(point, sink) for every sink that may receive tainted data.

    A sink is an assignment to a variable in `sinks` -- think of the argument
    of `os.system(cmd)` -- and, always, the returned expression.
    """
    data = facts(g, sources)
    out = []
    for e in g.edges:
        match e.cmd:
            case Assign(x, rhs) | IndexAssign(x, _, rhs) if x in sinks:
                if tainted(rhs, data[e.src]):
                    out.append((e.src, x))
    if tainted(g.ret, data[g.exit]):
        out.append((g.exit, show_expr(g.ret)))
    return out


def leaks(g: CFG, **model) -> bool:
    """May attacker-controlled data reach any sink?"""
    return bool(alarms(g, **model))
