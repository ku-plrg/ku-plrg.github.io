---
title: Research
layout: article
---

Programming Language Research Group (PLRG) aims to help developers design and
implement high-quality software using diverse _programming language_
technologies, including:
- **program analysis** for automatically understanding program behaviors and
  detecting bugs and vulnerabilities.
- **mechanized specification** to fill the gap between human-readable
  specifications and machine-friendly software.
- **program synthesis** to lessen the burden of software development by
  automatically generating programs.
- **automated testing** to generate test cases for software automatically on
  behalf of humans.

## Recent Research Topics


### JavaScript Mechanized Specifications

JavaScript is the most active programming language in
[GitHub](https://octoverse.github.com/2022/top-programming-languages). Every web
browser contains a JavaScript engine. Its annually released specification,
[ECMA-262](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/),
defines the language syntax and semantics rigorously. It is also equipped with
[Test262](https://github.com/tc39/test262), the implementation conformance test
suite. However, manually maintaining the correctness of the fast-evolving
language specification is challenging, even with the huge test suite. To reduce
the gaps between the latest ECMA-262 and its implementations, we introduced a
tool named [ESMeta](https://github.com/es-meta/esmeta). It automatically
extracts a JavaScript mechanized specification from ECMA-262 and generates
various language-based tools by leveraging it, such as interpreters, conformance
test synthesizers, specification type checkers, and program static analyzers.

![ESMeta](/assets/images/research/esmeta.jpg)

- **Papers**:
    [**PLDI 2023**]
    [**[ESEC/FSE 2022](/assets/data/publication/fse22-park-jsaver.pdf)**]
    [**[ASE 2021](/assets/data/publication/ase21-park-jstar.pdf)**]
    [**[ICSE 2021](/assets/data/publication/icse21-park-jest.pdf)**]
    [**[ASE 2020](/assets/data/publication/ase20-park-jiset.pdf)**]
- **Tutorial**:
    [**[PLDI 2022](https://pldi22.sigplan.org/details/pldi-2022-tutorials/1/Filling-the-gap-between-the-JavaScript-language-specification-and-tools-using-the-JIS)**]
    (slides -
    [1](/assets/data/slides/2022/pldi22-tutorial-1.pdf) /
    [2](/assets/data/slides/2022/pldi22-tutorial-2.pdf) /
    [3](/assets/data/slides/2022/pldi22-tutorial-3.pdf)
    )
- **SIGPLAN Blogs**:
    [[**link**](https://blog.sigplan.org/2023/01/12/from-research-prototypes-to-continuous-integration-guiding-the-design-and-implementation-of-javascript/)]
- **Tools**:
    [**[ESMeta](https://github.com/es-meta/esmeta)**]



### Parametric Static Analysis

Static analysis is based on [abstract
interpretation](https://doi.org/10.1145/512950.512973) and approximately
estimates program behaviors using abstract semantics. While dynamic analysis
collects runtime behaviors of instrumented code, static analysis
over-approximates all program behaviors without actually executing programs. The
static analysis quality is often evaluated by three criteria:

- **Performance** denotes how fast static analysis analyzes programs. 
- **Precision** stands for the accuracy of analysis results.
- **Soundness** represents whether analysis results cover all possible program
  behaviors at runtime.

Diverse analysis techniques have been proposed to enhance the performance and
precision of static analysis while preserving soundness. Researchers have
proposed parametric static analysis to mechanically select analysis parameters
depending on given programs and analysis purposes. We surveyed analysis
parameters and their parameter selection in the literature. In addition, we
presented new analysis parameters and new parameter selection approaches.

![Static Analysis](/assets/images/research/static-analysis.jpg)
- **Papers**:
    [**[CSUR](/assets/data/publication/csur21-park-psa.pdf)**]
    [**[ESEC/FSE 2021](/assets/data/publication/fse21-park-ds.pdf)**]
    [**[IEEE Software](/assets/data/publication/ieeesw19.pdf)**]
    [**[SOAP 2017](/assets/data/publication/soap17.pdf)**]
    [**[ICSE 2017 Demo](/assets/data/publication/icse-demo17.pdf)**]
- **Tools**:
    [**[SAFE 2.0](https://github.com/sukyoung/safe)**]
