import { prop, getModelForClass } from '@typegoose/typegoose';
import { getUUID, UUID } from '../Document/UUID';

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

class YiDocument implements IYiDocument {
	@prop()
	public updatedAt: Date;
	@prop()
	public createdAt: Date;
	@prop()
	public id: UUID;
	@prop({ type: () => DocumentBlock })
	public blocks: DocumentBlock[];
}
