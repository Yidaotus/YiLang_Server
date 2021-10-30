import { Schema } from 'mongoose';
import { IConfig } from '../Document/Config';
import Config from '../entities/Config';

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

const set = async ({
	userId,
	config,
}: {
	userId: Schema.Types.ObjectId;
	config: Partial<IConfig>;
}): Promise<void> => {
	await Config.updateOne(
		{ userId },
		{ userId, ...config },
		{
			upsert: true,
			runValidators: true,
		}
	);
};

export { get, set };
