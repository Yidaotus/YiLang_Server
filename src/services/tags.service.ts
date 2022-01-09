import { IDictionaryTag } from '../Document/Dictionary';
import DictionaryTag from '../entities/Tag';

const get = async ({
	userId,
	id,
	langId,
}: {
	userId: string;
	id: string;
	langId: string;
}): Promise<IDictionaryTag> => {
	const entry: IDictionaryTag = await DictionaryTag.findOne({
		userId,
		lang: langId,
		_id: id,
	}).exec();
	return entry;
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

const find = async ({
	userId,
	lang,
	searchTerm,
}: {
	userId: string;
	lang: string;
	searchTerm: string;
}) => {
	const tags = await DictionaryTag.find({
		name: new RegExp(`.*${searchTerm}.*`, 'gi'),
		lang,
		userId,
	}).exec();
	return tags.map((entry) => entry.toJSON<IDictionaryTag>());
};

export { get, getAllByLanguage, create, update, remove, find };
