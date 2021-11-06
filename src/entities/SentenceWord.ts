import mongoose, { Schema, Document, Model, ObjectId, Types } from 'mongoose';

export interface ISentenceWord {
	sentenceId: Types.ObjectId;
	wordId: Types.ObjectId;
	userId: Types.ObjectId;
	langId: Types.ObjectId;
}

export interface ISentenceWordDB extends ISentenceWord {
	_id: ObjectId;
}

type ISentenceWordDocument = ISentenceWordDB & Document;
export interface ISentenceWordModel extends Model<ISentenceWordDocument> {}

const SentenceWordSchema = new Schema<
	ISentenceWordDocument,
	ISentenceWordModel
>(
	{
		sentenceId: { type: Schema.Types.ObjectId, required: true },
		wordId: { type: Schema.Types.ObjectId, required: true },
		userId: { type: Schema.Types.ObjectId, required: true },
		langId: { type: Schema.Types.ObjectId, required: true },
	},
	{ timestamps: true }
);

export default mongoose.model<ISentenceWordDocument, ISentenceWordModel>(
	'SentenceWord',
	SentenceWordSchema
);
