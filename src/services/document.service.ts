import { Schema } from 'mongoose';
import { BlockType } from '../Document/Block';
import { IDocumentSerialized } from '../Document/Document';
import DocumentModel from '../entities/Document';
import { IDocumentExcerpt, IListDocumentsParams } from '../helpers/api';

const listDocuments = async ({
	sortBy,
	limit,
	skip,
	excerptLength,
	userId,
	lang,
}: IListDocumentsParams & { userId: string }) => {
	const documents = await DocumentModel.find({
		userId,
		lang,
	})
		.sort({ [sortBy]: -1 })
		.limit(limit)
		.skip(skip)
		.exec();
	const total = await DocumentModel.countDocuments({ userId, lang });

	const excerptedDocuments: Array<IDocumentExcerpt> = documents.map(
		(doc) => ({
			id: doc._id,
			title: doc.title,
			excerpt: '',
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		})
	);
	return { total, excerpts: excerptedDocuments };
};

const get = async ({
	userId,
	id,
	langId,
}: {
	userId: string;
	id: string;
	langId: string;
}) => {
	const document = await DocumentModel.findOne({
		_id: id,
		lang: langId,
		userId,
	})
		.lean<IDocumentSerialized>()
		.exec();
	return document;
};

const remove = async ({
	userId,
	id,
	langId,
}: {
	userId: string;
	id: string;
	langId: string;
}) => {
	await DocumentModel.findOneAndDelete({
		_id: id,
		lang: langId,
		userId,
	}).exec();
};

const DEFAULT_DOCUMENT = JSON.stringify([
	{
		type: 'title',
		children: [{ text: `Your new document!` }],
		align: 'center',
	},
	{ type: 'paragraph', align: 'left', children: [{ text: `Let's learn!` }] },
]);

const create = async ({
	userId,
	langId,
}: {
	userId: string;
	langId: string;
}) => {
	const createdDocument = await DocumentModel.create({
		userId,
		lang: langId,
		serializedDocument: DEFAULT_DOCUMENT,
	});
	return createdDocument.id as string;
};

const update = async ({
	userId,
	id,
	langId,
	newDocument,
}: {
	userId: string;
	id: string;
	langId: string;
	newDocument: Omit<IDocumentSerialized, 'id'>;
}) => {
	await DocumentModel.updateOne(
		{ userId, _id: id, lang: langId },
		newDocument
	).exec();
};

export { listDocuments, get, update, remove, create };
