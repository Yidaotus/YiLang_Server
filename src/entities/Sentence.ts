import mongoose, { Schema, Document, Model, ObjectId, Types } from 'mongoose';
import { IDictionarySentence } from '../Document/Dictionary';
import { DocumentLinkSchema } from './Dictionary';

export interface IDictionarySentenceDB
	extends Omit<IDictionarySentence, 'lang'> {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	lang: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDictionarySentenceDocument = IDictionarySentenceDB & Document;
export interface IDictionarySentenceModel
	extends Model<IDictionarySentenceDocument> {}

const DictionarySentenceSchema = new Schema<
	IDictionarySentenceDocument,
	IDictionarySentenceModel
>(
	{
		content: { type: String, required: true },
		translation: { type: String, required: true },
		lang: { type: Schema.Types.ObjectId, required: true },
		userId: { type: Schema.Types.ObjectId, require: true },
		source: { type: DocumentLinkSchema, required: false },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

DictionarySentenceSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(
		doc: IDictionarySentenceDocument,
		ret: IDictionarySentence
	) {
		const { _id, userId, deletedAt, ...leanRest } = doc;
		ret = {
			...leanRest,
			id: doc._id.toHexString(),
			lang: doc.lang.toHexString(),
		};
	},
});

export default mongoose.model<
	IDictionarySentenceDocument,
	IDictionarySentenceModel
>('DictionarySentence', DictionarySentenceSchema);
