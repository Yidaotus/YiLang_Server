import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { IDictionaryEntry } from '../Document/Dictionary';

export interface IDictionaryEntryDB extends IDictionaryEntry {
	_id: ObjectId;
	userId: Schema.Types.ObjectId;
	binkey?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDictionaryEntryDocument = IDictionaryEntryDB & Document;
export interface IDictionaryEntryModel
	extends Model<IDictionaryEntryDocument> {}

const DictionaryEntrySchema = new Schema<
	IDictionaryEntryDocument,
	IDictionaryEntryModel
>(
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

DictionaryEntrySchema.index({ word: 1, lang: 1, userId: 1 }, { unique: true });

DictionaryEntrySchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(_: unknown, ret: IDictionaryEntryDocument) {
		delete ret._id;
		delete ret.id;
		delete ret.userId;
		delete ret.deletedAt;
		delete ret.updatedAt;
		delete ret.binkey;
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
