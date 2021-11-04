import { IDictionarySentence } from '../Document/Dictionary';
import SentenceWord from '../entities/SentenceWord';

const link = async ({
	userId,
	wordId,
	sentenceId,
}: {
	userId: string;
	wordId: string;
	sentenceId: string;
}): Promise<IDictionarySentence> => {
	const sentenceWordId = await SentenceWord.create({
		userId,
		sentenceId,
		wordId,
	});
	return sentenceWordId.id;
};

const unlink = async ({
	userId,
	wordId,
	sentenceId,
}: {
	userId: string;
	wordId: string;
	sentenceId: string;
}): Promise<void> => {
	await SentenceWord.findOneAndDelete({
		userId,
		sentenceId,
		wordId,
	});
};

export { link, unlink };
