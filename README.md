# 연구실 홈페이지

https://plrg.korea.ac.kr 의 소스입니다. Jekyll 없이 작은 Node 스크립트(`_next/build.mjs`)가
데이터(yml)와 Markdown 페이지를 읽어 정적 사이트(`_next/out/`)를 만들고, `main`에 push하면
GitHub Actions(`.github/workflows/pages.yml`)가 빌드해서 GitHub Pages로 배포합니다.

## 로컬에서 보기

```shell
$ cd _next
$ npm install          # 처음 한 번
$ npm run build        # _next/out/ 생성
$ npm run serve        # http://localhost:4000/
```

사진을 웹용(WebP)으로 줄이는 데 `cwebp`가 필요합니다 (`brew install webp`). 없으면 원본 사진을 그대로 씁니다.

## 무엇을 고치면 되나

| 고칠 것 | 파일 |
|---|---|
| 논문 (연구 주제 태그 `topics` 포함) | `_data/publications.yml` |
| 멤버 목록 / 멤버 정보(사진·연락처) | `_data/members.yml` / `_data/authors.yml` |
| 멤버 개인 페이지 본문 | `members/<id>.md` |
| Research 페이지 (주제 설명·도구·ESMeta 그림) | `_data/research.yml` |
| 발표 / 출장 | `_data/talks.yml` / `_data/trips.yml` |
| 학회 마감 · 순위 목록 | `_data/conferences.yml` |
| 홈 사진 슬라이드 | `_data/photos.yml` (+ `assets/images/`) |
| 과목 목록 / 학기 페이지 / 일정표 | `courses/index.md` / `courses/<과목>/<YYYY_S>/index.md` / `_data/course/<과목>/<YYYY_S>.yml` |
| 다른 주소로 넘기기 | `index.md`의 front matter에 `redirect_to:` |
| 디자인 · 화면 동작 | `_next/static/` (`style.css`, `*.js`) |
| 연구 주제 목록·순서, 페이지 구성 | `_next/build.mjs` |

PDF·이미지 같은 정적 파일(`assets/`, `courses/**/slides/` 등)은 같은 경로 그대로 사이트에 복사됩니다.
