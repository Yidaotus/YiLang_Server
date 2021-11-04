import { Schema, Types } from 'mongoose';
import { IDictionarySentence } from '../Document/Dictionary';
import DictionarySentence from '../entities/Sentence';
import SentenceWord, { ISentenceWord } from '../entities/SentenceWord';

const get = async ({
	userId,
	id,
}: {
	userId: string;
	id: string;
}): Promise<IDictionarySentence> => {
	const sentence = await DictionarySentence.findOne({
		userId,
		_id: id,
	})
		.lean<IDictionarySentence>()
		.exec();
	return sentence;
};

const getAllForWord = async ({
	userId,
	wordId,
}: {
	userId: string;
	wordId: string;
}): Promise<Array<IDictionarySentence>> => {
	const junctions = await SentenceWord.find({
		wordId,
		userId,
	});
	const sentenceIds = junctions.map(({ sentenceId }) => sentenceId);
	const entries: IDictionarySentence[] = await DictionarySentence.find({
		userId,
	})
		.in('id', sentenceIds)
		.lean<Array<IDictionarySentence>>()
		.exec();
	return entries;
};

const getAllByLanguage = async ({
	userId,
	lang,
}: {
	userId: string;
	lang: string;
}): Promise<Array<IDictionarySentence>> => {
	return await DictionarySentence.find({
		userId,
		lang,
	})
		.lean<Array<IDictionarySentence>>()
		.exec();
};

const remove = async ({ userId, id }: { userId: string; id: string }) => {
	await DictionarySentence.deleteOne({
		userId,
		_id: id,
	}).exec();
};

const create = async ({
	userId,
	sentence,
}: {
	userId: string;
	sentence: Omit<IDictionarySentence, 'id'>;
}): Promise<string> => {
	const createdSentence = await DictionarySentence.create({
		userId,
		...sentence,
	});
	return createdSentence.id;
};

const update = async ({
	userId,
	id,
	newSentence,
}: {
	userId: string;
	id: string;
	newSentence: Omit<IDictionarySentence, 'id'>;
}) => {
	await DictionarySentence.updateOne({ id: id, userId }, { ...newSentence });
};

export { get, getAllByLanguage, getAllForWord, create, update, remove };
