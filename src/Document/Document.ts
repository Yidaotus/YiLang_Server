import { DocumentBlock } from './Block';
import { IFragmentableRange } from './Fragment';
import { UUID } from './UUID';

export interface IDocument {
	createdAt: Date;
	updatedAt: Date;
	id: UUID;
	blocks: { [key: string]: DocumentBlock };
	positions: { [key: string]: number };
}

export enum HighlightStyle {
	DOTTED,
	UNDERLINE,
	HIGHLIGHT,
}

export interface IEntryType {
	name: string;
	color: string;
	highlightStyle: HighlightStyle;
	comment?: string; // Te versions are used for conjugation ect..
}

export interface IEntrySubType {
	name: string;
	root: IEntryType;
	comment?: string; // Te versions are used for conjugation ect..
}

export interface IGrammarPoint {
	name: string;
	description: string;
	construction: string[];
}

export interface IEntryTag {
	id: UUID;
	name: string;
	color?: string;
	grammarPoint?: IGrammarPoint; // Te versions are used for conjugation ect..
}

export interface ISentence {
	content: string;
	translation: string;
}

export interface ITextPosition {
	start: number;
	end: number;
}

export interface ISource<T> {
	pos: ITextPosition;
	source: T;
}

export interface IDictionaryEntry {
	id: UUID;
	key: string;
	lang: string;
	translations: string[];
	sourceDocument?: ISource<IDocument>;
	firstSeen?: ISource<ISentence>;
	tags: UUID[];
	// type: IEntryType;
	comment?: string;
	spelling?: string;
	variations: IDictionaryVariant[];
}

export interface IDictionaryVariant {
	key: string;
	tags?: UUID[];
	comment: string;
	spelling?: string;
}

export interface IDictionaryLookupSource {
	lang: string;
	name: string;
	source: string;
}

export interface ITextChunk {
	text?: string;
}

export interface IRubyChunk {
	base: string;
	rt: string;
}

export interface IDocumentSelection {
	blockId: UUID;
	fragmentableId: UUID;
	fragmentableRange: IFragmentableRange;
}

export interface IDocumentIdentifier {
	blockId: UUID;
	fragmentableId: UUID;
	fragmentId: UUID;
}
