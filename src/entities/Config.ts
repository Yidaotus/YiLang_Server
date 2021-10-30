import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import {
	IConfig,
	ILanguageConfig,
	IDictionaryLookupSource,
} from '../Document/Config';

export interface IConfigDB extends IConfig {
	_id: String;
	userId: Schema.Types.ObjectId;
	languageConfigs: Types.DocumentArray<ILanguageConfig & Types.Subdocument>;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

type IConfigDocument = IConfigDB & Document;
export interface IConfigModel extends Model<IConfigDocument> {}

const DictionaryLookupSourceSchema = new Schema<IDictionaryLookupSource>(
	{
		priority: { type: Number, required: true },
		name: { type: String, required: true },
		source: { type: String, required: true },
	},
	{ _id: false }
);

const LanguageConfigSchema = new Schema<ILanguageConfig>({
	name: { type: String, required: true },
	lookupSources: { type: [DictionaryLookupSourceSchema], required: false },
});

LanguageConfigSchema.index({ name: 1 });
LanguageConfigSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(_: unknown, ret: IConfigDocument) {
		ret.id = ret._id;
		delete ret._id;
	},
});

const ConfigSchema = new Schema<IConfigDocument, IConfigModel>(
	{
		languageConfigs: { type: [LanguageConfigSchema], require: false },
		activeLanguage: { type: String, require: false },
		userId: { type: Schema.Types.ObjectId, require: true },
		createdAt: Date,
		updatedAt: Date,
		deletedAt: Date,
	},
	{ timestamps: true }
);

ConfigSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function(_: unknown, ret: IConfigDocument) {
		ret.id = ret._id;
		delete ret._id;
		delete ret.userId;
		delete ret.deletedAt;
	},
});

export default mongoose.model<IConfigDocument, IConfigModel>(
	'Configuration',
	ConfigSchema
);
