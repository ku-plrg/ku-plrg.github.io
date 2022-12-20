# 연구실 홈페이지

이 연구실 홈페이지는 [Jekyll](https://jekyllrb-ko.github.io/)과 [TeXt
Theme](https://github.com/kitian616/jekyll-TeXt-theme)을 통해 개발되었습니다.


## 로컬에서 빌드

Jekyll에 대한 설치는 [여기](https://jekyllrb-ko.github.io/docs/)를 참고하세요.

다음의 명령어를 통해 로컬에서 실행이 가능합니다.
```shell
$ bundle exec jekyll serve
```


## 포스트 작성

- [`_data/authors.yml`](./_data/authors.yml)에 본인의 정보 기록
- [`_posts/`](./_posts)에 `yyyy-mm-dd-title.md` 형식에 맞춰서 글 작성
- 글 작성에 필요한 그림 및 미디어 파일이 필요할 시, [`assets/`](./assets)에
  `yyyy-mm-dd-title` 디렉토리 생성하고 여기에 미디어 파일들을 저장
- 로컬에서 확인 후, PR을 작성
