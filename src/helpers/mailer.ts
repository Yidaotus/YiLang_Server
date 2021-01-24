import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { config } from './config';

let transporter: null | Mail = null;

async function init() {
	let host = config.mail.host;
	let port = config.mail.port;
	let user = config.mail.auth.user;
	let pass = config.mail.auth.pass;

	transporter = nodemailer.createTransport({
		host: host,
		port: port,
		secure: false,
		auth: {
			user: user,
			pass: pass,
		},
	});
}

async function sendEmail({
	to,
	subject,
	html,
	from = 'test@test.com',
}: {
	to: string;
	subject: string;
	html: string;
	from?: string;
}) {
	if (!transporter) {
		await init();
	}
	return transporter.sendMail({ from, to, subject, html });
}

export { sendEmail };
