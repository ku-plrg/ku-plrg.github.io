/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load NFA.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of states and symbols
type State = Int
type Symbol = Char

// The definition of NFA
case class NFA(
  states: Set[State],
  symbols: Set[Symbol],
  trans: Map[(State, Symbol), Set[State]],
  initState: State,
  finalStates: Set[State],
)

// An example of NFA
val nfa: NFA = NFA(
  states  = Set(0, 1, 2),
  symbols = Set('0', '1'),
  trans = Map(
    (0, '0') -> Set(0, 1),  (1, '0') -> Set(2), (2, '0') -> Set(),
    (0, '1') -> Set(0),     (1, '1') -> Set(),  (2, '1') -> Set(),
  ),
  initState  = 0,
  finalStates = Set(2),
)

// The type definition of words
type Word = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The extended transition function of NFA
def extTrans(nfa: NFA)(q: State, w: Word): Set[State] = w match
  case "" => Set(q)
  case a <| x => for {
    p <- nfa.trans(q, a)
    r <- extTrans(nfa)(p, x)
  } yield r

// An example transition for a word "100"
extTrans(nfa)(0, "100") // Set(0, 1, 2)

// The acceptance of a word by NFA
def accept(nfa: NFA)(w: Word): Boolean =
  val curStates: Set[State] = extTrans(nfa)(nfa.initState, w)
  curStates.intersect(nfa.finalStates).nonEmpty

// An example acceptance of a word "100"
accept(nfa)("100") // true
