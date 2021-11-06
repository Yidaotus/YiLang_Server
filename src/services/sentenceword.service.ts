import { IDictionarySentence } from '../Document/Dictionary';
import SentenceWord from '../entities/SentenceWord';

const link = async ({
	userId,
	langId,
	wordId,
	sentenceId,
}: {
	userId: string;
	langId: string;
	wordId: string;
	sentenceId: string;
}): Promise<IDictionarySentence> => {
	const sentenceWordId = await SentenceWord.create({
		userId,
		langId,
		sentenceId,
		wordId,
	});
	return sentenceWordId.id;
};

const unlink = async ({
	userId,
	langId,
	wordId,
	sentenceId,
}: {
	userId: string;
	langId: string;
	wordId: string;
	sentenceId: string;
}): Promise<void> => {
	await SentenceWord.findOneAndDelete({
		userId,
		langId,
		sentenceId,
		wordId,
	});
};

export { link, unlink };
