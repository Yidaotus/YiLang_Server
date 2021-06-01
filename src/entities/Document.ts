import { config } from '../helpers/config';
import mongoose, { Schema, model, connect } from 'mongoose';

interface BaseBlock {
	type: 'Title' | 'Paragraph';
	fid: string;
}

interface TitleBlock extends BaseBlock {
	type: 'Title';
	title: string;
}

interface ParagraphBlock extends BaseBlock {
	type: 'Paragraph';
	paragraph: string;
}

// 1. Create an interface representing a document in MongoDB.
interface User {
	name: string;
	email: string;
	blocks: Array<TitleBlock | ParagraphBlock>;
}

const discriminatorOption = {
	discriminatorKey: 'type',
	_id: false,
};

const blockSchema = new Schema<BaseBlock>(
	{
		fid: { type: String, required: true },
	},
	discriminatorOption
);
var BlockModel = model<BaseBlock>('Block', blockSchema);
/*var TitleBlockModel = BlockModel.discriminator(
	'Title',
	new Schema({ title: String }, discriminatorOption)
);*/

// 2. Create a Schema corresponding to the document interface.
const docSchema = new Schema<User>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		blocks: [blockSchema],
	},
	{ timestamps: true }
);

//var blockArray = docSchema.path('events') as mongoose.Schema.Types.DocumentArray;
var blockArray = docSchema.path(
	'blocks'
) as mongoose.Schema.Types.DocumentArray;
blockArray.discriminator(
	'Title',
	new Schema({ title: String }, discriminatorOption)
);
blockArray.discriminator(
	'Paragraph',
	new Schema({ paragraph: String }, discriminatorOption)
);
// 3. Create a Model.
const UserModel = model<User>('Docs', docSchema);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
var mongoDB = config.db.connectionString;
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection YiErrors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
	try {
		const name = Date.now().toString();
		const newUser = new UserModel({
			name,
			email: 12,
			blocks: [
				{
					fid: 'x',
					type: 'Title',
					title: 'Hi T',
				},
				{
					fid: 'x2',
					type: 'Paragraph',
					paragraph: 'Hi P',
				},
				{
					fid: 'x',
					type: 'NOne',
				},
			],
		});
		await newUser.save();
		console.log(newUser.blocks[0].type);
		const foundUser = await UserModel.findOne({ name }).exec();
		const fUo = foundUser.toObject();
		console.log(fUo);
	} catch (e) {
		console.log(e);
	}
});
