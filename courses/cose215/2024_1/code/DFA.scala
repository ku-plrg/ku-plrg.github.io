/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load DFA.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of states, symbols, and words
type State = Int
type Symbol = Char
type Word = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The definition of DFA
case class DFA(
  states: Set[State],
  symbols: Set[Symbol],
  trans: Map[(State, Symbol), State],
  initState: State,
  finalStates: Set[State],
):
  // The extended transition function of DFA
  def extTrans(q: State, w: Word): State = w match
    case ""     => q
    case x <| w => extTrans(trans(q, x), w)

  // The acceptance of a word by DFA
  def accept(w: Word): Boolean =
    finalStates.contains(extTrans(initState, w))

// DFA for example 1
val dfa1: DFA = DFA(
  states      = Set(0, 1, 2),
  symbols     = Set('a', 'b'),
  trans       = Map(
    (0, 'a') -> 1, (1, 'a') -> 2, (2, 'a') -> 2,
    (0, 'b') -> 0, (1, 'b') -> 0, (2, 'b') -> 0,
  ),
  initState   = 0,
  finalStates = Set(2),
)

// DFA for example 2
val dfa2: DFA = DFA(
  states      = Set(0, 1, 2),
  symbols     = Set('a', 'b'),
  trans       = Map(
    (0, 'a') -> 0, (1, 'a') -> 2, (2, 'a') -> 2,
    (0, 'b') -> 1, (1, 'b') -> 2, (2, 'b') -> 2,
  ),
  initState   = 0,
  finalStates = Set(1),
)

// DFA for example 3
val dfa3: DFA = DFA(
  states      = Set(0, 1, 2),
  symbols     = Set('0', '1'),
  trans       = Map(
    (0, '0') -> 0, (1, '0') -> 2, (2, '0') -> 1,
    (0, '1') -> 1, (1, '1') -> 0, (2, '1') -> 2,
  ),
  initState   = 0,
  finalStates = Set(0),
)
