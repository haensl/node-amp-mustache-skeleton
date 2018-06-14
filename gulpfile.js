const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const fs = require('fs');
const path = require('path');

const DIR_SRC = 'src';
const DIR_DIST = 'dist';
const DIR_DIST_IMG = `${DIR_DIST}/img`;
const DIR_SRC_SEO = `${DIR_SRC}/seo`;
const DIR_SRC_TEMPLATES = `${DIR_SRC}/templates`;
const DIR_SRC_CSS = `${DIR_SRC}/styles`;
const DIR_SRC_JSON = `${DIR_SRC}/json`;
const DIR_SRC_IMG = `${DIR_SRC}/img`;
const DIR_SRC_SERVER = `${DIR_SRC}/server`;

const VIEWS = require(`./${DIR_SRC_TEMPLATES}/views.json`);
const VARS_TEMPLATES_ALL = require(`./${DIR_SRC_TEMPLATES}/vars.json`);
const VERSION = require('./package.json').version;

const OPTS_HTMLMIN = {
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true
};

const DIRECTIVE_INCLUDE_CSS = '<!-- INCLUDE_CSS -->';
const DIRECTIVE_INCLUDE_VERSION = '<!-- INCLUDE_VERSION -->';
const DIRECTIVE_INCLUDE_REVISION = '<!-- INCLUDE_REVISION -->';

const DATE_ISO = (new Date()).toISOString();
const FILE_STYLES = `styles-${VERSION}.css`;

const dirExists = (directory) =>
  (fs.existsSync(directory)
    && fs.statSync(directory).isDirectory());

const ensureDirectory = (directory) =>
  dirExists(directory)
    || fs.mkdirSync(directory);

const validateAMP = () =>
  gulp.src(`${DIR_DIST}/**/index.html`)
    .pipe($.amphtmlValidator.validate())
    .pipe($.amphtmlValidator.format())
    .pipe($.amphtmlValidator.failAfterError());

gulp.task('ensureDistDirExists', (done) => {
  ensureDirectory(DIR_DIST);
  done();
});

gulp.task('ensureDistImgDirExists', (done) => {
  ensureDirectory(DIR_DIST_IMG);
  done();
});

gulp.task('clean:seofiles', gulp.series(['ensureDistDirExists', () =>
  del([
    'google*+.html',
    'robots.txt',
    'sitemap.xml'
  ].map((pattern) => `${DIR_DIST}/${pattern}`), {
    force: true
  })]));

gulp.task('clean:html', gulp.series(['ensureDistDirExists', () =>
  del([`${DIR_DIST}/**/*.html`], {
    force: true
  })]));

gulp.task('clean:css', gulp.series(['ensureDistDirExists', () =>
  del([`${DIR_DIST}/*.css`], {
    force: true
  })]));

gulp.task('clean:assets', gulp.series(['ensureDistImgDirExists', () =>
  del([`${DIR_DIST_IMG}/*`], {
    force: true
  })]));

gulp.task('clean:server', gulp.series(['ensureDistDirExists', () =>
  new Promise((resolve, reject) =>
  fs.readdir(DIR_SRC_SERVER, (err, files) => {
    try {
      del.sync(files.map((file) => `${DIR_DIST}/${path.basename(file)}`), {
        force: true
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  }))]));

gulp.task('clean:package', gulp.series(['ensureDistDirExists', () =>
  del([`${DIR_DIST}/package*.json`], {
    force: true
  })]));

gulp.task('seofiles', gulp.series(['clean:seofiles', () =>
  new Promise((resolve, reject) =>
    gulp.src(`${DIR_SRC_SEO}/*`)
      .pipe(gulp.dest(DIR_DIST))
      .on('end', resolve)
      .on('error', reject))]));

gulp.task('templates', gulp.series(['clean:html', () =>
  Promise.all(VIEWS.map((view) =>
    new Promise((resolve, reject) => {
      fs.readFile(`${DIR_SRC_TEMPLATES}/${view.name.toLowerCase()}.mustache`, 'utf8', (err, partial) => {
        if (err) {
          return reject(err);
        }

        const menuItems = VIEWS.slice().map((item) => {
          item.active = item.name === view.name;
          return item;
        });

        const vars = Object.assign(
          {},
          VARS_TEMPLATES_ALL,
          {
            name: view.name
          },
          view.vars,
          menuItems
        );

        gulp.src(`${DIR_SRC_TEMPLATES}/wireframe.mustache`)
          .pipe($.mustache(vars, {}, {
            view: partial
          }))
          .pipe($.rename((path) => {
            path.basename = 'index';
            path.extname = '.html';
            return path;
          }))
          .pipe(gulp.dest(`${DIR_DIST}${vars.href}/`))
          .on('end', resolve)
          .on('error', reject)
      });
    })
  ))
]));

gulp.task('css', gulp.series(['clean:css', () =>
  new Promise((resolve, reject) =>
    gulp.src(`${DIR_SRC_CSS}/*.css`)
      .pipe($.concat(FILE_STYLES))
      .pipe($.postcss([require('autoprefixer')()]))
      .pipe($.cssmin())
      .pipe(gulp.dest(DIR_DIST))
      .on('end', resolve)
      .on('error', reject))]));

gulp.task('html', gulp.series(['templates', 'css', () =>
  new Promise((resolve, reject) =>
    gulp.src(`${DIR_DIST}/**/*.html`)
      .pipe($.replace(DIRECTIVE_INCLUDE_CSS, (match) =>
        `<style amp-custom>${ fs.readFileSync(path.join(DIR_DIST, FILE_STYLES))}</style>`))
      .pipe($.replace(DIRECTIVE_INCLUDE_VERSION, (match) =>
        `<meta name="version" content="${VERSION}">`))
      .pipe($.replace(DIRECTIVE_INCLUDE_REVISION, (match) =>
        `<meta name="revised" content="${DATE_ISO}"><meta name="date" content="${DATE_ISO}">`))
      .pipe($.embedJson({
        root: DIR_SRC_JSON
      }))
      .pipe($.minifyInlineJson())
      .pipe($.htmlmin(OPTS_HTMLMIN))
      .pipe(gulp.dest(DIR_DIST))
      .on('end', () => {
        del.sync(`${DIR_DIST}/${FILE_STYLES}`);
        validateAMP();
        resolve();
      })
      .on('error', reject)
  )]
));

gulp.task('assets', gulp.series(['clean:assets', () =>
  new Promise((resolve, reject) =>
    gulp.src(`${DIR_SRC_IMG}/*`)
      .pipe(gulp.dest(DIR_DIST_IMG))
      .on('end', resolve)
      .on('error', reject))]));

gulp.task('package', gulp.series(['clean:package', () =>
  new Promise((resolve, reject) =>
    gulp.src('./package*.json')
      .pipe(gulp.dest(DIR_DIST))
      .on('end', resolve)
      .on('error', reject))]));

gulp.task('server', gulp.series(['clean:server', 'package', () =>
  new Promise((resolve, reject) =>
    gulp.src(`${DIR_SRC_SERVER}/*`)
      .pipe(gulp.dest(DIR_DIST))
      .on('end', resolve)
      .on('error', reject))]));

gulp.task('build:client', gulp.parallel(['html', 'assets']));
gulp.task('build:server', gulp.parallel(['server']));
gulp.task('build', gulp.parallel(['build:client', 'build:server']));

gulp.task('watch:client', gulp.series(['build:client', () => {
  gulp.watch(`${DIR_SRC}/**/*.+(css|mustache|json)`, gulp.parallel(['html']));
  gulp.watch(`${DIR_SRC_IMG}/**/*`, gulp.parallel(['assets']));
  gulp.watch(`${DIR_SRC_SEO}/*`, gulp.parallel(['seofiles']));
}]));

gulp.task('watch:server', gulp.series(['build:server', () => {
  gulp.watch(`${DIR_SRC_SERVER}/*`, gulp.parallel(['build:server']));
}]));

gulp.task('default', gulp.parallel(['watch:client']));

