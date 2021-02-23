import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { IDictionaryEntryData } from '../helpers/api';

export interface IDictionaryEntry extends IDictionaryEntryData {
	id: ObjectId;
	userId: Schema.Types.ObjectId;
	binkey?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDictionaryEntryDocument = IDictionaryEntry & Document;
export interface IDictionaryEntryModel
	extends Model<IDictionaryEntryDocument> {}

const DictionaryEntrySchema = new Schema<
	IDictionaryEntryDocument,
	IDictionaryEntryModel
>(
	{
		word: { type: String, required: true },
		translation: { type: String, required: true },
		lang: { type: String, required: true, minlength: 2, maxlength: 5 },
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
