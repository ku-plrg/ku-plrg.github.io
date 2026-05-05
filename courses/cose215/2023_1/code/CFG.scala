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

// The type definitions of symbols and variables
type Symbol = Char
type Variable = String

// The definition of context-free grammars
case class CFG(
  variables: Set[Variable],
  symbols: Set[Symbol],
  start: Variable,
  productions: Set[(Variable, List[Variable | Symbol])],
)

// An example of CFG
val cfg1: CFG = CFG(
  variables = Set("S", "A", "B"),
  symbols = Set('(', ')'),
  start = "S",
  productions = Set(
    "S" -> Nil,
    "S" -> List("A"),
    "S" -> List("B"),
    "A" -> List('(', "S", ')'),
    "B" -> List("S", "S"),
  ),
)
