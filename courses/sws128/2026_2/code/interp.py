"""A concrete interpreter for MiniPy, transcribing the big-step rules."""

from __future__ import annotations

from dataclasses import dataclass

from syntax import *


@dataclass(frozen=True)
class Loc:
    """A heap location: what a list expression evaluates to."""
    addr: int


Value = int | bool | str | None | Loc    #  v ::= n | s | true | false | None | l
Heap = dict[Loc, tuple[Value, ...]]      #  H in L -> V*
State = dict[str, Value]                 #  s in X -> V


def eval_expr(e: Expr, h: Heap, s: State) -> tuple[Value, Heap]:
    """<h, s> |- e => <v, h'>"""
    match e:
        case Num(n):
            return n, h
        case Str(t):
            return t, h
        case Bool(b):
            return b, h
        case NoneLit():
            return None, h
        case Var(x):
            return s[x], h
        case BinOp("and", l, r):
            v, h = eval_expr(l, h, s)
            return (v, h) if not v else eval_expr(r, h, s)
        case BinOp("or", l, r):
            v, h = eval_expr(l, h, s)
            return (v, h) if v else eval_expr(r, h, s)
        case BinOp(op, l, r):
            a, h = eval_expr(l, h, s)
            b, h = eval_expr(r, h, s)
            if isinstance(a, Loc) or isinstance(b, Loc):
                raise TypeError(f"no rule for {op} on lists")   # not `==` either
            match op:
                case "+":  return a + b, h
                case "*":  return a * b, h
                case "<":  return a < b, h
                case "<=": return a <= b, h
                case "==": return a == b, h
                case "!=": return a != b, h
            raise NotImplementedError(op)
        case UnOp("-", v):
            n, h = eval_expr(v, h, s)
            return -n, h
        case UnOp("not", v):
            b, h = eval_expr(v, h, s)
            return not b, h
        case ListLit(items):
            vals = []
            for i in items:
                v, h = eval_expr(i, h, s)
                vals.append(v)
            loc = Loc(len(h))                        # l not in dom(h)
            return loc, {**h, loc: tuple(vals)}
        case Index(base, idx):
            loc, h = eval_expr(base, h, s)
            n, h = eval_expr(idx, h, s)
            return h[loc][n], h
        case _:
            raise NotImplementedError(e)


def exec_block(body: Block, h: Heap, s: State) -> tuple[Heap, State]:
    for st in body:
        h, s = exec_stmt(st, h, s)
    return h, s


def exec_stmt(st: Stmt, h: Heap, s: State) -> tuple[Heap, State]:
    """<h, s> |- st => <h', s'>"""
    match st:
        case Pass():
            return h, s
        case Assign(x, e):
            v, h = eval_expr(e, h, s)
            return h, {**s, x: v}
        case IndexAssign(x, idx, e):
            loc = s[x]
            n, h = eval_expr(idx, h, s)
            v, h = eval_expr(e, h, s)
            return {**h, loc: h[loc][:n] + (v,) + h[loc][n + 1:]}, s
        case If(c, then, els):
            b, h = eval_expr(c, h, s)
            return exec_block(then if b else els, h, s)
        case While(c, body):
            b, h = eval_expr(c, h, s)
            while b:
                h, s = exec_block(body, h, s)
                b, h = eval_expr(c, h, s)
            return h, s
        case _:
            raise NotImplementedError(st)


def run(prog: Prog, args: list[Value]) -> Value:
    """Run the function on `args`: the parameters are the input, the result the output."""
    h, s = exec_block(prog.body, {}, dict(zip(prog.params, args)))
    v, _ = eval_expr(prog.ret, h, s)
    return v
