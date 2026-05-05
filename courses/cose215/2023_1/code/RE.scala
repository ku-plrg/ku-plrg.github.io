/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load RE.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of symbols
type Symbol = Char

// The definition of regular expressions
trait RE
case class REEmpty() extends RE
case class REEpsilon() extends RE
case class RESymbol(symbol: Symbol) extends RE
case class REUnion(left: RE, right: RE) extends RE
case class REConcat(left: RE, right: RE) extends RE
case class REStar(re: RE) extends RE
case class REParen(re: RE) extends RE

// Two examples of regular expressions
val re1: RE = REUnion(
  RESymbol('a'),
  REConcat(REEpsilon(), REStar(RESymbol('b'))),
)

val re2: RE = REConcat(
  REParen(REUnion(RESymbol('a'), REEpsilon())),
  REStar(RESymbol('b')),
)
