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

// The type definitions of states and symbols
type State = Int
type Symbol = Char

// The definition of epsilon-NFA
case class ENFA(
  states: Set[State],
  symbols: Set[Symbol],
  trans: Map[(State, Option[Symbol]), Set[State]],
  initState: State,
  finalStates: Set[State],
)

// An example of epsilon-NFA
val enfa: ENFA = ENFA(
  states = Set(0, 1, 2),
  symbols = Set('a', 'b'),
  trans = Map(
    (0, Some('a')) -> Set(1),(1, Some('a')) -> Set(), (2, Some('a')) -> Set(),
    (0, Some('b')) -> Set(), (1, Some('b')) -> Set(2),(2, Some('b')) -> Set(),
    (0, None)      -> Set(), (1, None)      -> Set(), (2, None)      -> Set(0),
  ),
  initState   = 0,
  finalStates = Set(2),
)

// Another example of epsilon-NFA
val enfa2: ENFA = ENFA(
  states = Set(0, 1, 2, 3, 4, 5, 6),
  symbols = Set('a'),
  trans = Map(
    (0, Some('a')) -> Set(),  (0, None) -> Set(1, 4),
    (1, Some('a')) -> Set(),  (1, None) -> Set(2),
    (2, Some('a')) -> Set(),  (2, None) -> Set(1, 3),
    (3, Some('a')) -> Set(),  (3, None) -> Set(),
    (4, Some('a')) -> Set(5), (4, None) -> Set(),
    (5, Some('a')) -> Set(),  (5, None) -> Set(3, 6),
    (6, Some('a')) -> Set(),  (6, None) -> Set(),
  ),
  initState   = 0,
  finalStates = Set(3),
)

// The WRONG definitions of epsilon-closures because of infinite loop
def wrongEClose(enfa: ENFA)(q: State): Set[State] =
  val basis = Set(q) // Basis Case
  val induc = enfa.trans(q, None) // Induction Case
    .flatMap(q => wrongEClose(enfa)(q))
  basis ++ induc

// The definitions of epsilon-closures
def eclose(enfa: ENFA)(q: State): Set[State] =
  def aux(targets: List[State], visited: Set[State]): Set[State] = targets match
    case Nil => visited
    case p :: targets => aux(
      targets = (enfa.trans((p, None)) -- visited).toList ++ targets,
      visited = visited + p,
    )
  aux(List(q), Set())

// The epsilon-closures for state 0, 2, and 5 in enfa2
eclose(enfa2)(0) // Set(0, 1, 2, 3, 4)
eclose(enfa2)(2) // Set(1, 2, 3)
eclose(enfa2)(5) // Set(3, 5, 6)

// The type definition of words
type Word = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The extended transition function of epsilon-NFA
def extTrans(enfa: ENFA)(q: State, w: Word): Set[State] = w match
  case "" => eclose(enfa)(q)
  case a <| x => eclose(enfa)(q)
    .flatMap(q => enfa.trans(q, Some(a)))
    .flatMap(q => extTrans(enfa)(q, x))

// The acceptance of a word by epsilon-NFA
def accept(enfa: ENFA)(w: Word): Boolean =
  val curStates: Set[State] = extTrans(enfa)(enfa.initState, w)
  curStates.intersect(enfa.finalStates).nonEmpty
