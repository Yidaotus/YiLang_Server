import mongoose, { Schema, Document, Model } from 'mongoose';
import { nextTick } from 'process';


export interface IDictionaryEntry extends Document {
	word: string;
	translation: string;
	lang: string;
	userId: Schema.Types.ObjectId;
	binkey?: string;
}

export interface IDictionaryEntryModel extends Model<IDictionaryEntry> {}

const DictionaryEntrySchema: Schema = new Schema(
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
	transform: function(doc, ret) {
		delete ret._id;
		delete ret.id;
		delete ret.userId;
		delete ret.deletedAt;
		delete ret.updatedAt;
		delete ret.binkey;
	},
});

DictionaryEntrySchema.pre<IDictionaryEntry>('save', function(next) {
	this.binkey = this.word
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

export default mongoose.model<IDictionaryEntry, IDictionaryEntryModel>(
	'DictionaryEntry',
	DictionaryEntrySchema
);
