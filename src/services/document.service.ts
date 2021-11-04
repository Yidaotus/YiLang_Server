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
	// @TODO LANG!
	const documents: Array<IDocumentSerialized> = await DocumentModel.find({
		userId,
		lang,
	})
		.sort({ [sortBy]: -1 })
		.limit(limit)
		.skip(skip)
		.lean<Array<IDocumentSerialized>>()
		.exec();
	const total = await DocumentModel.countDocuments({ userId, lang });

	const excerptedDocuments: Array<IDocumentExcerpt> = documents.map(
		(doc) => ({
			id: doc.id,
			title: doc.title,
			excerpt: '',
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		})
	);
	return { total, excerpts: excerptedDocuments };
};

const get = async ({ userId, id }: { userId: string; id: string }) => {
	const document = await DocumentModel.findOne({
		id,
		userId,
	})
		.lean<IDocumentSerialized>()
		.exec();
	return document;
};

const remove = async ({ userId, id }: { userId: string; id: string }) => {
	await DocumentModel.findOneAndDelete({
		id,
		userId,
	}).exec();
};

const create = async ({
	userId,
	newDocument,
}: {
	userId: string;
	newDocument: Omit<IDocumentSerialized, 'id'>;
}) => {
	const createdDocument = await DocumentModel.create({
		userId,
		...newDocument,
	});
	return createdDocument.id as string;
};

const update = async ({
	userId,
	id,
	newDocument,
}: {
	userId: string;
	id: string;
	newDocument: Omit<IDocumentSerialized, 'id'>;
}) => {
	await DocumentModel.updateOne({ userId, id }, newDocument).exec();
};

export { listDocuments, get, update, remove, create };
