"""A worklist engine for dataflow analyses."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from cfg import CFG, Cmd, Edge, Assume, NodeId, Worklist
from syntax import *

Data = frozenset


@dataclass(frozen=True)
class Analysis:
    forward: bool
    bottom: Data                                   # initial guess everywhere
    init: Data                                     # the data at the start point
    join: Callable[[Data, Data], Data]
    transfer: Callable[[Edge, Data], Data]         # what one edge does


def solve(g: CFG, a: Analysis) -> dict[NodeId, Data]:
    """Least fixpoint of the dataflow equations: one set per program point.

        forward:   data(q) = join of transfer(e, data(p)) for every edge p -> q
        backward:  data(p) = join of transfer(e, data(q)) for every edge p -> q
    """
    start = g.entry if a.forward else g.exit
    data = {p: a.bottom for p in g}
    data[start] = a.init
    work = Worklist([start])
    reached = {start}
    while work:
        p = work.pop()
        for e in (g.succ[p] if a.forward else g.pred[p]):
            q = e.dst if a.forward else e.src
            new = a.join(data[q], a.transfer(e, data[p]))
            if new != data[q] or q not in reached:    # changed, or seen first
                data[q] = new
                reached.add(q)
                work.push(q)
    return data


# ------------------------------------------------------- dominators, again

def dominators(g: CFG) -> Analysis:
    """Which points must have run before this one?"""
    def transfer(e: Edge, s: Data) -> Data:
        return s | {e.dst}                          # kill nothing, gen q

    return Analysis(True, frozenset(g.nodes), frozenset({g.entry}),
                    frozenset.intersection, transfer)
