source "https://rubygems.org"

gem 'rake'

# The site is built with `bundle exec jekyll build` in GitHub Actions, so the
# `github-pages` meta gem is not required. It pinned jekyll-remote-theme 0.4.3,
# which in turn pulled in a vulnerable rubyzip (< 3.0). Depend on Jekyll and
# the plugins actually used by this site instead.
gem 'jekyll', '~> 3.10'
gem 'kramdown-parser-gfm'

group :jekyll_plugins do
  gem 'jekyll-feed'
  gem 'jekyll-paginate'
  gem 'jekyll-sitemap'
  gem 'jekyll-redirect-from'
  gem 'jemoji'
  gem 'jekyll-relative-links'
  gem 'jekyll-optional-front-matter'
  gem 'jekyll-readme-index'
  gem 'jekyll-default-layout'
  gem 'jekyll-titles-from-headings'
end

gem "webrick", "~> 1.8"
gem "activesupport", ">= 7.0.4.3"
gem "rexml"
