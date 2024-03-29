import { Schema, Types } from 'mongoose';
import { IDictionarySentence } from '../Document/Dictionary';
import DictionarySentence from '../entities/Sentence';
import SentenceWord, { ISentenceWord } from '../entities/SentenceWord';
import { IListSentencesParams } from '../helpers/api';

const get = async ({
	userId,
	langId,
	id,
}: {
	userId: string;
	langId: string;
	id: string;
}): Promise<IDictionarySentence> => {
	const sentence = await DictionarySentence.findOne({
		userId,
		lang: langId,
		_id: id,
	}).exec();
	return sentence.toJSON<IDictionarySentence>();
};

const listSentences = async ({
	sortBy,
	limit,
	skip,
	lang,
	userId,
	filter,
	searchTerm,
}: IListSentencesParams & { userId: string }) => {
	let sentencesQueryCreator = DictionarySentence.find({
		userId,
		lang,
	});

	if (sortBy) {
		sentencesQueryCreator = sentencesQueryCreator.sort({
			[sortBy.key]: sortBy.order === 'ascend' ? 1 : -1,
		});
	}
	let isFilterQuery = false;
	if (filter && Object.keys(filter).length > 0) {
		for (const [key, filters] of Object.entries(filter)) {
			if (filters) {
				sentencesQueryCreator = sentencesQueryCreator.in(
					key,
					filters.map(
						(filterSentence) => new RegExp(filterSentence, 'gi')
					)
				);
				isFilterQuery = true;
			}
		}
	}

	if (searchTerm) {
		const regex = new RegExp(searchTerm, 'gi');
		sentencesQueryCreator.find({
			$or: [{ content: regex }, { translation: regex }],
		});
	}

	const sentencesQuery = sentencesQueryCreator.toConstructor();
	const total = await new sentencesQuery().countDocuments();
	const sentences = await new sentencesQuery()
		.limit(limit)
		.skip(skip)
		.exec();
	return {
		total,
		sentences: sentences.map((entry) =>
			entry.toJSON<IDictionarySentence>()
		),
	};
};

const getAllForWord = async ({
	userId,
	langId,
	wordId,
}: {
	userId: string;
	langId: string;
	wordId: string;
}): Promise<Array<IDictionarySentence>> => {
	const junctions = await SentenceWord.find({
		wordId,
		userId,
		langId,
	});
	const sentenceIds = junctions.map(({ sentenceId }) => sentenceId);
	const entries = await DictionarySentence.find({
		lang: langId,
		userId,
	})
		.in('_id', sentenceIds)
		.exec();
	return entries.map((entry) => entry.toJSON<IDictionarySentence>());
};

const getAllByLanguage = async ({
	userId,
	langId,
}: {
	userId: string;
	langId: string;
}): Promise<Array<IDictionarySentence>> => {
	const foundWords = await DictionarySentence.find({
		userId,
		lang: langId,
	}).exec();
	return foundWords.map((w) => w.toJSON<IDictionarySentence>());
};

const remove = async ({
	userId,
	langId,
	id,
}: {
	userId: string;
	langId: string;
	id: string;
}) => {
	await DictionarySentence.deleteOne({
		userId,
		lang: langId,
		_id: id,
	}).exec();
};

const create = async ({
	userId,
	langId,
	sentence,
}: {
	userId: string;
	langId: string;
	sentence: Omit<IDictionarySentence, 'id'>;
}): Promise<string> => {
	const createdSentence = await DictionarySentence.create({
		userId,
		lang: langId,
		...sentence,
	});
	return createdSentence.id;
};

const update = async ({
	userId,
	id,
	langId,
	newSentence,
}: {
	userId: string;
	langId: string;
	id: string;
	newSentence: Omit<IDictionarySentence, 'id'>;
}) => {
	await DictionarySentence.updateOne(
		{ _id: id, lang: langId, userId },
		{ ...newSentence }
	);
};

export {
	get,
	getAllByLanguage,
	getAllForWord,
	create,
	update,
	remove,
	listSentences,
};
