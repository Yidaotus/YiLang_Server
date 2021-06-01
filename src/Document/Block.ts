import { UUID } from './UUID';
import { IFragmentableString } from './Fragment';

export interface ISimpleBlock {
	content: UUID;
}

export interface IDialogLine {
	speaker: string;
	speech: IFragmentableString;
}

export interface IDialogBlockLine {
	speaker: string;
	speech: UUID;
}

export interface IDialogBlock {
	lines: IDialogBlockLine[];
	type: 'Dialog';
}

export interface IImageBlock {
	type: 'Image';
	source: string;
	title?: string;
}

const assertNever = (x: never): never => {
	throw new Error(`Unexpected object: ${x}`);
};

const blockTypes = ['Title', 'Paragraph', 'Dialog', 'Image'] as const;
export type BlockType = typeof blockTypes[number];

interface IDocumentBlock {
	position: number;
	id: UUID;
	type: BlockType;
	fragmentables: Array<IFragmentableString>;
}

type ITitleBlock = { type: 'Title' } & ISimpleBlock;
type IParagraphBlock = { type: 'Paragraph' } & ISimpleBlock;

type Block<T> = T & IDocumentBlock;

export type DocumentBlock =
	| Block<IImageBlock>
	| Block<IDialogBlock>
	| Block<ITitleBlock>
	| Block<IParagraphBlock>;
