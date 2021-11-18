import DictionaryEntry, { IDictionaryEntryDB } from '../entities/Dictionary';
import { Schema, Types } from 'mongoose';
import { DictionaryEntryField, IListDictionaryParams } from '../helpers/api';
import { IDictionaryEntry } from '../Document/Dictionary';
import { IExcerptedDocumentLink } from '../Document/Document';
import SentenceWord from '../entities/SentenceWord';

const fetch = async ({
	sortBy,
	lang,
	userId,
	limit,
	skip,
}: {
	sortBy: DictionaryEntryField;
	lang: string;
	userId: string;
	limit: number;
	skip: number;
}): Promise<IDictionaryEntry[]> => {
	const entries = await DictionaryEntry.find({
		lang,
		userId,
	})
		.sort(sortBy)
		.limit(limit)
		.skip(skip)
		.lean<Array<IDictionaryEntry>>()
		.exec();

	return entries;
};

const getAllForSentence = async ({
	userId,
	sentenceId,
}: {
	userId: string;
	sentenceId: string;
}): Promise<Array<IDictionaryEntry>> => {
	const junctions = await SentenceWord.find({
		sentenceId,
		userId,
	});
	const wordIds = junctions.map(({ sentenceId }) => sentenceId);
	const entries: IDictionaryEntry[] = await DictionaryEntry.find({
		userId,
	})
		.in('id', wordIds)
		.lean<Array<IDictionaryEntry>>()
		.exec();
	return entries;
};

const listEntries = async ({
	sortBy,
	limit,
	skip,
	lang,
	userId,
	filter,
}: IListDictionaryParams & { userId: string }) => {
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
	return {
		total,
		entries: entries.map((entry) => entry.toJSON<IDictionaryEntry>()),
	};
};

/*
const findOccurances = async ({
	lang,
	userId,
	document,
}: {
	lang: string;
	userId: string;
	document: string;
}) => {
	const dictionary = await DictionaryEntry.find({
		lang,
		userId,
	});

	let rootRadix: radix.IRadixNode<IDictionaryEntry> = {
		value: null,
		key: '',
		edges: new Array<radix.IRadixEdge<IDictionaryEntry>>(),
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
*/

const remove = async ({ userId, id }: { userId: string; id: string }) => {
	await DictionaryEntry.deleteOne({
		_id: id,
		userId,
	}).exec();
};

const create = async ({
	userId,
	langId,
	entry,
}: {
	userId: string;
	langId: string;
	entry: IDictionaryEntry;
}): Promise<number> => {
	try {
		const { id } = await DictionaryEntry.create({
			...entry,
			userId,
			lang: langId,
		});
		return id;
	} catch (e) {
		if (e instanceof Error && e.message.startsWith('E11000')) {
			throw new Error(`Entry: ${entry.key} already exists!`);
		}
		throw e;
	}
};

const update = async ({
	userId,
	langId,
	id,
	newEntry,
}: {
	userId: string;
	langId: string;
	id: string;
	newEntry: IDictionaryEntry;
}) => {
	await DictionaryEntry.updateOne(
		{ _id: id, userId, lang: langId },
		{ ...newEntry }
	);
};

const get = async ({
	userId,
	langId,
	id,
}: {
	userId: string;
	langId: string;
	id: string;
}): Promise<IDictionaryEntry> => {
	const entry = await DictionaryEntry.findOne({
		_id: id,
		lang: langId,
		userId,
	}).exec();
	if (entry) {
		return entry.toJSON<IDictionaryEntry>();
	}
	return null;
};

interface IEntryWithExcerpt {
	entry: IDictionaryEntry;
	rootEntry: IDictionaryEntry;
	subEntries: IDictionaryEntry[];
	linkExcerpt: string;
	otherExcerpts: IExcerptedDocumentLink[];
}

/*
const DEFAULT_EXCERPT_LENGTH = 80;
const getWithExcerpt = async ({
	userId,
	id,
}: {
	userId: Schema.Types.ObjectId;
	id: string;
}): Promise<Option<IEntryWithExcerpt>> => {
	const entry = await DictionaryEntry.findOne({
		_id: id,
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
				'blocks.fragmentables.id': entry.firstSeen,
				userId,
			},
			{ 'blocks.fragmentables.$.root': 1 }
		).exec();
	}
	let linkExcerpt;
	if (docSource) {
		// TODO Can this be done in mongo directly?
		const targetFragmentable = docSource.blocks[0].fragmentables.find(
			(frag) => frag.id === entry.firstSeen
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
				linkExcerpt = substringWithLength({
					root,
					length: DEFAULT_EXCERPT_LENGTH,
					index: entry.firstSeen.offset,
				});
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
						excerpt = substringWithLength({
							root,
							length: DEFAULT_EXCERPT_LENGTH,
							index: foundIndex,
						});
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
*/

const find = async ({
	userId,
	lang,
	searchTerm,
}: {
	userId: string;
	lang: string;
	searchTerm: string;
}) => {
	const entries = await DictionaryEntry.find({
		key: new RegExp(`.*${searchTerm}.*`, 'gi'),
		lang,
		userId,
	}).exec();
	return entries.map((entry) => entry.toJSON<IDictionaryEntry>());
};

export {
	fetch,
	listEntries,
	remove,
	create,
	update,
	get,
	getAllForSentence,
	find,
};
