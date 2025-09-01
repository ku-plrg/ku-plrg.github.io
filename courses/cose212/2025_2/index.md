---
layout: course
---
## COSE212: Programming Languages, 2025 Fall

The primary goal of this course is to learn **essential concepts** of
**programming languages** by designing and implementing their interpreters.

### Course Information

- **Instructor:** [Jihyeok Park (박지혁)](/members/jihyeok.park)
  - **Office:** 507,
    [IT & General Education Center](https://maps.app.goo.gl/PAkjVWnfKNHNASo66)
    ([정운오IT교양관](https://naver.me/GPdYvCNz))
  - **Email:** [jihyeok_park@korea.ac.kr](mailto:jihyeok_park@korea.ac.kr)
- **Lecture:** 13:30--14:45 Mondays and Wednesdays @ B102,
  [IT & General Education Center](https://maps.app.goo.gl/PAkjVWnfKNHNASo66)
  ([정운오IT교양관](https://naver.me/GPdYvCNz))
- **Teaching Assistant:** [cose212@googlegroups.com](mailto:cose212@googlegroups.com)
  - [Seongmin Ko (고성민)](/members/seongmin.ko)
  - [Hyunjoon Kim (김현준)](/members/hyunjoon.kim)
  - [Minseok Choe (최민석)](/members/minseok.choe)
- **Office hours:** 14:00--16:00 Tuesdays (by appointment)

### Course Materials

- **Self-contained lecture notes are provided.**
- Reference:
  - [**Introduction to Programming Languages**](https://hjaem.info/itpl)
    by [Jaemin Hong](https://hjaem.info/)
    and [Sukyoung Ryu](https://plrg.kaist.ac.kr/ryu)
  - [**Types and Programming Languages**](https://www.cis.upenn.edu/~bcpierce/tapl/),
    [Benjamin C. Pierce](https://www.cis.upenn.edu/~bcpierce/), The MIT Press


### Attendances and Homework

Please use the [LMS](https://lms.korea.ac.kr/) for the attendance check and the
submission of homework.

#### Policy on Academic Integrity

The use of Large Language Models (LLMs), such as ChatGPT, is permitted and
encouraged. However, students remain fully responsible for the **originality**
and **comprehension** of all submitted work. The following rules apply when
evaluating coding assignments. **Violations will be treated as academic
dishonesty** and will result in one of the following consequences: a grade of
**zero (0) on the assignment**, or, in the most serious cases, an automatic
grade of **F for the entire course**.

* Submissions that exhibit direct **copy-and-paste** similarity with other
  students' work, or copying with superficial or uninformed modifications,
  constitute **academic dishonesty**.

* The instructor reserves the right to require an **oral explanation** of any
  submitted code. Inability to provide a clear, reasonable, and coherent
  explanation will be deemed proof that the work is **not the student's own**.

### Exams

- **Midterm:** October 22 (Wed.) 18:30 -- 21:00 (150 min.)
- **Final:** December 17 (Wed.) 18:30 -- 21:00 (150 min.)
- **Previous Exams**
  - Midterm:
    [2023](../2023_2/midterm.pdf) /
    [2024](../2024_2/midterm.pdf)
  - Final:
    [2023](../2023_2/final.pdf) /
    [2024](../2024_2/final.pdf)

### Installation of Scala and sbt

[Scala](https://www.scala-lang.org/) is a general-purpose programming language
combining **object-oriented** and **functional** programming in one concise,
high-level language. Scala's **static types** help avoid bugs in complex
applications, and its JVM and JavaScript runtimes let you build high-performance
systems with easy access to huge ecosystems of libraries.

The interactive **build tool** [sbt](https://www.scala-sbt.org/) is built for
Scala and Java projects.

Please download and install them using the following links:
- **JDK >= 17** -
  [https://www.oracle.com/java/technologies/downloads/](https://www.oracle.com/java/technologies/downloads/)
- **sbt** -
  [https://www.scala-sbt.org/download.html](https://www.scala-sbt.org/download.html)
- **Scala** -
  [https://www.scala-lang.org/download/](https://www.scala-lang.org/download/)


### Online Interpreters

In this course, you will implement interpreters for the following languages:

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


### Schedule

<!-- load schedule with PDF files -->
{%- include schedule.html data=site.data.course.cose212.2025_2 -%}
