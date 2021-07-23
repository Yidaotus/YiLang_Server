import DictionaryEntry, { IDictionaryEntryDB } from '../entities/Dictionary';
import { LeanDocument, Query, Schema } from 'mongoose';
import * as radix from '../helpers/Radix';
import { DictionaryEntryField, IListDictionaryParams } from '../helpers/api';
import { IDictionaryEntry } from '../Document/Dictionary';
import { addEntries } from '../controllers/dictionary.controller';
import { getUUID, UUID } from '../Document/UUID';
import DocumentModel from '../entities/Document';
import { IDocumentLink, IExcerptedDocumentLink } from '../Document/Document';
import { Option } from '../Document/Utility';

const fetch = async ({
	sortBy,
	lang,
	userId,
	limit,
	skip,
}: {
	sortBy: DictionaryEntryField;
	lang: string;
	userId: Schema.Types.ObjectId;
	limit: number;
	skip: number;
}): Promise<IDictionaryEntryDB[]> => {
	const entries: IDictionaryEntryDB[] = await DictionaryEntry.find({
		lang,
		userId,
	})
		.sort(sortBy)
		.limit(limit)
		.skip(skip)
		.exec();

	return entries;
};

const listEntries = async ({
	sortBy,
	limit,
	skip,
	excerptLength,
	lang,
	userId,
	filter,
}: IListDictionaryParams & { userId: Schema.Types.ObjectId }) => {
	let entriesQueryCreator = DictionaryEntry.find({
		userId,
		lang,
	});

	if (sortBy) {
		entriesQueryCreator = entriesQueryCreator.sort({
			[sortBy.key]: sortBy.order === 'ascend' ? 1 : -1,
		});
	}
	let isFilterQuery = false;
	if (filter && Object.keys(filter).length > 0) {
		for (const [key, filt] of Object.entries(filter)) {
			if (filt) {
				entriesQueryCreator = entriesQueryCreator.in(
					key,
					filt.map((fentry) => new RegExp(fentry, 'gi'))
				);
				isFilterQuery = true;
			}
		}
	}

	const entriesQuery = entriesQueryCreator.toConstructor();
	const total = await new entriesQuery().countDocuments();
	const entries = await new entriesQuery()
		.limit(limit)
		.skip(skip)
		.exec();
	return { total, entries };
};

const findOccurances = async ({
	lang,
	userId,
	document,
}: {
	lang: string;
	userId: Schema.Types.ObjectId;
	document: string;
}) => {
	const dictionary = await DictionaryEntry.find({
		lang,
		userId,
	});

	let rootRadix: radix.IRadixNode<IDictionaryEntryDB> = {
		value: null,
		key: '',
		edges: new Array<radix.IRadixEdge<IDictionaryEntryDB>>(),
	};

	for (const entry of dictionary) {
		radix.insert(rootRadix, entry.key, entry.toJSON());
	}

	let occurances = new Array<{
		position: number;
		entries: Array<IDictionaryEntry>;
	}>();
	for (let i = 0; i < document.length; i++) {
		let finds = new Array<IDictionaryEntry>();
		radix.findAll(
			rootRadix,
			document.substring(i, document.length),
			0,
			finds
		);
		if (finds.length > 0) {
			occurances.push({ position: i, entries: finds });
		}
	}

	return occurances;
};

const remove = async ({
	userId,
	ids,
}: {
	userId: Schema.Types.ObjectId;
	ids: Array<string>;
}) => {
	await DictionaryEntry.deleteMany({
		userId,
	})
		.in('id', ids)
		.exec();
};

const create = async ({
	userId,
	entries,
}: {
	userId: Schema.Types.ObjectId;
	entries: Array<IDictionaryEntry>;
}) => {
	const entriesToInsert = entries.map((entry) => ({
		...entry,
		userId,
	}));

	await DictionaryEntry.create(entriesToInsert);
};

const update = async ({
	userId,
	id,
	newEntry,
}: {
	userId: Schema.Types.ObjectId;
	id: UUID;
	newEntry: IDictionaryEntry;
}) => {
	await DictionaryEntry.updateOne({ id: id, userId }, { ...newEntry });
};

const get = async ({
	userId,
	ids,
}: {
	userId: Schema.Types.ObjectId;
	ids: Array<UUID>;
}): Promise<Array<IDictionaryEntry>> => {
	const entries = await DictionaryEntry.find({
		id: ids,
		userId,
	}).exec();
	return entries;
};

interface IEntryWithExcerpt {
	entry: IDictionaryEntry;
	rootEntry: IDictionaryEntry;
	subEntries: IDictionaryEntry[];
	linkExcerpt: string;
	otherExcerpts: IExcerptedDocumentLink[];
}
const getWithExcerpt = async ({
	userId,
	id,
}: {
	userId: Schema.Types.ObjectId;
	id: UUID;
}): Promise<Option<IEntryWithExcerpt>> => {
	const entry = await DictionaryEntry.findOne({
		id,
		userId,
	}).exec();

	if (!entry) {
		return null;
	}

	let docSource;
	if (entry.firstSeen) {
		docSource = await DocumentModel.findOne(
			{
				id: entry.firstSeen.documentId,
				'blocks.fragmentables.id': entry.firstSeen.fragmentableId,
				userId,
			},
			{ 'blocks.fragmentables.$.root': 1 }
		).exec();
	}
	let linkExcerpt;
	if (docSource) {
		// TODO Can this be done in mongo directly?
		const targetFragmentable = docSource.blocks[0].fragmentables.find(
			(frag) => frag.id === entry.firstSeen.fragmentableId
		);
		if (targetFragmentable) {
			const sentenceInOffsetRange = targetFragmentable.fragments.find(
				(fragment) =>
					fragment.type === 'Sentence' &&
					fragment.range.start <= entry.firstSeen.offset &&
					fragment.range.end >= entry.firstSeen.offset
			);
			const root = targetFragmentable.root;
			if (sentenceInOffsetRange) {
				linkExcerpt = root.substring(
					sentenceInOffsetRange.range.start,
					sentenceInOffsetRange.range.end
				);
			} else {
				const excerptLength = 80;
				if (root) {
					linkExcerpt = root.substring(
						entry.firstSeen.offset - excerptLength / 2,
						Math.min(
							0,
							excerptLength / 2 - entry.firstSeen.offset
						) +
							excerptLength / 2
					);
				}
			}
		}
	}

	const otherSources = await DocumentModel.find({
		userId,
	})
		.where('id')
		.ne(entry.firstSeen?.documentId)
		.exec();
	const searchRE = new RegExp(entry.key, 'gi');
	// TODO maybe this should be cached in some way
	const otherExcerpts = new Array<IExcerptedDocumentLink>();
	for (const otherSource of otherSources) {
		for (const block of otherSource.blocks) {
			for (const fragmentable of block.fragmentables) {
				const foundIndex = fragmentable.root.search(searchRE);
				if (foundIndex > -1) {
					const sentenceInOffsetRange = fragmentable.fragments.find(
						(fragment) =>
							fragment.type === 'Sentence' &&
							fragment.range.start <= foundIndex &&
							fragment.range.end >= foundIndex
					);
					const root = fragmentable.root;
					let excerpt;
					if (sentenceInOffsetRange) {
						excerpt = root.substring(
							sentenceInOffsetRange.range.start,
							sentenceInOffsetRange.range.end
						);
					} else {
						const excerptLength = 80;
						if (root) {
							excerpt = root.substring(
								foundIndex - excerptLength / 2,
								Math.min(0, excerptLength / 2 - foundIndex) +
									excerptLength / 2
							);
						}
					}
					if (excerpt) {
						otherExcerpts.push({
							link: {
								documentId: otherSource.id,
								fragmentableId: fragmentable.id,
								offset: foundIndex,
							},
							excerpt,
						});
					}
				}
			}
		}
	}

	let rootEntry;
	if (entry.root) {
		rootEntry = await DictionaryEntry.findOne({
			id: entry.root,
			userId,
		}).exec();
	}

	const subEntries = await DictionaryEntry.find({
		root: entry.id,
		userId,
	});
	const result = {
		entry: entry.toJSON(),
		rootEntry,
		subEntries,
		linkExcerpt,
		otherExcerpts,
	};
	return result;
};

const find = async ({
	userId,
	lang,
	searchTerm,
}: {
	userId: Schema.Types.ObjectId;
	lang: string;
	searchTerm: string;
}) => {
	const entries: IDictionaryEntry[] = await DictionaryEntry.find({
		key: new RegExp(`.*${searchTerm}.*`, 'gi'),
		lang,
		userId,
	}).exec();
	return entries;
};

export {
	fetch,
	findOccurances,
	listEntries,
	remove,
	create,
	update,
	getWithExcerpt,
	get,
	find,
};
