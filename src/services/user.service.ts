import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User, { IUser } from '../entities/user';
import { ITokenData } from '../helpers/api';
import crypto from 'crypto';
import { sendEmail } from '../helpers/mailer';
import YiErrors from '../helpers/errors';

const ONE_DAY = 1 * 24 * 60 * 60 * 1000;

const generateToken = (length: number = 25) => {
	return crypto.randomBytes(length).toString('hex');
};

const register = async (
	userDetails: {
		username: string;
		email: string;
		password: string;
	},
	verifyPath: string
): Promise<void> => {
	const { email, username, password } = userDetails;
	const dbUser = await User.findOne({ email }).exec();

	if (dbUser) {
		// If verify token isnt valid anymore let new user register
		const now = new Date(Date.now());
		if (
			dbUser.verificationToken &&
			dbUser.verificationToken.expires < now
		) {
			dbUser.deleteOne();
		} else {
			//else Prevent Account enumeration
			await sendEmail({
				to: dbUser.email,
				subject: 'Email already registered!',
				html: `<h1>Email already Registered</h1>
				   <p>Your email has already been registered!</p>`,
			});
			return;
		}
	}

	const salt = await bcrypt.genSalt(10);
	const hashpw = await bcrypt.hash(password, salt);
	const user = new User();
	let token = '';
	let checkTokenUser = null;
	do {
		token = generateToken();
		checkTokenUser = await User.findOne({
			'verificationToken.token': token,
		});
	} while (checkTokenUser);

	user.email = email;
	user.password = hashpw;
	user.username = username;
	user.verificationToken = {
		token: token,
		expires: new Date(Date.now() + ONE_DAY),
	};
	await user.save();

	const verificationUrl = `${verifyPath}/${token}`;
	await sendEmail({
		to: user.email,
		subject: 'Please confirm your registration',
		html: `<h1>Verify your account</h1>
		<p>In order to confirm your registration please click the following link: </p>
		<p><a href="${verificationUrl}">confirm</a></p>`,
	});
};

const verify = async (token: string) => {
	const user = await User.findOne({
		'verificationToken.token': token,
		'verificationToken.expires': {
			$gt: Date.now(),
		},
	});

	if (!user) {
		const err = new Error('Invalid or expired token!');
		err.name = YiErrors.INVALID_TOKEN;
		throw err;
	}

	user.verifiedAt = new Date(Date.now());
	user.verificationToken = undefined;
	await user.save();
};

const login = async (authDetails: {
	email: string;
	password: string;
	jwtsecret: string;
}): Promise<{ user: IUser; token: string }> => {
	const { email, password, jwtsecret } = authDetails;
	const user = await User.findActiveByMail(email);
	if (!user) {
		throw new Error('Username or Password incorrect!');
	}

	const checkPw = await bcrypt.compare(password, user.password);
	if (!checkPw) {
		const err = new Error('Username or Password incorrect!');
		err.name = YiErrors.INVALID_PASSWORD;
		throw err;
	}

	const tokenData: ITokenData = {
		user: {
			id: user.id,
		},
	};
	const token = jwt.sign(tokenData, jwtsecret, {
		expiresIn: '1d',
	});

	return {
		user: user.toJSON(),
		token,
	};
};

export { register, login, verify };
