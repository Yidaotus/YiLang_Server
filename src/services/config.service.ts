import { IConfig, IEditorConfig, ILanguageConfig } from '../Document/Config';
import Config from '../entities/Config';

const addLanguage = async ({
	userId,
	languageConf,
}: {
	userId: string;
	languageConf: Omit<ILanguageConfig, 'id'>;
}) => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const newLanguageConfig = config.languageConfigs.create(languageConf);
	config.languageConfigs.push(newLanguageConfig);
	await config.validate();
	config.save();
	return newLanguageConfig.id as string;
};

const removeLanguage = async ({
	userId,
	languageId,
}: {
	userId: string;
	languageId: string;
}): Promise<void> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const currentConfig = config.languageConfigs.id(languageId);
	currentConfig.remove();
	await config.validate();
	config.save();
};

const updateEditorConfig = async ({
	userId,
	editorConfig,
}: {
	userId: string;
	editorConfig: Partial<IEditorConfig>;
}): Promise<void> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const currentConfig = config.editorConfig.toJSON();
	config.editorConfig.overwrite({ ...currentConfig, ...editorConfig });
	await config.validate();
	config.save();
};

const updateLanguage = async ({
	userId,
	languageId,
	languageConf,
}: {
	userId: string;
	languageId: string;
	languageConf: Partial<ILanguageConfig>;
}): Promise<void> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	const currentConfig = config.languageConfigs.id(languageId);
	currentConfig.update({ ...languageConf });
	await config.validate();
	config.save();
};

const getLanguage = async ({
	userId,
	languageId,
}: {
	userId: string;
	languageId: string;
}): Promise<ILanguageConfig> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	return config.languageConfigs.id(languageId).toJSON() || null;
};

const get = async ({ userId }: { userId: string }): Promise<IConfig> => {
	const config = await Config.findOne({
		userId,
	}).exec();
	return config.toObject<IConfig>();
};

const remove = async ({
	userId,
	id,
}: {
	userId: string;
	id: string;
}): Promise<void> => {
	await Config.deleteOne({ userId, _id: id });
};

const create = async ({
	userId,
	config,
}: {
	userId: string;
	config: Omit<IConfig, 'id'>;
}): Promise<string> => {
	const createdConfig = await Config.create({ userId, config });
	return createdConfig.id;
};

const update = async ({
	userId,
	config,
}: {
	userId: string;
	config: Omit<Partial<IConfig>, 'languageConfigs' | 'editorConfig'>;
}): Promise<void> => {
	await Config.updateOne({ userId }, { ...config });
};

export {
	get,
	update,
	remove,
	create,
	addLanguage,
	updateEditorConfig,
	getLanguage,
	removeLanguage,
	updateLanguage,
};
