import assert from 'assert';
import path from 'path';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import cors from 'cors';
import express from 'express';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/errorhandler';
import mongoose from 'mongoose';
import { config } from './helpers/config';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
var mongoDB = process.env.MONGODB_URI || config.db.connectionString;
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
const PORT = process.env.PORT || 3000;

//Bind connection to error event (to get notification of connection YiErrors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
	const app = express();
	app.use(
		cors({
			origin: [
				'http://localhost:3000',
				'http://localhost:5000',
				'http://localhost:3001',
				'https://yilang-frontend.herokuapp.com',
				'https://yilang.yidaou.tech',
			],
			credentials: true,
			optionsSuccessStatus: 200,
		})
	);
	app.use(express.json({ limit: '5mb' }));
	app.use(express.urlencoded({ limit: '5mb', extended: false }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, '../', 'public')));

	let jwtsecret = null;
	try {
		jwtsecret = fs.readFileSync(
			path.join(__dirname, '../config/secret.key'),
			'utf8'
		);
	} catch (err) {
		console.error(err);
		assert(
			jwtsecret,
			'JWTSecret is neccesary to start this appliaction.' +
				'Refer to config/secret.key'
		);
	}
	assert(
		jwtsecret !== '',
		"JWTSecret can't be empty! Refer to config/secret.key"
	);

	app.locals.jwtsecret = jwtsecret;

	app.use('/api', apiRouter);
	app.use(errorHandler);

	app.listen(PORT, () => {
		console.log('GOGO!');
	});

	/*http
		.createServer(
			{
				key: fs.readFileSync('certs/selfsigned.key'),
				cert: fs.readFileSync('certs/selfsigned.crt'),
				passphrase: '',
			},
			app
		)
		.listen(3000, () => {
			console.log('Server started on port 3000');
		});
		*/
});
