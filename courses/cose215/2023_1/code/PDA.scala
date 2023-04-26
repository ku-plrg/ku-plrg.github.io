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
type Alphabet = Char

// The definition of PDA
case class PDA(
  states: Set[State],
  symbols: Set[Symbol],
  alphabets: Set[Alphabet],
  trans: Map[(State, Option[Symbol], Alphabet), Set[(State, List[Alphabet])]],
  initState: State,
  initAlphabet: Alphabet,
  finalStates: Set[State],
)

// An example of PDA
val pda1: PDA = PDA(
  states      = Set(0, 1, 2),         symbols       = Set('a', 'b'),
  alphabets   = Set('Z', 'X'),        trans         = Map(
    (0, Some('a'), 'Z') -> Set((0, List('X', 'Z'))),
    (0, Some('a'), 'X') -> Set((0, List('X', 'X'))),
    (0, None,      'Z') -> Set((1, List('Z'))),
    (0, None,      'X') -> Set((1, List('X'))),
    (1, Some('b'), 'X') -> Set((1, List())),
    (1, None,      'Z') -> Set((2, List('Z'))),
  ).withDefaultValue(Set()),
  initState   = 0,                    initAlphabet  = 'Z',
  finalStates = Set(2),
)

// The type definition of configurations
type Config = (State, Word, List[Alphabet])

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// Configurations reachable from the initial configuration by one-step moves
def reachableConfig(pda: PDA)(init: Config): Set[Config] =
  def aux(
    targets: List[Config],
    visited: Set[Config]
  ): Set[Config] = targets match
    case Nil => visited
    case config :: targets => aux(
      targets =
        val (q, w, xs) = config
        (
          eclose(pda)(q, xs).map { case (q, xs) => (q, w, xs) }
          ++ ((w, xs) match
            case (a <| w, x :: xs) => pda.trans((q, Some(a), x)).map {
              case (q, ys) => (q, w, ys ++ xs)
            }
            case _ => Set()
          )
          -- visited
        ).toList ++ targets,
      visited = visited + config,
    )
  aux(List(init), Set())

// The epsilon-closures for pairs of states and stack alphabet sequences in PDA
def eclose(pda: PDA)(
  q: State,
  xs: List[Alphabet]
): Set[(State, List[Alphabet])] =
  def aux(
    targets: List[(State, List[Alphabet])],
    reachable: Set[(State, List[Alphabet])],
  ): Set[(State, List[Alphabet])] = targets match
    case Nil => reachable
    case (q, xs) :: targets => aux(
      (xs match
        case x :: xs => (pda.trans(q, None, x).map {
          case (q, ys) => (q, ys ++ xs)
        } -- reachable).toList
        case _ => Nil
      ) ++ targets,
      reachable + ((q, xs)),
    )
  aux(List((q, xs)), Set())

// Acceptance by final states
def acceptByFinalState(pda: PDA)(word: Word): Boolean =
  val init: Config = (pda.initState, word, List(pda.initAlphabet))
  reachableConfig(pda)(init).exists(config => {
    val (q, w, xs) = config
    w.isEmpty && pda.finalStates.contains(q)
  })

acceptByFinalState(pda1)("ab")   // true
acceptByFinalState(pda1)("aba")  // false
acceptByFinalState(pda1)("aabb") // true
acceptByEmptyStack(pda1)("abab") // false

// Acceptance by empty stacks
def acceptByEmptyStack(pda: PDA)(word: Word): Boolean =
  val init: Config = (pda.initState, word, List(pda.initAlphabet))
  reachableConfig(pda)(init).exists(config => {
    val (q, w, xs) = config
    w.isEmpty && xs.isEmpty
  })

// Another example of PDA
val pda2: PDA = PDA(
  states      = Set(0, 1, 2),         symbols       = Set('a', 'b'),
  alphabets   = Set('Z', 'X'),        trans         = Map(
    (0, Some('a'), 'Z') -> Set((0, List('X', 'Z'))),
    (0, Some('a'), 'X') -> Set((0, List('X', 'X'))),
    (0, None,      'Z') -> Set((1, List('Z'))),
    (0, None,      'X') -> Set((1, List('X'))),
    (1, Some('b'), 'X') -> Set((1, List())),
    (1, None,      'Z') -> Set((2, List())),
  ).withDefaultValue(Set()),
  initState   = 0,                    initAlphabet  = 'Z',
  finalStates = Set(),
)

acceptByEmptyStack(pda2)("ab")   // true
acceptByEmptyStack(pda2)("aba")  // false
acceptByEmptyStack(pda2)("aabb") // true
acceptByEmptyStack(pda2)("abab") // false
