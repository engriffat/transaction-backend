const path = require("path");
const cors = require("cors");
const express = require("express");
const { ObjectId } = require('mongodb');
const session = require("cookie-session");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const new_token = require("./models/new_token")
const compression = require("compression");
require("dotenv").config();
const Moralis = require("moralis").default;
require("./utility/dbConn");
const AppError = require("./utility/AppError");
let MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNhMzBhMzc0LTMzNWQtNDlhOS1hOGE2LWE1OTU5YTk1ZDk5YyIsIm9yZ0lkIjoiMzgzNDcyIiwidXNlcklkIjoiMzk0MDI1IiwidHlwZUlkIjoiMGQwNGM5M2UtOTQ3MC00NDllLWFiMzAtYjMzZGFhOGFkZjRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA4MjgwODcsImV4cCI6NDg2NjU4ODA4N30.CaI_31xDwSUM_I_gvj543VPqWy_jV_7b_BBg2dQZ0tc"
const app = express();
const routes = require("./routes/userRouter");
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug')('sniperBot:server');
var http = require('http');
const port = normalizePort(process.env.PORT || 3003);
app.use(cors({ origin: '*'}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
routes(app);
app.all("*", (req, res, next) => next(new AppError(`can't find ${req.originalUrl} on this server`, 404)));
// app.use(errorHandler);
app.set('port', port);
var server = http.createServer(app);
const io = require('socket.io')(server,{
  cors:{origin : '*'}
});

server.listen(port);
server.on('listening', onListening);
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

async function onListening() {
  await Moralis.start({
    apiKey: MORALIS_API_KEY
  });
  var addr = server.address();
  var bind = typeof addr === 'string'
  ? 'pipe ' + addr
  : 'port ' + addr.port;
  console.log(`Server is running on port ${port}`)
  debug('Listening on ' + bind);
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('getTokens', async(objectData) => {
    try {
      console.log("objectData ====>>>>>>>>>", objectData)
      let limit = objectData.limit
      let page_number = objectData.page_number
      let count  = await new_token.countDocuments({})
      let tokens  = await new_token.find({}).sort({createdAt : -1}).skip((page_number - 1) * limit).limit(limit)
      const userSocketId = socket.id;
      io.to(userSocketId).emit('tokensData', {tokens, count});
    }catch (e) {
      console.log("e===>>>>>>>", e)
    }
  });
  socket.on('disconnect', async() => {
    console.log('disconnected user')
  });
});