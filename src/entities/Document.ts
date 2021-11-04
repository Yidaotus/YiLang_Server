import { Schema, model, Types, Model } from 'mongoose';
import { IDocumentSerialized } from '../Document/Document';

export interface IDocumentDB
	extends Omit<IDocumentSerialized, 'userId' | 'lang'> {
	_id: Types.ObjectId;
	serializedDocument: string;
	userId: Types.ObjectId;
	lang: Types.ObjectId;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IDocumentDocument = IDocumentDB & Document;
export interface IDocumentModel extends Model<IDocumentDocument> {}

const DocumentSchema = new Schema<IDocumentDB, IDocumentModel>(
	{
		title: { type: String, required: false },
		userId: { type: Types.ObjectId, required: true },
		lang: { type: Types.ObjectId, required: true },
		serializedDocument: { type: Schema.Types.Mixed, require: true },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

DocumentSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(doc: IDocumentDB, ret: IDocumentSerialized) {
		const { _id, userId, deletedAt, ...leanRest } = doc;
		ret = {
			...leanRest,
			id: doc._id.toHexString(),
			lang: doc.lang.toHexString(),
		};
	},
});

const DocumentModel = model<IDocumentDocument, IDocumentModel>(
	'Document',
	DocumentSchema
);
export default DocumentModel;
