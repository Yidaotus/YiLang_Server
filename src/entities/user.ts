import mongoose, { Schema, Document, DocumentQuery, Model } from 'mongoose';
import { string } from 'joi';

export type UserRole = 'user' | 'admin' | 'moderator';

interface IVerificationToken {
	token: string;
	expires: Date;
}

export interface IUser extends Document {
	email: string;
	password: string;
	username: string;
	nativeLanguage: string;
	role: UserRole;
	verifiedAt: Date;
	verificationToken: IVerificationToken;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

export interface IUserModel extends Model<IUser> {
	findActiveById(id: string): Promise<IUser>;
	findActiveByMail(email: string): Promise<IUser>;
}

const UserSchema: Schema = new Schema(
	{
		email: { type: String, unique: true, required: true },
		password: { type: String, required: true },
		username: { type: String, required: true },
		nativeLanguage: String,
		role: {
			type: String,
			enum: ['user', 'admin', 'moderator'],
			default: 'user',
		},
		verifiedAt: Date,
		verificationToken: {
			token: String,
			expires: Date,
		},
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

UserSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(doc, ret) {
		delete ret._id;
		delete ret.password;
		delete ret.verifiedAt;
		delete ret.createdAt;
		delete ret.updatedAt;
	},
});

UserSchema.statics.findActiveById = function(id: string) {
	return this.findOne({
		_id: id,
		verifiedAt: {
			$lt: Date.now(),
		},
	}).exec();
};

UserSchema.statics.findActiveByMail = function(email: string) {
	return this.findOne({
		email: {
			$regex: `^${email}$`,
			$options: 'i',
		},
		verifiedAt: {
			$lt: Date.now(),
		},
	}).exec();
};

export default mongoose.model<IUser, IUserModel>('User', UserSchema);
