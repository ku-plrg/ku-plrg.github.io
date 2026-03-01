/* How to use this file:
 * 1. Start the Scala REPL:
 *
 *   $ scala
 *
 * 2. Load this file:
 *
 *   scala> :load Basics.scala
 *
 * 3. Do whatever you want in the REPL.
 */

// A method `add` of type `(Int, Int) => Int`
// It means that `add` takes two `Int` arguments and returns an `Int`
def add(x: Int, y: Int): Int = x + y

// A method `abs` which takes an `Int` and returns its absolute value
def abs(x: Int): Int = if (x < 0) -x else x

// A recursive method `sum` that adds all the integers from 1 to n
def sum(n: Int): Int =
  if (n < 1) 0
  else sum(n - 1) + n

// A case class `Point` having `x`, `y`, and `color` fields
// whose types are `Int`, `Int`, and `String`, respectively
case class Point(x: Int, y: Int, color: String):
  // A method that returns a new point moved by (dx, dy)
  def move(dx: Int, dy: Int): Point = Point(x + dx, y + dy, color)

// A `Point` instance whose fields: x = 3, y = 4, and color = "RED"
val point: Point = Point(3, 4, "RED")

// An algebraic data type (ADT) for trees
enum Tree:
  case Leaf(value: Int)
  case Branch(left: Tree, value: Int, right: Tree)
  // A recursive method counts the number of the given integer in a tree
  def count(x: Int): Int = this match
    case Leaf(n)         if n == x  => 1
    case Leaf(_)                    => 0
    case Branch(l, n, r) if n == x  => l.count(x) + 1 + r.count(x)
    case Branch(l, _, r)            => l.count(x) + r.count(x)

// Import all constructors for variants of `Tree`
import Tree.*

// Example trees
val tree1: Tree = Leaf(1)
val tree2: Tree = Branch(Leaf(1), 2, Leaf(3))
val tree3: Tree = Branch(Leaf(2), 4, Branch(Leaf(3), 1, Leaf(5)))

// A recursive method computes the sum of all the values in a tree
def sum(t: Tree): Int = t match
  case Leaf(n)         => n
  case Branch(l, n, r) => sum(l) + n + sum(r)

// A method checks whether a tree is a branch whose value is even
def isEvenBranch(t: Tree): Boolean = t match
  case Branch(_, n, _) if n % 2 == 0 => true
  case _                             => false

// An algebraic data type (ADT) for natural numbers
enum Nat:
  case Zero
  case Succ(n: Nat)

// Import all constructors for variants of `Nat`
import Nat.*

// A recursive method adds two natural numbers
def isEven(x: Nat): Boolean = x match
  case Zero          => true
  case Succ(Succ(y)) => isEven(y)   // nested pattern matching
  case _             => false

// A function that increments its input
val inc: Int => Int = _ + 1

// A method `twice` that applies the function `f` twice to `x`
def twice(f: Int => Int, x: Int): Int = f(f(x))

// A function `addN` returns a function that adds `n`
val addN = (n: Int) => (x: Int) => x + n
val add2 = addN(2)

// Example list of integers
val list: List[Int] = List(3, 1, 2, 4)
val list2 = 5 :: list
val list3 = 6 :: list

// Get the second element of the list or 0
def getSnd(list: List[Int]): Int = list match
  case _ :: x :: _ => x
  case _           => 0

// Filter odd integers and double them in the list
def filterOddAndDouble(list: List[Int]): List[Int] = list match
  case Nil                    => Nil
  case x :: xs if x % 2 == 1  => x * 2 :: filterOddAndDouble(xs)
  case _ :: xs                => filterOddAndDouble(xs)

// Example option of an integer
val some: Option[Int] = Some(42)
val none: Option[Int] = None

// Example tuple of an integer and a string
val pair: (Int, String) = (42, "foo")

// Example map from strings to integers
val map: Map[String, Int] = Map("a" -> 1, "b" -> 2)

// Example sets of integers
val set1: Set[Int] = Set(1, 2, 3)
val set2: Set[Int] = Set(2, 3, 5)

// Redefine `filterOddAndDouble` using `filter` and `map`
def filterOddAndDouble2(list: List[Int]): List[Int] =
  list
    .filter(_ % 2 == 1)
    .map(_ * 2)

// Redefine `filterOddAndDouble` using `for` comprehension 
def filterOddAndDouble3(list: List[Int]): List[Int] = for {
  x <- list
  if x % 2 == 1
} yield x * 2
