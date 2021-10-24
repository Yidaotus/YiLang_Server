import { Schema } from 'mongoose';
import { IDictionaryTag } from '../Document/Dictionary';
import { UUID } from '../Document/UUID';
import DictionaryTag from '../entities/Tag';

const get = async ({
	userId,
	ids,
}: {
	userId: Schema.Types.ObjectId;
	ids: Array<UUID>;
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
	userId: Schema.Types.ObjectId;
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
	ids,
}: {
	userId: Schema.Types.ObjectId;
	ids: Array<string>;
}) => {
	await DictionaryTag.deleteMany({
		userId,
	})
		.in('id', ids)
		.exec();
};

const create = async ({
	userId,
	tag,
}: {
	userId: Schema.Types.ObjectId;
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
	userId: Schema.Types.ObjectId;
	id: UUID;
	newTag: IDictionaryTag;
}) => {
	await DictionaryTag.updateOne({ id: id, userId }, { ...newTag });
};

export { get, getAllByLanguage, create, update, remove };
