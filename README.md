# node-amp-mustache-skeleton
AMP page skeleton served via node.js featuring mustache templating and pm2.

## Quick start

* Fork this repo.
* `npm i`
* `npm start`
* Start developing.

## Directory layout

```bash
  dist/                                 # production code
    pageA/
      index.html
    pageB/
      index.html
    img/
    google-site-verification.html
    index.html
    index.js
    package.json
    package-lock.json
    pm2.json
    robots.txt
    sitemap.xml
  src/                                  # source code
    img/                                # images files
    json/                               # json data
    seo/                                # seo related files
      robots.txt
      google-site-verification.html
      sitemap.xml
    server/                             # node server source
      index.js                          # koa server
      pm2.json                          # pm2 configuration
    styles/                             # css
      <some-styles>.css
    templates/                          # mustache templates
      vars.json                         # variables global to all templates
      views.json                        # array of views to render, can override variables in vars.json
      wireframe.mustache                # base wireframe
      <your-page>.mustache              # view partial to be wrapped in wireframe.mustache
  package.json
  package-lock.json
```

## Features

### pm2

The application is monitored via [pm2](http://pm2.keymetrics.io). Customize monitoring settings via [`src/server/pm2.json`](src/server/pm2.json).

### (LD+)JSON

The skeleton is setup so you can inline JSON data, e.g. to add microdata. Put your JSON files into [`src/json/`](src/json) and reference them in your HTML via

```html
<script type="application/ld+json" src="my-data.json"></script>
```

### Templating

#### Wireframe

Templates are rendered by including a view partial into the base [wireframe](src/templates/wireframe.mustache). Please take a look at [src/templates/wireframe.mustache](src/templates/wireframe.mustache) and adjust it according to your needs.

#### Adding pages/views

When you add a new page/view, it needs to be configured in [`src/templates/views.json`](src/templates/views.json). This file contains an array of all views/pages to publish. Each entry in the array is an object with the following signature:

```javascript
{
  "name": "pagename",
  "vars": {
    "href": "/path/to/this/page",
    // ...
  }
}
```

The important parts are the `name` and the `vars.href` property. The build process will create the path referenced in `vars.href` in the `dist/` directory and render the view into an `index.html` file therein. By convention the build task looks for a partial named `pagename.mustache` in the [`src/templates`](src/templates) directory.

Please look at the file for some basic examples.

#### Variables

Variables global to all templates are set in [`src/templates/vars.json`](src/templates/vars.json). Any variable can be overriden by a view via the `vars` property in [`src/templates/views.json`](src/templates/views.json).

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
