import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'moderator';

interface IVerificationToken {
	token: string;
	expires: Date;
}

export interface IUser {
	id: ObjectId;
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
type IUserDocument = IUser & Document;

export interface IUserModel extends Model<IUserDocument> {
	findActiveById(id: string): Promise<IUserDocument>;
	findActiveByMail(email: string): Promise<IUserDocument>;
}

const UserSchema = new Schema<IUserDocument>(
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
	transform: function(_: unknown, ret: IUserDocument) {
		delete ret._id;
		delete ret.password;
		delete ret.verifiedAt;
		delete ret.createdAt;
		delete ret.updatedAt;
		delete ret.deletedAt;
	},
});

UserSchema.statics.findActiveById = function(id: string) {
	return this.findOne({
		_id: id,
		verifiedAt: {
			$lt: new Date(),
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
			$lt: new Date(),
		},
	}).exec();
};

export default mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
