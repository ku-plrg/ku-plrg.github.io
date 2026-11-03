"""Andersen's points-to analysis: inclusion-based, flow-insensitive."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

from syntax import *

STAR = "*"          # the element of a list whose index is not a literal
UNK = "?"           # a pseudo-variable standing for what we do not model


@dataclass(frozen=True)
class Obj:
    """An abstract object, named by whatever allocates it.

    `o3` is the list literal at the third allocation site: one abstract
    object for every concrete list that site ever allocates. `in_xs` is
    whatever the caller passed in as `xs`, and `?` is everything the
    analysis declines to model.
    """
    name: str

    def __str__(self) -> str:
        return self.name


ANY = Obj(UNK)


# the four constraints
@dataclass(frozen=True)
class Alloc:  x: str; obj: Obj                       # x = [..]     o in pt(x)
@dataclass(frozen=True)
class Copy:   x: str; y: str                         # x = y        pt(y) <= pt(x)
@dataclass(frozen=True)
class Load:   x: str; y: str; f: str                 # x = y[f]
@dataclass(frozen=True)
class Store:  x: str; f: str; y: str                 # x[f] = y


def field(e: Expr) -> str:
    """The field an index expression selects.

    A literal index is its own field, so xs[0] and xs[1] stay apart. Any
    computed index falls back to one merged field: that is how far a
    field-sensitive analysis gets on arrays.
    """
    return str(e.n) if isinstance(e, Num) else STAR


def source(e: Expr) -> str | None:
    """The variable whose points-to set flows out of e.

    None when e can never be a location -- a number, a string, a comparison.
    UNK when it can be one but is not one of the four shapes below, which is
    where this analysis gives up soundly. A real tool has a hundred of these
    cases, and that is the subject of lecture 12.
    """
    match e:
        case Var(x):
            return x
        case Num(_) | Str(_) | Bool(_) | NoneLit() | BinOp(_, _, _) | UnOp(_, _):
            return None
        case _:
            return UNK


def constraints(prog: Prog) -> list:
    """Collect the four kinds of constraint, numbering allocation sites."""
    out, site = [Alloc(UNK, ANY)], 0

    # A parameter holds whatever the caller passed: one object per parameter.
    for p in prog.params:                  # one object per parameter
        out.append(Alloc(p, Obj(f"in_{p}")))

    def stmt(st: Stmt) -> None:
        nonlocal site
        match st:
            case Assign(x, ListLit(items)):    # x = [..]
                out.append(Alloc(x, Obj(f"o{site}")))
                site += 1
                for k, i in enumerate(items):
                    if (y := source(i)) is not None:
                        out.append(Store(x, str(k), y))
            case Assign(x, Var(y)):            # x = y
                out.append(Copy(x, y))
            case Assign(x, Index(Var(y), i)):  # x = y[i]
                out.append(Load(x, y, field(i)))
            case Assign(x, e):
                if (y := source(e)) is not None:
                    out.append(Copy(x, y))
            case IndexAssign(x, i, e):         # x[i] = e
                if (y := source(e)) is not None:
                    out.append(Store(x, field(i), y))
            case If(_, then, els):
                for s in then: stmt(s)
                for s in els:  stmt(s)
            case While(_, body):
                for s in body: stmt(s)
            case _:
                pass

    for s in prog.body:
        stmt(s)
    return out


def andersen(cs: list) -> dict:
    """Least solution of the inclusion constraints.

    Keys are variable names and (Obj, field) pairs; values are sets of Obj.
    """
    pt: dict = defaultdict(set)
    changed = True
    while changed:
        changed = False

        def grow(k, objs) -> None:
            nonlocal changed
            if not objs <= pt[k]:
                pt[k] |= objs
                changed = True

        for c in cs:
            match c:
                case Alloc(x, o):     grow(x, {o})
                case Copy(x, y):      grow(x, set(pt[y]))
                case Load(x, y, f):
                    for o in set(pt[y]):
                        grow(x, set(pt[(o, f)]))
                case Store(x, f, y):
                    for o in set(pt[x]):
                        grow((o, f), set(pt[y]))
    return dict(pt)


def points_to(prog: Prog) -> dict:
    return andersen(constraints(prog))


def may_alias(pt: dict, a: str, b: str) -> bool:
    """Might a and b be two names for one list?"""
    pa, pb = pt.get(a, set()), pt.get(b, set())
    if ANY in pa or ANY in pb:
        return True                       # unmodelled: we must say maybe
    return bool(pa & pb)


def show(pt: dict) -> str:
    lines = []
    for k in sorted(pt, key=str):
        if not pt[k] or k == UNK:
            continue
        name = k if isinstance(k, str) else f"{k[0]}[{k[1]}]"
        lines.append(f"  pt({name}) = {{{', '.join(sorted(map(str, pt[k])))}}}")
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    print(show(points_to(parse(open(sys.argv[1]).read()))))
