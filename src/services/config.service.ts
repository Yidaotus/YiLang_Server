import { Schema } from 'mongoose';
import { IConfig, ILanguageConfig } from '../Document/Config';
import Config from '../entities/Config';

const addLanguage = async ({
	userId,
	languageConf,
}: {
	userId: Schema.Types.ObjectId;
	languageConf: Omit<ILanguageConfig, 'id'>;
}) => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const newLanguageConfig = config.languageConfigs.create(languageConf);
	config.languageConfigs.push(newLanguageConfig);
	config.save();
	return newLanguageConfig.id as string;
};

const removeLanguage = async ({
	userId,
	languageId,
}: {
	userId: Schema.Types.ObjectId;
	languageId: string;
}): Promise<void> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const currentConfig = config.languageConfigs.id(languageId);
	currentConfig.remove();
	config.save();
};

const updateLanguage = async ({
	userId,
	languageId,
	languageConf,
}: {
	userId: Schema.Types.ObjectId;
	languageId: string;
	languageConf: Partial<ILanguageConfig>;
}): Promise<void> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const currentConfig = config.languageConfigs.id(languageId);
	currentConfig.overwrite({
		...currentConfig.toJSON(),
		...languageConf,
	});
	currentConfig.save();
	config.save();
};

const getLanguage = async ({
	userId,
	languageId,
}: {
	userId: Schema.Types.ObjectId;
	languageId: string;
}): Promise<ILanguageConfig> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	return config.languageConfigs.id(languageId).toJSON() || null;
};

const get = async ({
	userId,
}: {
	userId: Schema.Types.ObjectId;
}): Promise<IConfig> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	return config?.toJSON() || null;
};

const remove = async ({
	userId,
	id,
}: {
	userId: Schema.Types.ObjectId;
	id: string;
}): Promise<void> => {
	await Config.deleteOne({ userId, _id: id });
};

const create = async ({
	userId,
	config,
}: {
	userId: Schema.Types.ObjectId;
	config: Omit<IConfig, 'id'>;
}): Promise<string> => {
	const createdConfig = await Config.create({ userId, config });
	return createdConfig.id;
};

const update = async ({
	userId,
	id,
	config,
}: {
	userId: Schema.Types.ObjectId;
	id: string;
	config: Partial<IConfig>;
}): Promise<void> => {
	await Config.updateOne({ userId, _id: id, config });
};

export {
	get,
	update,
	remove,
	create,
	addLanguage,
	getLanguage,
	removeLanguage,
	updateLanguage,
};
