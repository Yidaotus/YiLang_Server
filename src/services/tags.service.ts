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

const remove = async ({
	userId,
	langId,
	id,
}: {
	userId: string;
	langId: string;
	id: string;
}) => {
	await DictionaryTag.deleteOne({
		userId,
		lang: langId,
		_id: id,
	}).exec();
};

const create = async ({
	userId,
	langId,
	tag,
}: {
	userId: string;
	langId: string;
	tag: Omit<IDictionaryTag, 'id'>;
}): Promise<string> => {
	const createdTag = await DictionaryTag.create({
		userId,
		lang: langId,
		...tag,
	});
	return createdTag.id;
};

const update = async ({
	userId,
	langId,
	id,
	newTag,
}: {
	userId: string;
	langId: string;
	id: string;
	newTag: Omit<IDictionaryTag, 'id'>;
}) => {
	await DictionaryTag.updateOne({ id, userId, lang: langId }, { ...newTag });
};

export { get, getAllByLanguage, create, update, remove };
