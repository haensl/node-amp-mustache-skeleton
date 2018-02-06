const os = require('os');
const Koa = require('koa');
const serveStatic = require('koa-static');
const compress = require('koa-compress');
const Z_SYNC_FLUSH = require('zlib').Z_SYNC_FLUSH;
const PORT = process.env.PORT || 8080;
const app = new Koa();

app.use(compress({
  threshold: 0,
  flush: Z_SYNC_FLUSH
}));

app.use(serveStatic(__dirname, {
  maxage: 60000
}));

app.listen(PORT);
console.info(`Listening on ${os.hostname()}:${PORT}`);
