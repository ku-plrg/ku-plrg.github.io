"""MiniPy abstract syntax, and normalization from Python's own AST."""

from __future__ import annotations

import ast as py
import sys
from dataclasses import dataclass

if sys.version_info < (3, 10):
    raise RuntimeError(
        f"MiniPy needs Python 3.10 or later for structural pattern matching; "
        f"this is {sys.version_info.major}.{sys.version_info.minor}."
    )


class Unsupported(Exception):
    """Raised for Python syntax that is outside MiniPy."""

    def __init__(self, node: py.AST, why: str = ""):
        loc = getattr(node, "lineno", "?")
        what = why or f"{type(node).__name__} is not in MiniPy"
        super().__init__(f"line {loc}: {what}")


# ---------------------------------------------------------------- expressions

@dataclass(frozen=True)
class Expr: pass


@dataclass(frozen=True)
class Num(Expr):
    n: int


@dataclass(frozen=True)
class Str(Expr):
    s: str


@dataclass(frozen=True)
class Bool(Expr):
    b: bool


@dataclass(frozen=True)
class NoneLit(Expr): pass


@dataclass(frozen=True)
class Var(Expr):
    x: str


@dataclass(frozen=True)
class BinOp(Expr):
    op: str
    left: Expr
    right: Expr


@dataclass(frozen=True)
class UnOp(Expr):
    op: str
    operand: Expr


@dataclass(frozen=True)
class ListLit(Expr):
    items: tuple[Expr, ...]


@dataclass(frozen=True)
class Index(Expr):
    base: Expr
    idx: Expr


# ----------------------------------------------------------------- statements

@dataclass(frozen=True)
class Stmt: pass


Block = tuple["Stmt", ...]


@dataclass(frozen=True)
class Assign(Stmt):
    x: str
    e: Expr


@dataclass(frozen=True)
class IndexAssign(Stmt):
    x: str
    idx: Expr
    e: Expr


@dataclass(frozen=True)
class If(Stmt):
    cond: Expr
    then: Block
    els: Block


@dataclass(frozen=True)
class While(Stmt):
    cond: Expr
    body: Block


@dataclass(frozen=True)
class Pass(Stmt): pass


# -------------------------------------------------------------------- program

@dataclass(frozen=True)
class Prog:
    """`def name(params): body; return ret` -- one function, return only at the end."""
    name: str
    params: tuple[str, ...]
    body: Block
    ret: Expr


# -------------------------------------------------------------- normalization

BINOPS: dict[type, str] = {
    py.Add: "+",
    py.Mult: "*",
}

CMPOPS: dict[type, str] = {
    py.Lt: "<",
    py.LtE: "<=",
    py.Eq: "==",
    py.NotEq: "!=",
}

UNOPS: dict[type, str] = {
    py.USub: "-",
    py.Not: "not",
}


def expr(node: py.expr) -> Expr:
    match node:
        case py.Constant(value=bool(b)):
            return Bool(b)
        case py.Constant(value=int(n)):
            return Num(n)
        case py.Constant(value=str(s)):
            return Str(s)
        case py.Constant(value=None):
            return NoneLit()
        case py.Name(id=x):
            return Var(x)
        case py.BinOp(left=l, op=op, right=r) if type(op) in BINOPS:
            return BinOp(BINOPS[type(op)], expr(l), expr(r))
        case py.UnaryOp(op=op, operand=v) if type(op) in UNOPS:
            return UnOp(UNOPS[type(op)], expr(v))
        case py.BoolOp(op=op, values=vs):
            # Python flattens `a and b and c`; we nest it to the right.
            name = "and" if isinstance(op, py.And) else "or"
            es = [expr(v) for v in vs]
            r = es[-1]
            for l in reversed(es[:-1]):
                r = BinOp(name, l, r)
            return r
        case py.Compare(left=l, ops=[op], comparators=[r]) if type(op) in CMPOPS:
            return BinOp(CMPOPS[type(op)], expr(l), expr(r))
        case py.List(elts=items):
            return ListLit(tuple(expr(i) for i in items))
        case py.Subscript(value=b, slice=i):
            return Index(expr(b), expr(i))
        case _:
            raise Unsupported(node)


def block(nodes: list[py.stmt]) -> Block:
    return tuple(stmt(n) for n in nodes)


def stmt(node: py.stmt) -> Stmt:
    match node:
        case py.Assign(targets=[py.Name(id=x)], value=v):
            return Assign(x, expr(v))
        case py.Assign(targets=[py.Subscript(value=py.Name(id=x), slice=i)], value=v):
            return IndexAssign(x, expr(i), expr(v))
        case py.If(test=c, body=t, orelse=e):
            return If(expr(c), block(t), block(e))
        case py.While(test=c, body=b, orelse=[]):
            return While(expr(c), block(b))
        case py.Pass():
            return Pass()
        case py.Return():
            raise Unsupported(node, "return is allowed only as the last statement")
        case _:
            raise Unsupported(node)


def parse(src: str) -> Prog:
    """Parse MiniPy source into a Prog, rejecting anything outside the subset."""
    match py.parse(src).body:
        case [py.FunctionDef(name=name, args=a, body=[*body, py.Return(value=ret)],
                             decorator_list=[])] if (
            ret is not None
            and not a.posonlyargs and not a.kwonlyargs and not a.defaults
            and a.vararg is None and a.kwarg is None
        ):
            return Prog(name, tuple(p.arg for p in a.args), block(body), expr(ret))
        case [py.FunctionDef() as fn]:
            raise Unsupported(fn, "a program is one `def` ending with `return e`")
        case [first, *_]:
            raise Unsupported(first, "a program is exactly one `def`")
        case []:
            raise Unsupported(py.Module(body=[]), "empty program")
