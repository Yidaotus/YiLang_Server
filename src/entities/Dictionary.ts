import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IDictionaryEntry, IDocumentLink } from '../Document/Dictionary';

export interface IDictionaryEntryDB extends Omit<IDictionaryEntry, 'lang'> {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	lang: Types.ObjectId;
	binkey?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDictionaryEntryDocument = IDictionaryEntryDB & Document;
export interface IDictionaryEntryModel
	extends Model<IDictionaryEntryDocument> {}

export const DocumentLinkSchema = new Schema<IDocumentLink>(
	{
		documentId: { type: String, required: true },
		fragmentableId: { type: String, required: true },
		offset: { type: Number, required: true },
	},
	{ _id: false }
);

const DictionaryEntrySchema = new Schema<
	IDictionaryEntryDocument,
	IDictionaryEntryModel
>(
	{
		key: { type: String, required: true },
		translations: { type: Schema.Types.Array, required: true },
		lang: { type: Schema.Types.ObjectId, required: true },
		userId: { type: Schema.Types.ObjectId, required: true },
		tags: { type: Schema.Types.Array, required: true },
		roots: { type: Schema.Types.Array, required: true },
		firstSeen: { type: DocumentLinkSchema, required: false },
		comment: { type: String, required: false },
		spelling: { type: String, required: false },
		binkey: { type: String },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

DictionaryEntrySchema.index({ key: 1, lang: 1, userId: 1 }, { unique: true });

DictionaryEntrySchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(doc: IDictionaryEntryDocument, ret: IDictionaryEntry) {
		const { _id, userId, deletedAt, updatedAt, binkey, ...leanRest } = doc;
		ret = {
			...leanRest,
			id: doc._id.toHexString(),
			lang: doc.lang.toHexString(),
		};
	},
});

DictionaryEntrySchema.pre<IDictionaryEntryDocument>('save', function(next) {
	this.binkey = this.key
		.split('')
		.map((char) =>
			char
				.charCodeAt(0)
				.toString(2)
				.padStart(16, '0')
		)
		.join('');
	next();
});

export default mongoose.model<IDictionaryEntryDocument, IDictionaryEntryModel>(
	'DictionaryEntry',
	DictionaryEntrySchema
);
