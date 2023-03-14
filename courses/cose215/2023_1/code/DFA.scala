/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load DFA.scala
 *
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of states and symbols
type State = Int
type Symbol = Char

// The definition of DFA
case class DFA(
  states: Set[State],
  symbols: Set[Symbol],
  trans: Map[(State, Symbol), State],
  initState: State,
  finalStates: Set[State],
)

// An example of DFA
val dfa: DFA = DFA(
  states = Set(0, 1, 2),
  symbols = Set('0', '1'),
  trans = Map(
    (0, '0') -> 1, (1, '0') -> 2, (2, '0') -> 2,
    (0, '1') -> 0, (1, '1') -> 0, (2, '1') -> 0,
  ),
  initState = 0,
  finalStates = Set(2),
)

// The type definition of words
type Word = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The extended transition function of DFA
def extTrans(dfa: DFA)(q: State, w: Word): State = w match
  case "" => q
  case a <| x => extTrans(dfa)(dfa.trans(q, a), x)

// An example transition for a word "100"
extTrans(dfa)(0, "100") // 2

// The acceptance of a word by DFA
def accept(dfa: DFA)(w: Word): Boolean =
  val curSt: State = extTrans(dfa)(dfa.initState, w)
  dfa.finalStates.contains(curSt)

// An example acceptance of a word "100"
accept(dfa)("100") // true
