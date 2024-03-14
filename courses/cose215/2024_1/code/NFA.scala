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

// The type definitions of states, symbols, and words
type State = Int
type Symbol = Char
type Word = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The definition of NFA
case class NFA(
  states: Set[State],
  symbols: Set[Symbol],
  trans: Map[(State, Symbol), Set[State]],
  initState: State,
  finalStates: Set[State],
):
  // The extended transition function of NFA
  def extTrans(qs: Set[State], w: Word): Set[State] = w match
    case ""     => qs
    case x <| w => extTrans(qs.flatMap(q => trans(q, x)), w)

  // The acceptance of a word by NFA
  def accept(w: Word): Boolean =
    extTrans(Set(initState), w).intersect(finalStates).nonEmpty

// NFA for L = { w a a | w \in {a, b}* }
val nfa_waa: NFA = NFA(
  states      = Set(0, 1, 2),
  symbols     = Set('a', 'b'),
  trans       = Map(
    (0, 'a') -> Set(0, 1),
    (0, 'b') -> Set(0),
    (1, 'a') -> Set(2),
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(2),
)

// NFA for L = { a^n b | n >= 0 }
val nfa_anb: NFA = NFA(
  states      = Set(0, 1),
  symbols     = Set('a', 'b'),
  trans       = Map(
    (0, 'a') -> Set(0),
    (0, 'b') -> Set(1),
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(1),
)

// NFA for L = { w \in {0, 1}* | w contains exactly two 0's }
val nfa_two_zeros: NFA = NFA(
  states      = Set(0, 1, 2),
  symbols     = Set('0', '1'),
  trans       = Map(
    (0, '0') -> Set(1),
    (0, '1') -> Set(0),
    (1, '2') -> Set(2),
    (1, '1') -> Set(1),
    (2, '1') -> Set(2),
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(2),
)

// NFA for L = { w \in {a, b}* | w contains three consecutive a's }
val nfa_three_consecutive_as: NFA = NFA(
  states      = Set(0, 1, 2, 3),
  symbols     = Set('a', 'b'),
  trans       = Map(
    (0, 'a') -> Set(0, 1),
    (0, 'b') -> Set(0),
    (1, 'a') -> Set(2),
    (2, 'a') -> Set(3),
    (3, 'a') -> Set(3),
    (3, 'b') -> Set(3),
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(3),
)

// NFA for L = { w \in {0, 1}* | N(w) \equiv 0 (mod 3) }
// where N(w) is the natural number represented by w in binary
val nfa_mod3: NFA = NFA(
  states      = Set(0, 1, 2),
  symbols     = Set('0', '1'),
  trans       = Map(
    (0, '0') -> Set(0),
    (0, '1') -> Set(1),
    (1, '0') -> Set(2),
    (1, '1') -> Set(0),
    (2, '0') -> Set(1),
    (2, '1') -> Set(2),
  ),
  initState   = 0,
  finalStates = Set(0),
)
