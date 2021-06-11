import mongoose, { Schema, model, connect } from 'mongoose';
import { IDocument } from '../Document/Document';
import {
	IDialogBlockLine,
	IDocumentBlock,
	IImageBlockConfig,
	ITitleBlockConfig,
} from '../Document/Block';
import {
	Fragment,
	IFragmentableRange,
	IFragmentableString,
	IMarkFragmentData,
	ISentenceFragmentData,
	IWordFragmentData,
} from '../Document/Fragment';

export interface IDocumentDB extends IDocument {
	userId: Schema.Types.ObjectId;
}

const discriminatorOption = {
	discriminatorKey: 'type',
	_id: false,
};

const FragmentableRangeSchema = new Schema<IFragmentableRange>(
	{
		start: { type: Number, required: true },
		end: { type: Number, required: true },
	},
	{ _id: false }
);

const FragmentSchema = new Schema<Fragment>(
	{
		id: { type: String, required: true },
		range: { type: FragmentableRangeSchema, required: true },
		fragmented: { type: Boolean, required: false },
		type: { type: String, required: true },
	},
	discriminatorOption
);

const FragmentableSchema = new Schema<IFragmentableString>(
	{
		id: { type: String, required: true },
		root: { type: String, required: true },
		fragments: { type: [FragmentSchema], required: true },
		showSpelling: { type: String, required: true },
		highlightedFragment: { type: String, required: false },
	},
	{ _id: false }
);
const MarkSchema = new Schema<IMarkFragmentData>(
	{
		color: String,
		comment: { type: String, required: false },
	},
	{ _id: false }
);
const WordSchema = new Schema<IWordFragmentData>(
	{
		dictId: String,
	},
	{ _id: false }
);
const NestedWordSchema = new Schema<IWordFragmentData>(
	{
		id: { type: String, required: true },
		range: { type: FragmentableRangeSchema, required: true },
		fragmented: { type: Boolean, required: false },
		type: { type: String, required: true },
		data: WordSchema,
	},
	{ _id: false }
);
const SentenceSchema = new Schema<ISentenceFragmentData>(
	{
		translation: String,
		words: [NestedWordSchema],
	},
	discriminatorOption
);

const fragmentArray = FragmentableSchema.path(
	'fragments'
) as mongoose.Schema.Types.DocumentArray;

fragmentArray.discriminator(
	'Highlight',
	new Schema({ data: {} }, discriminatorOption)
);

fragmentArray.discriminator(
	'Background',
	new Schema({ data: {} }, discriminatorOption)
);

fragmentArray.discriminator(
	'Mark',
	new Schema(
		{
			data: MarkSchema,
		},
		discriminatorOption
	)
);

fragmentArray.discriminator(
	'Word',
	new Schema({ data: WordSchema }, discriminatorOption)
);

fragmentArray.discriminator(
	'Sentence',
	new Schema({ data: SentenceSchema }, discriminatorOption)
);

fragmentArray.discriminator(
	'Note',
	new Schema({ note: String }, discriminatorOption)
);

const BlockSchema = new Schema<IDocumentBlock>(
	{
		id: { type: String, required: true },
		type: { type: String, required: true },
		fragmentables: [FragmentableSchema],
		position: Number,
	},
	discriminatorOption
);

const DocumentSchema = new Schema<IDocumentDB>(
	{
		name: { type: String, require: false },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
		blocks: [BlockSchema],
		title: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, required: true },
	},
	{ timestamps: true }
);

DocumentSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(_: unknown, ret: IDocumentDB) {
		delete ret.userId;
	},
});

const blockArray = DocumentSchema.path(
	'blocks'
) as mongoose.Schema.Types.DocumentArray;

const TitleConfigSchema = new Schema<ITitleBlockConfig>({
	size: Number,
	subtitle: Boolean,
});
blockArray.discriminator(
	'Title',
	new Schema(
		{
			content: String,
			config: { type: TitleConfigSchema, required: true },
		},
		discriminatorOption
	)
);
blockArray.discriminator(
	'Paragraph',
	new Schema({ content: String }, discriminatorOption)
);
const ImageConfigSchema = new Schema<IImageBlockConfig>({
	alignment: { type: String, enum: ['center', 'left', 'right'] },
});
blockArray.discriminator(
	'Image',
	new Schema(
		{
			source: String,
			title: { type: String, required: false },
			config: { type: ImageConfigSchema, required: true },
		},
		discriminatorOption
	)
);

const DialogBlockLineSchema = new Schema<IDialogBlockLine>(
	{
		speaker: { type: String, require: false },
		speech: { type: String, require: false },
	},
	{ _id: false }
);
blockArray.discriminator(
	'Dialog',
	new Schema({ lines: [DialogBlockLineSchema] }, discriminatorOption)
);

const DocumentModel = model<IDocumentDB>('Document', DocumentSchema);

export default DocumentModel;
