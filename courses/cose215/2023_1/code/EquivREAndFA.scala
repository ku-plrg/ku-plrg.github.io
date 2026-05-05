/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load EquivREAndFA.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// The type definitions of symbols
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

// The definition of regular expressions
trait RE
case class REEmpty() extends RE
case class REEpsilon() extends RE
case class RESymbol(symbol: Symbol) extends RE
case class REUnion(left: RE, right: RE) extends RE
case class REConcat(left: RE, right: RE) extends RE
case class REStar(re: RE) extends RE
case class REParen(re: RE) extends RE

// Two examples of regular expressions
val re1: RE = REUnion(
  RESymbol('a'),
  REConcat(REEpsilon(), REStar(RESymbol('b'))),
)

val re2: RE = REConcat(
  REParen(REUnion(RESymbol('a'), REEpsilon())),
  REStar(RESymbol('b')),
)

// A transition allowing epsilon-transition
type Transition = (State, Option[Symbol], State)

// A simplified epsilon-NFA
case class SimpleENFA(from: State, trans: Set[Transition], to: State)

// Convert a regular expression to a simplified epsilon-NFA with initial state
def RE2SimpleENFA(re: RE, i: State): SimpleENFA = re match
  case REEmpty() => SimpleENFA(
    from  = i,
    trans = Set(),
    to    = i + 1,
  )
  case REEpsilon() => SimpleENFA(
    from  = i,
    trans = Set((i, None, i + 1)),
    to    = i + 1,
  )
  case RESymbol(symbol) => SimpleENFA(
    from  = i,
    trans = Set((i, Some(symbol), i + 1)),
    to    = i + 1,
  )
  case REUnion(re1, re2) =>
    val SimpleENFA(_, trans1, j) = RE2SimpleENFA(re1, i + 1)
    val SimpleENFA(_, trans2, k) = RE2SimpleENFA(re2, j + 1)
    SimpleENFA(
      from  = i,
      trans = trans1 ++ trans2 ++ Set(
        (i, None, i + 1),
        (i, None, j + 1),
        (j, None, k + 1),
        (k, None, k + 1),
      ),
      to    = k + 1,
    )
  case REConcat(re1, re2) => ???
  case REStar(re) => ???
  case REParen(re) => ???

// Convert a simplified epsilon-NFA to an epsilon-NFA
def SimpleENFA2ENFA(senfa: SimpleENFA): ENFA =
  val SimpleENFA(from, trans, to) = senfa
  val states = (from to to).toSet
  val symbols = trans.flatMap((_, aOpt, _) => aOpt)
  val map = trans.groupMap((i, aOpt, _) => (i, aOpt))((_, _, j) => j)
  val enfaTrans = states
    .flatMap(q => symbols.map(a => q -> Option(a)) + (q -> None))
    .map(pair => pair -> map.getOrElse(pair, Set()))
    .toMap
  ENFA(
    states = states,
    symbols = symbols,
    trans = enfaTrans,
    initState = from,
    finalStates = Set(to),
  )
