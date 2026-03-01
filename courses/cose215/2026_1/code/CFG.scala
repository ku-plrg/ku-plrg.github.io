/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load CFG.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The definition of variables (nonterminals)
type Nt = String

// The type definitions of symbols (terminals)
type Symbol = Char

// The definition of right-hand side of a production rule
case class Rhs(seq: List[Nt | Symbol])

// The definition of context-free grammars
case class CFG(
  nts: Set[Nt],
  symbols: Set[Symbol],
  start: Nt,
  rules: Map[Nt, List[Rhs]],
)

// An example of CFG:
//   S -> <e> | A | B ;
//   A -> '(' S ')' ;
//   B -> S S ;
val cfg: CFG = CFG(
  nts = Set("S", "A", "B"),
  symbols = Set('(', ')'),
  start = "S",
  rules = Map(
    "S" -> List(
      Rhs(List()),
      Rhs(List("A")),
      Rhs(List("B"))
    ),
    "A" -> List(
      Rhs(List('(', "S", ')'))
    ),
    "B" -> List(
      Rhs(List("S", "S"))
    )
  ),
)
