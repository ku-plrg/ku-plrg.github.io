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

type State = Int
type Symbol = Char
type Word = String
type TapeSymbol = Char
type Tape = String
enum HeadMove { case L, R }
import HeadMove.*

// A helper function to extract first symbol and rest of word
object `<|` { def unapply(w: Word) = w.headOption.map((_, w.drop(1))) }

// The type definition of configurations for Turing machines */
case class Config(state: State, tape: Tape, index: Int)

// The definition of Turing machines
case class TM(
  states: Set[State],
  symbols: Set[Symbol],
  tapeSymbols: Set[TapeSymbol],
  trans: Map[(State, TapeSymbol), (State, TapeSymbol, HeadMove)],
  initState: State,
  blank: TapeSymbol,
  finalStates: Set[State],
) {

  // One-step move in a Turing machine
  def move(config: Config): Option[Config] =
    val Config(curSt, tape, k) = config
    val (n, x) = (tape.size, tape(k))
    for {
      (newSt, y, to) <- trans.get((curSt, x))
      next = Config(newSt, tape.updated(k, y), k + (if (to == L) -1 else 1))
    } yield normalize(next)

  // The initial configuration of a Turing machine
  def init(word: Word): Config = word match
    case a <| x => Config(initState, word, 0)
    case _      => Config(initState, blank.toString, 0)

  // The configuration at which the TM halts
  final def haltsAt(config: Config): Config = move(config) match
    case None       => config
    case Some(next) => haltsAt(next)

  // The acceptance of a word by TM
  def accept(w: Word): Boolean = finalStates.contains(haltsAt(init(w)).state)

  // The computation with a given word by TM
  def compute(word: Word): Option[Word] =
    val Config(state, tape, k) = haltsAt(init(word))
    val (n, x) = (tape.size, tape(k))
    if (k == 0 && finalStates.contains(state)) {
      if (x == blank && n == 1) Some("")
      else if (tape.forall(symbols.contains)) Some(tape.mkString)
      else None
    } else None

  // The normalized configuration of a Turing machine
  private def normalize(config: Config): Config =
    val Config(state, tape, k) = config
    val (n, b) = (tape.size, blank.toString)
    val c =
      if (k < 0) Config(state, (b * -k) + tape, 0)
      else if (k >= n) Config(state, tape + (b * (k - n + 1)), k)
      else config
    val l = c.tape.indexWhere(_ != blank)
    val r = c.tape.reverseIterator.indexWhere(_ != blank)
    val (lower, upper) = (l min c.index, (c.tape.size - 1 - r) max c.index)
    Config(c.state, c.tape.slice(lower, upper + 1), c.index - lower)
}

// TM accepting L = { a^n b^n c^n | n ≥ 0 }
val tm_an_bn_cn: TM = TM(
  states = Set(0, 1, 2, 3, 4, 5),
  symbols = Set('a', 'b', 'c'),
  tapeSymbols = Set('a', 'b', 'c', 'X', 'Y', 'Z', 'B'),
  trans = Map(
    (0, 'a') -> (1, 'X', R),
    (0, 'Y') -> (4, 'Y', R),
    (0, 'B') -> (5, 'B', L),
    (1, 'a') -> (1, 'a', R),
    (1, 'Y') -> (1, 'Y', R),
    (1, 'b') -> (2, 'Y', R),
    (2, 'b') -> (2, 'b', R),
    (2, 'Z') -> (2, 'Z', R),
    (2, 'c') -> (3, 'Z', L),
    (3, 'a') -> (3, 'a', L),
    (3, 'b') -> (3, 'b', L),
    (3, 'Y') -> (3, 'Y', L),
    (3, 'Z') -> (3, 'Z', L),
    (3, 'X') -> (0, 'X', R),
    (4, 'Y') -> (4, 'Y', R),
    (4, 'Z') -> (4, 'Z', R),
    (4, 'B') -> (5, 'B', L),
  ),
  initState = 0,
  blank = 'B',
  finalStates = Set(5),
)

// TM representing a computable function f(w ∈ {0, 1}*) = w' where w' is the
// word obtained by flipping 0's and 1's
val tm_flip: TM = TM(
  states = Set(0, 1, 2),
  symbols = Set('0', '1'),
  tapeSymbols = Set('0', '1', 'B'),
  trans = Map(
    (0, '0') -> (0, '1', R),
    (0, '1') -> (0, '0', R),
    (0, 'B') -> (1, 'B', L),
    (1, '0') -> (1, '0', L),
    (1, '1') -> (1, '1', L),
    (1, 'B') -> (2, 'B', R),
  ),
  initState = 0,
  blank = 'B',
  finalStates = Set(2),
)
