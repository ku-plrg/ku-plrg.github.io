/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load PDA.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of states, symbols, words, and stack alphabets
type State = Int
type Symbol = Char
type Word = String
type Alphabet = String

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The type definition of configurations
case class Config(state: State, word: Word, stack: List[Alphabet])

// The definition of pushdown automata (PDA)
case class PDA(
  states: Set[State],
  symbols: Set[Symbol],
  alphabets: Set[Alphabet],
  trans: Map[(State, Option[Symbol], Alphabet), Set[(State, List[Alphabet])]],
  initState: State,
  initAlphabet: Alphabet,
  finalStates: Set[State],
) {
  // Configurations reachable from the initial configuration
  def reachableConfig(init: Config): Set[Config] =
    def aux(
      targets: List[Config],
      visited: Set[Config],
    ): Set[Config] = targets match
      case Nil => visited
      case config :: targets =>
        val Config(q, w, xs) = config
        aux(
          targets = (
            eclo(q, xs).map {
              case (q, xs) => Config(q, w, xs)
            } ++ ((w, xs) match
              case (a <| w, x :: xs) =>
                trans((q, Some(a), x)).map {
                  case (q, ys) => Config(q, w, ys ++ xs)
                }
              case _ => Set()
            ) -- visited - config
          ).toList ++ targets,
          visited = visited + config,
        )
    aux(List(init), Set())

  // The epsilon-closures for pairs of states and stacks
  def eclo(q: State, xs: List[Alphabet]): Set[(State, List[Alphabet])] =
    def aux(
      rest: List[(State, List[Alphabet])],
      visited: Set[(State, List[Alphabet])],
    ): Set[(State, List[Alphabet])] = rest match
      case Nil => visited
      case (q, xs) :: targets =>
        aux(
          rest = (xs match
            case x :: ys =>
              (trans(q, None, x).map {
                case (q, zs) => (q, zs ++ ys)
              } -- visited - ((q, xs))).toList
            case _ => Nil
          ) ++ targets,
          visited = visited + ((q, xs)),
        )
    aux(List((q, xs)), Set())

  // The initial configuration
  def init(word: Word): Config =
    Config(initState, word, List(initAlphabet))

  // Acceptance by final states
  def acceptByFinalState(word: Word): Boolean =
    reachableConfig(init(word)).exists(config => {
      val Config(q, w, _) = config
      w.isEmpty && finalStates.contains(q)
    })

  // Acceptance by empty stacks
  def acceptByEmptyStack(word: Word): Boolean =
    reachableConfig(init(word)).exists(config => {
      val Config(_, w, xs) = config
      w.isEmpty && xs.isEmpty
    })
}

// PDA accepting L = { a^n b^n | n >= 0 } by final states
val pda1: PDA = PDA(
  states = Set(0, 1, 2),
  symbols = Set('a', 'b'),
  alphabets = Set("X", "Z"),
  trans = Map(
    (0, Some('a'), "Z") -> Set((0, List("X", "Z"))),
    (0, Some('a'), "X") -> Set((0, List("X", "X"))),
    (0, None, "Z") -> Set((1, List("Z"))),
    (0, None, "X") -> Set((1, List("X"))),
    (1, Some('b'), "X") -> Set((1, List())),
    (1, None, "Z") -> Set((2, List("Z"))),
  ).withDefaultValue(Set()),
  initState = 0,
  initAlphabet = "Z",
  finalStates = Set(2),
)

// PDA accepting L = { a^n b^n | n >= 0 } by empty stacks
val pda2: PDA = PDA(
  states = Set(0, 1, 2),
  symbols = Set('a', 'b'),
  alphabets = Set("X", "Z"),
  trans = Map(
    (0, Some('a'), "Z") -> Set((0, List("X", "Z"))),
    (0, Some('a'), "X") -> Set((0, List("X", "X"))),
    (0, None, "Z") -> Set((1, List("Z"))),
    (0, None, "X") -> Set((1, List("X"))),
    (1, Some('b'), "X") -> Set((1, List())),
    (1, None, "Z") -> Set((2, List())),
  ).withDefaultValue(Set()),
  initState = 0,
  initAlphabet = "Z",
  finalStates = Set(),
)
