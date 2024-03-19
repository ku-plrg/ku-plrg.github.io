/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load ENFA.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of states, symbols, and words
type State = Int
type Symbol = Char
type Word = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The definition of epsilon-NFA
case class ENFA(
  states: Set[State],
  symbols: Set[Symbol],
  trans: Map[(State, Option[Symbol]), Set[State]],
  initState: State,
  finalStates: Set[State],
):
  // The definitions of epsilon-closures
  def eclo(q: State): Set[State] =
    def aux(rest: List[State], visited: Set[State]): Set[State] = rest match
      case Nil          => visited
      case p :: targets => aux(
        rest    = (trans((p, None)) -- visited).toList ++ targets,
        visited = visited + p,
      )
    aux(List(q), Set())

  // The epsilon-closure of a set of states
  def eclo(qs: Set[State]): Set[State] = qs.flatMap(eclo)

  // The extended transition function of epsilon-NFA
  def extTrans(qs: Set[State], w: Word): Set[State] = w match
    case ""     => eclo(qs)
    case x <| w => extTrans(eclo(qs).flatMap(q => trans(q, Some(x))), w)

  // The acceptance of a word by epsilon-NFA
  def accept(w: Word): Boolean =
    extTrans(Set(initState), w).intersect(finalStates).nonEmpty

// ENFA for L = { (ab)^n | n >= 0 }
val enfa_ab_n: ENFA = ENFA(
  states = Set(0, 1, 2),
  symbols = Set('a', 'b'),
  trans = Map(
    (0, Some('a')) -> Set(1),     // (0, a) -> 1
    (1, Some('b')) -> Set(2),     // (1, b) -> 2
    (2, None)      -> Set(0),     // (2, @$\epsilon$@) -> 0
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(2),
)

// ENFA for L = { a }
val enfa_a: ENFA = ENFA(
  states = Set(0, 1, 2, 3, 4, 5, 6),
  symbols = Set('a'),
  trans = Map(
    (0, None)      -> Set(1, 4),
    (1, None)      -> Set(2),
    (2, None)      -> Set(1, 3),
    (4, Some('a')) -> Set(5),
    (5, None)      -> Set(3, 6),
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(3),
)

// ENFA for L = { a^i b*j c^k | i, j, k >= 0 }
val enfa_ai_bj_ck: ENFA = ENFA(
  states = Set(0, 1, 2),
  symbols = Set('a', 'b', 'c'),
  trans = Map(
    (0, Some('a')) -> Set(0),
    (0, None)      -> Set(1),
    (1, Some('b')) -> Set(1),
    (1, None)      -> Set(2),
    (2, Some('c')) -> Set(2),
  ).withDefaultValue(Set()),
  initState   = 0,
  finalStates = Set(2),
)
