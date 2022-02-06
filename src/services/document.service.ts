import { Schema } from 'mongoose';
import { BlockType } from '../Document/Block';
import { IDocumentSerialized } from '../Document/Document';
import DocumentModel from '../entities/Document';
import DictionarySentence from '../entities/Sentence';
import DictionaryEntry from '../entities/Dictionary';
import { IDocumentExcerpt, IListDocumentsParams } from '../helpers/api';
import { IDictionaryEntry, IDictionarySentence } from '../Document/Dictionary';

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
		type: 'documentTitle',
		children: [{ text: '' }],
		align: 'left',
	},
	{ type: 'paragraph', align: 'left', children: [{ text: '' }] },
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

const searchForItemsInDocument = (
	doc: object,
	elementFilter: Array<string>
) => {
	if (!Array.isArray(doc)) {
		throw new Error('Root element of document has to be an array!');
	}
	let foundItems = new Set<Record<string, unknown>>();
	for (const docEntry of doc) {
		if (elementFilter.includes(docEntry.type)) {
			foundItems.add(docEntry);
		}
		if (docEntry.children && Array.isArray(docEntry.children)) {
			const entriesInChildren = searchForItemsInDocument(
				docEntry.children,
				elementFilter
			);
			foundItems = new Set([...foundItems, ...entriesInChildren]);
		}
	}
	return foundItems;
};

const fetchItems = async ({
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
	const deserializedDocument = JSON.parse(document.serializedDocument);

	const items = searchForItemsInDocument(deserializedDocument, [
		'sentence',
		'word',
	]);

	const sentenceIds = [...items.values()]
		.filter((item) => item.type === 'sentence')
		.map((sentenceItem) => sentenceItem.sentenceId);

	const wordIds = [...items.values()]
		.filter((item) => item.type === 'word')
		.map((wordItem) => wordItem.dictId);

	const sentenceItems = await DictionarySentence.find({
		lang: langId,
		userId,
	})
		.in('_id', sentenceIds)
		.exec();

	const wordItems = await DictionaryEntry.find({
		lang: langId,
		userId,
	})
		.in('_id', wordIds)
		.exec();

	return {
		sentenceItems: sentenceItems.map((entry) =>
			entry.toJSON<IDictionarySentence>()
		),
		wordItems: wordItems.map((entry) => entry.toJSON<IDictionaryEntry>()),
	};
};

export { listDocuments, get, update, remove, create, fetchItems };
