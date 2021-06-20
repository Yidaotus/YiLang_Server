import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { IDictionaryTag, IGrammarPoint } from '../Document/Dictionary';

export interface IDictionaryTagDB extends IDictionaryTag {
	_id: String;
	userId: Schema.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDictionaryTagDocument = IDictionaryTagDB & Document;
export interface IDictionaryTagModel extends Model<IDictionaryTagDocument> {}

const GrammarPointSchema = new Schema<IGrammarPoint>(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		construction: { type: [String], required: true },
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
		id: { type: String, required: true },
		lang: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, require: true },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

export default mongoose.model<IDictionaryTagDocument, IDictionaryTagModel>(
	'DictionaryTag',
	DictionaryTagSchema
);
