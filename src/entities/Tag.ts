import mongoose, { Schema, Document, Model, ObjectId, Types } from 'mongoose';
import { IDictionaryTag, IGrammarPoint } from '../Document/Dictionary';

export interface IDictionaryTagDB extends IDictionaryTag {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDictionaryTagDocument = IDictionaryTagDB & Document;
export interface IDictionaryTagModel extends Model<IDictionaryTagDocument> {}

const GrammarPointSchema = new Schema<IGrammarPoint>(
	{
		name: { type: String, required: true },
		description: { type: String, required: false },
		construction: { type: [String], required: false },
	},
	{ _id: false }
);

const DictionaryTagSchema = new Schema<
	IDictionaryTagDocument,
	IDictionaryTagModel
>(
	{
		name: { type: String, required: true },
		color: { type: String, required: false },
		grammarPoint: { type: GrammarPointSchema, required: false },
		lang: { type: String, required: true },
		userId: { type: Types.ObjectId, require: true },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

DictionaryTagSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(_: unknown, ret: IDictionaryTagDocument) {
		delete ret._id;
		delete ret.userId;
		delete ret.deletedAt;
	},
});

export default mongoose.model<IDictionaryTagDocument, IDictionaryTagModel>(
	'DictionaryTag',
	DictionaryTagSchema
);
