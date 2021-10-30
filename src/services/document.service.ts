import { Schema } from 'mongoose';
import { BlockType } from '../Document/Block';
import { IDocument } from '../Document/Document';
import DocumentModel from '../entities/Document';
import { IDocumentExcerpt, IListDocumentsParams } from '../helpers/api';

const generateExcerpt = ({
	doc,
	excerptLength,
	filter,
}: {
	doc: IDocument;
	excerptLength: number;
	filter?: Array<BlockType>;
}): string => {
	let excerpt = '';
	let excerpted = 0;
	for (const block of doc.blocks) {
		if (!filter || filter.indexOf(block.type) !== -1) {
			for (const fragmentable of block.fragmentables) {
				if (excerptLength - excerpted < 1) {
					return excerpt;
				}
				const subexcerpt = fragmentable.root
					.trim()
					.substr(0, excerptLength - excerpted);
				excerpt += subexcerpt;
				excerpted += subexcerpt.length;
			}
			excerpt += '\n';
		}
	}
	return excerpt;
};

const listDocuments = async ({
	sortBy,
	limit,
	skip,
	excerptLength,
	userId,
	lang,
}: IListDocumentsParams & { userId: Schema.Types.ObjectId }) => {
	// @TODO LANG!
	const documents: Array<IDocument> = await DocumentModel.find({
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
			id: doc.id,
			title: doc.title,
			excerpt: generateExcerpt({
				doc,
				excerptLength,
				filter: ['Paragraph', 'Image', 'Dialog'],
			}),
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		})
	);
	return { total, excerpts: excerptedDocuments };
};

const get = async ({
	userId,
	id,
}: {
	userId: Schema.Types.ObjectId;
	id: string;
}) => {
	const document = await DocumentModel.findOne({
		id,
		userId,
	}).exec();
	return document;
};

const remove = async ({
	userId,
	id,
}: {
	userId: Schema.Types.ObjectId;
	id: string;
}) => {
	const document = await DocumentModel.deleteOne({
		id,
		userId,
	}).exec();
};

const saveOrUpdate = async ({
	userId,
	id,
	newDocument,
}: {
	userId: Schema.Types.ObjectId;
	id: string;
	newDocument: IDocument;
}) => {
	await DocumentModel.updateOne({ userId, id: newDocument.id }, newDocument, {
		upsert: true,
		runValidators: true,
	}).exec();
};
export { listDocuments, get, saveOrUpdate, remove };
