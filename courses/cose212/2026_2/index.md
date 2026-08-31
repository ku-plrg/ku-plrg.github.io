---
layout: course
---
### COSE212: Programming Languages, 2026 Fall

The primary goal of this course is to learn **essential concepts** of
**programming languages** by designing and implementing their interpreters.

#### Course Information

- **Instructor:** [Jihyeok Park (박지혁)](/members/jihyeok.park)
  - **Office:** 507,
    [IT & General Education Center](https://maps.app.goo.gl/PAkjVWnfKNHNASo66)
    ([정운오IT교양관](https://naver.me/GPdYvCNz))
  - **Email:** [jihyeok_park@korea.ac.kr](mailto:jihyeok_park@korea.ac.kr)
- **Lecture:** 13:30--14:45 Mondays and Wednesdays @ 610,
  [IT & General Education Center](https://maps.app.goo.gl/PAkjVWnfKNHNASo66)
  ([정운오IT교양관](https://naver.me/GPdYvCNz))
- **Teaching Assistant:** [cose212@googlegroups.com](mailto:cose212@googlegroups.com)
- **Office hours:** By appointment via e-mail

#### Course Materials

- **Self-contained lecture notes are provided.**
- Reference:
  - [**Introduction to Programming Languages**](https://hjaem.info/itpl)
    by [Jaemin Hong](https://hjaem.info/)
    and [Sukyoung Ryu](https://plrg.kaist.ac.kr/ryu)
  - [**Types and Programming Languages**](https://www.cis.upenn.edu/~bcpierce/tapl/),
    [Benjamin C. Pierce](https://www.cis.upenn.edu/~bcpierce/), The MIT Press


#### Grading

- **3 Projects: 0%**
  - You will implement **three** different mini languages: **MiniFSharp**,
    **MiniPython**, and **MiniScala**.
  - They are **not graded** and need **no submission**. However, some exam
    questions might be related to them, so we **strongly recommend** solving
    them by yourself.
- **Midterm exam: 40%**
- **Final exam: 50%**
- **Attendance: 10%**
  - **All or nothing:** you get the full **10%** if you attend at least **2/3**
    of the checks, and **0%** otherwise.
  - There is **no attendance check** in the first week; it starts on
    **September 7**.

#### Attendance

Please use the [LMS](https://lms.korea.ac.kr/) for the attendance check.

#### Exams

- **Midterm:** October 21 (Wed.) 18:30 -- 21:00 (150 min.)
- **Final:** December 16 (Wed.) 18:30 -- 21:00 (150 min.)
- **Previous Exams**
  - Midterm:
    [2023](../exam/midterm-2023-2.pdf)
    ([sol](../exam/midterm-2023-2-sol.pdf)) /
    [2024](../exam/midterm-2024-2.pdf)
    ([sol](../exam/midterm-2024-2-sol.pdf)) /
    [2025](../exam/midterm-2025-2.pdf)
    ([sol](../exam/midterm-2025-2-sol.pdf))
  - Final:
    [2023](../exam/final-2023-2.pdf)
    ([sol](../exam/final-2023-2-sol.pdf)) /
    [2024](../exam/final-2024-2.pdf)
    ([sol](../exam/final-2024-2-sol.pdf)) /
    [2025](../exam/final-2025-2.pdf)
    ([sol](../exam/final-2025-2-sol.pdf))

#### Lectures without Offline Classes

On the four days listed below, there will be no offline lectures. Instead,
lecture videos will be uploaded to the [LMS](https://lms.korea.ac.kr/).

- October 5 (Mon.) / 7 (Wed.) -- International Conference
- October 12 (Mon.) / 14 (Wed.) -- International Conference

#### Installation of Scala and sbt

[Scala](https://www.scala-lang.org/) is a general-purpose programming language
combining **object-oriented** and **functional** programming in one concise,
high-level language. Scala's **static types** help avoid bugs in complex
applications, and its JVM and JavaScript runtimes let you build high-performance
systems with easy access to huge ecosystems of libraries.

The interactive **build tool** [sbt](https://www.scala-sbt.org/) is built for
Scala and Java projects.

Please follow the step-by-step installation guide:

- [**Installation Guide (JDK and sbt)**](https://github.com/ku-plrg-classroom/docs/blob/main/INSTALL.md)

<!-- TODO: remove these direct links once INSTALL.md is published. -->
If you prefer to install them yourself:
- **JDK 21 (LTS)** -- [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=21)
  (JDK 17 also works; JDK 25 or later is **not** supported)
- **sbt** -- [https://www.scala-sbt.org/download/](https://www.scala-sbt.org/download/)


#### Online Interpreters

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


#### Schedule

<!-- load schedule with PDF files -->
{%- include schedule.html data=site.data.course.cose212.2026_2 -%}
