const os = require('os');
const Koa = require('koa');
const serve = require('koa-static');
const etag = require('koa-etag');
const conditional = require('koa-conditional-get');
const compress = require('koa-compress');
const Z_SYNC_FLUSH = require('zlib').Z_SYNC_FLUSH;
const PORT = process.env.PORT || 8080;
const COMPRESSION_THRESHOLD = process.env.COMPRESSION_THRESHOLD || 0;
const CACHE_MAXAGE = process.env.CACHE_MAXAGE || 60000;
const app = new Koa();

app.use(compress({
  threshold: COMPRESSION_THRESHOLD,
  flush: Z_SYNC_FLUSH
}));

app.use(conditional());
app.use(etag());

app.use(serve(__dirname, {
  maxage: CACHE_MAXAGE
}));

app.listen(PORT);
console.info(`Listening on ${os.hostname()}:${PORT}`);
