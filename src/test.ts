import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { config } from './helpers/config';
import { getUUID, UUID } from './Document/UUID';

class MarkFragment {
	color: string;
	comment?: string;
}

class WordFragment {
	dictId: UUID;
}

class SentenceFragment {
	translation: string;
	words: Array<WordFragment>;
}

class NoteFragment {
	note: string;
}

interface IFragmentableRange {
	start: number;
	end: number;
}

class BlockFragment<T> {
	@prop()
	public id: UUID;
	@prop()
	public range: IFragmentableRange;
	@prop()
	public fragmented?: 'left' | 'right';
	@prop()
	public data: T;
}

class FragmentableString {
	@prop()
	public id: UUID;
	@prop()
	public root: string;
	@prop({ type: () => BlockFragment })
	public fragments: BlockFragment<unknown>[];
	@prop()
	public showSpelling: boolean;
	@prop()
	public highlightedFragment?: UUID;
}

interface IDialogBlockLine {
	speaker: string;
	speech: UUID;
}

class DocumentBlock {
	@prop()
	public position: number;
	@prop()
	public id: UUID;
	@prop({ type: () => FragmentableString })
	public fragmentables: FragmentableString[];
}

class DialogBlock extends DocumentBlock {
	lines: IDialogBlockLine[];
}

class ImageBlock extends DocumentBlock {
	source: string;
	title?: string;
}

class TitleBlock extends DocumentBlock {
	content: UUID;
}

class ParagraphBlock extends DocumentBlock {
	content: UUID;
}

interface IYiDocument {
	createdAt: Date;
	updatedAt: Date;
	id: UUID;
	blocks: Array<DocumentBlock>;
}

@modelOptions({ options: { customName: 'YiDoc' } })
class YiDocument {
	@prop()
	public frId: UUID;
	@prop({ type: () => DocumentBlock })
	public blocks: DocumentBlock[];

	constructor() {
		this.blocks = new Array<DocumentBlock>();
		this.frId = getUUID();
	}
}

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
	const YiDocumentModel = getModelForClass(YiDocument);
	let document = await YiDocumentModel.create(new YiDocument());
	console.log(document);
});
