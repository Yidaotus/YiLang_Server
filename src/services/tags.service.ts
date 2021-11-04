import { IDictionaryTag } from '../Document/Dictionary';
import DictionaryTag from '../entities/Tag';

const get = async ({
	userId,
	ids,
}: {
	userId: string;
	ids: Array<string>;
}): Promise<Array<IDictionaryTag>> => {
	const entries: IDictionaryTag[] = await DictionaryTag.find({
		userId,
	})
		.in('id', ids)
		.exec();
	return entries;
};

const getAllByLanguage = async ({
	userId,
	lang,
}: {
	userId: string;
	lang: string;
}): Promise<Array<IDictionaryTag>> => {
	const entries: IDictionaryTag[] = await DictionaryTag.find({
		lang,
		userId,
	}).exec();
	return entries;
};

const remove = async ({ userId, id }: { userId: string; id: string }) => {
	await DictionaryTag.deleteOne({
		userId,
		_id: id,
	}).exec();
};

const create = async ({
	userId,
	tag,
}: {
	userId: string;
	tag: Omit<IDictionaryTag, 'id'>;
}): Promise<string> => {
	const createdTag = await DictionaryTag.create({ userId, ...tag });
	return createdTag.id;
};

const update = async ({
	userId,
	id,
	newTag,
}: {
	userId: string;
	id: string;
	newTag: Omit<IDictionaryTag, 'id'>;
}) => {
	await DictionaryTag.updateOne({ id: id, userId }, { ...newTag });
};

export { get, getAllByLanguage, create, update, remove };
