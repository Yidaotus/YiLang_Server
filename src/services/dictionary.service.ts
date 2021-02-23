import DictionaryEntry, { IDictionaryEntry } from '../entities/dictionaryEntry';
import { Schema } from 'mongoose';
import * as radix from '../helpers/Radix';
import { IFragementData, DictionaryEntryField } from '../helpers/api';

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
}): Promise<IDictionaryEntry[]> => {
	const entries: IDictionaryEntry[] = await DictionaryEntry.find({
		lang,
		userId,
	})
		.sort(sortBy)
		.limit(limit)
		.skip(skip)
		.exec();

	return entries;
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

	let rootRadix: radix.IRadixNode<IDictionaryEntry> = {
		value: null,
		key: '',
		edges: new Array<radix.IRadixEdge<IDictionaryEntry>>(),
	};

	for (const entry of dictionary) {
		radix.insert(rootRadix, entry.key, entry.toJSON());
	}

	let occurances = new Array<IFragementData>();
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
export { fetch, findOccurances };
