import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { IDocument } from '../Document/Document';
import { BlockElement } from '../Document/Fragment';

export interface IDocumentModel extends IDocument {
	_id: ObjectId;
	userId: Schema.Types.ObjectId;
	binkey?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDocumentDBDocument = IDocumentModel & Document;
export interface IDocumentDBModel extends Model<IDocumentDBDocument> {}

const DocumentSchema = new Schema<IDocumentDBDocument, IDocumentDBModel>(
	{
		entryId: { type: String, required: true },
		key: { type: String, required: true },
		translations: { type: Schema.Types.Array, required: true },
		lang: { type: String, required: true, minlength: 2, maxlength: 5 },
		tags: { type: Schema.Types.Array, required: true },
		variations: { type: Schema.Types.Array, required: false },
		comment: { type: String, required: false },
		spelling: { type: String, required: false },
		userId: { type: Schema.Types.ObjectId, required: true },
		binkey: { type: String },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

DocumentSchema.index({ word: 1, lang: 1, userId: 1 }, { unique: true });

DocumentSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(_: unknown, ret: IDocumentDBDocument) {
		delete ret._id;
		delete ret.id;
		delete ret.userId;
		delete ret.deletedAt;
		delete ret.updatedAt;
		delete ret.binkey;
	},
});

export default mongoose.model<IDocumentDBDocument, IDocumentDBModel>(
	'DictionaryEntry',
	DocumentSchema
);
