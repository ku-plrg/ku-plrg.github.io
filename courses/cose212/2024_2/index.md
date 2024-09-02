---
layout: course
---
## COSE212: Programming Languages, 2024 Fall

### Course Information

- **Instructor:** [Jihyeok Park (박지혁)](/members/jihyeok.park)
  - **Office:** 609A,
    [Science Library Bldg](https://goo.gl/maps/dJTtjpZEHCC4Xv5t5)
    ([과학도서관](https://naver.me/5Y1oxNnH))
  - **Email:** [jihyeok_park@korea.ac.kr](mailto:jihyeok_park@korea.ac.kr)
- **Lecture:** 13:30--14:45 Mondays and Wednesdays @ 205,
  [Woojung Hall of Informatics](https://maps.app.goo.gl/31pXxfzqAuki6Yzv7)
  ([우정정보관](https://naver.me/G5rz0209))
- **Teaching Assistant:**
  - [Jungyeom Kim (김준겸)](/members/jungyeom.kim)
  - [Seongmin Ko (고성민)](/members/seongmin.ko)
- **Office hours:** 14:00--16:00 Tuesdays (by appointment)

### Course Materials

- **Self-contained lecture notes are provided.**
- Reference:
  - [**Introduction to Programming Languages**](https://hjaem.info/itpl)
    by [Jaemin Hong](https://hjaem.info/)
    and [Sukyoung Ryu](https://plrg.kaist.ac.kr/ryu)
  - [**Types and Programming Languages**](https://www.cis.upenn.edu/~bcpierce/tapl/),
    [Benjamin C. Pierce](https://www.cis.upenn.edu/~bcpierce/), The MIT Press
- **Previous Exams**
  - Midterm: [2023](../2023_2/midterm.pdf)
  - Final: [2023](../2023_2/final.pdf)


### Attendances and Homework

Please use the [Blackboard](https://kulms.korea.ac.kr) for the attendance check
and the submission of homework.


### Discussion and Questions

Please use the [CampusWire](https://campuswire.com) for discussion
and questions about the course.
- Link: [https://campuswire.com/c/G2CA06AE4](https://campuswire.com/c/G2CA06AE4)
- Passcode: See the [Blackboard](https://kulms.korea.ac.kr) announcement.


### Installation of Scala and sbt

[Scala](https://www.scala-lang.org/) is a general-purpose programming language
combining **object-oriented** and **functional** programming in one concise,
high-level language. Scala's **static types** help avoid bugs in complex
applications, and its JVM and JavaScript runtimes let you build high-performance
systems with easy access to huge ecosystems of libraries.

The interactive **build tool** [sbt](https://www.scala-sbt.org/) is built for
Scala and Java projects.

Please download and install them using the following links:
- **JDK >= 8** - [https://www.oracle.com/java/technologies/downloads/](https://www.oracle.com/java/technologies/downloads/)
- **sbt** - [https://www.scala-sbt.org/download.html](https://www.scala-sbt.org/download.html)
- **Scala** - [https://www.scala-lang.org/download/](https://www.scala-lang.org/download/)


### Schedule

<!-- load schedule with PDF files -->
{%- include schedule.html data=site.data.course.cose212.2024_2 -%}


### Online Interpreters

<div>
  <link rel="stylesheet" href="../lib/main.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <script src="../lib/interp.js" defer></script>
  <script src="../lib/main.js" defer></script>
  <div class="center">
    <div id="dropdown">
      <span id="selected"></span>
      <i class="arrow fa fa-angle-up transition-all ml-auto rotate-180"></i>
      <ul style="display: none;"></ul>
    </div>
    <button id="run"><i class="fa fa-play"></i></button>
  </div>
  <div id="editor" style="font-size: .8em;"></div>
  <pre id="result" style="font-size: .8em; line-height: 15px"><br></pre>
</div>
