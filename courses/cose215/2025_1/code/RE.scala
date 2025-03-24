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
enum RE:
  case Emp
  case Eps
  case Sym(symbol: Symbol)
  case Union(left: RE, right: RE)
  case Concat(left: RE, right: RE)
  case Star(re: RE)

import RE.*

// a | ε b*
val re1: RE = Union(Sym('a'), Concat(Eps, Star(Sym('b'))))

// (a | ε) b*
val re2: RE = Concat(Union(Sym('a'), Eps), Star(Sym('b')))
