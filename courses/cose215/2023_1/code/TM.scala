/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load TM.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of states, symbols, tape symbols, and tape head moves
type State = Int
type Symbol = Char
type TapeSymbol = Char
enum HeadMove { case L, R }
import HeadMove.*

// The definition of Turing machines
case class TM(
  states: Set[State],
  symbols: Set[Symbol],
  tapeSymbols: Set[TapeSymbol],
  trans: Map[(State, TapeSymbol), (State, TapeSymbol, HeadMove)],
  initState: State,
  blankSymbol: TapeSymbol,
  finalStates: Set[State],
)

// An example of Turing machine
val tm1: TM = TM(
  states      = Set(0, 1, 2),
  symbols     = Set('0', '1'),
  tapeSymbols = Set('0', '1', 'B'),
  trans       = Map(
    (0, '0') -> (0, '1', R),  (1, '0') -> (1, '0', L),
    (0, '1') -> (0, '0', R),  (1, '1') -> (1, '1', L),
    (0, 'B') -> (1, 'B', L),  (1, 'B') -> (2, 'B', R),
  ),
  initState   = 0,
  blankSymbol = 'B',
  finalStates = Set(2),
)

// The type definitions of words, tapes, and configurations
type Word = String
type Tape = String
case class Config(prev: Tape, state: State, cur: TapeSymbol, next: Tape)

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// A helper function to check whether a state is final
def isFinal(tm: TM)(state: State): Boolean = tm.finalStates.contains(state)

// A one-step move in a Turing machine
def move(tm: TM)(config: Config): Option[Config] =
  val Config(prev, curSt, x, next) = config
  val B = tm.blankSymbol
  tm.trans.get(curSt, x).map {
    case (nextSt, y, L) => Config(
      prev = prev.dropRight(1),
      state = nextSt,
      cur = prev.lastOption.getOrElse(B),
      next = if (next == "" && y == B) "" else y + next,
    )
    case (nextSt, y, R) => Config(
      prev = if (prev == "" && y == B) "" else prev + y,
      state = nextSt,
      cur = next.headOption.getOrElse(B),
      next = next.drop(1),
    )
  }

// The initial configuration of a Turing machine
def initConfig(tm: TM)(word: Word): Config = word match
  case a <| x => Config("", tm.initState, a, x)
  case _      => Config("", tm.initState, tm.blankSymbol, "")

// A configuration at which a Turing machine halts on a word or a configuration
def haltsAt(tm: TM)(word: Word): Config = haltsAt(tm)(initConfig(tm)(word))
def haltsAt(tm: TM)(config: Config): Config = move(tm)(config) match
  case None             => config
  case Some(nextConfig) => haltsAt(tm)(nextConfig)

// The acceptance of a word by a Turing machine
def accept(tm: TM)(word: Word): Boolean = isFinal(tm)(haltsAt(tm)(word).state)

// An example acceptance of a word "0110"
accept(tm1)("0110") // true

// A computation by a Turing machine
def compute(tm: TM)(word: Word): Option[Word] =
  val Config(prev, state, cur, next) = haltsAt(tm)(word)
  if      (prev != "")                          None
  else if (!isFinal(tm)(state))                 None
  else if (!next.forall(tm.symbols.contains))   None
  else if (cur == tm.blankSymbol && next == "") Some("")
  else                                          Some(cur + next)

// Examples of computations by Turing machines
compute(tm1)("0110")    // Some("1001")
compute(tm1)("1011100") // Some("0100011")
