const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const routes = require('./server/routes');
const {logger} = require('./server/logger');

dotenv.config();
const app = express();

const PORT = process.env.SERVER_PORT;

// CORS whitelist
// const whitelist = process.env.SERVER_WHITELIST.split(',');
// const domainExistsOnWhitelist = (req) => whitelist.indexOf(req.header('Origin')) !== -1;

// enable CORS
// const corsOptionsDelegate = (req, callback) => {
//   let corsOptions;
//   if (domainExistsOnWhitelist(req)) {
//     // Enable CORS for this request
//     corsOptions = { origin: true };
//   } else {
//     // Disable CORS for this request
//     corsOptions = { origin: false };
//   }
//   callback(null, corsOptions);
// };

// Express configuration
app.engine('hbs', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'server/views/layouts'),
  partialsDir: path.join(__dirname, 'server/views/partials'),
}));


app.use(session({
  secret: process.env.SERVER_SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: { secure: process.env.SERVER_ENV === 'production', maxAge: 3600000 * 24 * 3 },
}));

app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', '.hbs');


app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(compression());

const dwl = process.env.SERVER_WHITELIST.split(',');
app.use(cors({
    origin: (origin, callback) => {
        logger.info(`origin: ${origin}`)
        if ((!origin || origin === 'null') || dwl.includes(origin)) {
            logger.info('callback')
          callback(null, true);
        } else {
            logger.info(`Not allowed by CORS origin: ${origin}`);
        }
      },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// Static files
app.use('/img', express.static(`${__dirname}/shared/images`));
app.use('/css', express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.use('/css', express.static(`${__dirname}/node_modules/bootstrap-icons/font/fonts`));
app.use('/css', express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/css`));
app.use('/css', express.static(`${__dirname}/shared/styles`));
app.use('/dist', express.static(`${__dirname}/public/dist`));
app.use('/pet/images', express.static(`${__dirname}/public/uploads`));
app.use('/profile/images', express.static(`${__dirname}/public/uploads`));
app.use('/js', express.static(`${__dirname}/node_modules/bootstrap/dist/js`));
app.use('/js', express.static(`${__dirname}/node_modules/@fortawesome/fontawesome-free/js`));

app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Routes
app.use(routes);

app.listen(PORT, () => {
  if (process.env.SERVER_ENV !== 'production') {
    // eslint-disable-next-line no-console
    logger.info(`Server running in ${PORT} mode`);
  }
});
