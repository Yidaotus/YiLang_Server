import { getUUID, UUID } from './UUID';
import { FragmentableString, IFragmentableString } from './Fragment';

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
	id: UUID;
	type: BlockType;
	fragmentables: { [key: string]: IFragmentableString };
}

type ITitleBlock = { type: 'Title' } & ISimpleBlock;
type IParagraphBlock = { type: 'Paragraph' } & ISimpleBlock;

type Block<T> = T & IDocumentBlock;

export type DocumentBlock =
	| Block<IImageBlock>
	| Block<IDialogBlock>
	| Block<ITitleBlock>
	| Block<IParagraphBlock>;

type BlockParameters = { checkDictionary: boolean } & (
	| {
			type: Extract<BlockType, 'Title' | 'Paragraph'>;
			content: string;
	  }
	| { type: Extract<BlockType, 'Image'>; source: string }
	| {
			type: Extract<BlockType, 'Dialog'>;
			lines: Array<{ speaker: string; speech: string }>;
	  }
);

function notUndefined<T>(x: T | undefined): x is T {
	return x !== undefined;
}

const createBlock = (parameters: BlockParameters): DocumentBlock => {
	switch (parameters.type) {
		case 'Paragraph':
		case 'Title': {
			const fragmentable = FragmentableString(parameters.content);
			if (parameters.checkDictionary) {
				// const frags = createaAhoFragments(parameters.content);
				// fragmentable.fragments = frags;
			}
			return {
				type: parameters.type,
				content: fragmentable.id,
				id: getUUID(),
				fragmentables: { [fragmentable.id]: fragmentable },
			};
		}
		case 'Dialog': {
			const lines: IDialogBlockLine[] = [];
			const fragmentables: { [key: string]: IFragmentableString } = {};
			for (const line of parameters.lines) {
				const speech = line.speech.trim();
				const speaker = line.speaker.trim();
				const fragmentable = FragmentableString(speech);
				lines.push({ speaker, speech: fragmentable.id });
				if (parameters.checkDictionary) {
					// const frags = createaAhoFragments(speech);
					// fragmentable.fragments = frags;
				}
				fragmentables[fragmentable.id] = fragmentable;
			}
			return { type: 'Dialog', id: getUUID(), lines, fragmentables };
		}
		case 'Image':
			return {
				type: 'Image',
				source: parameters.source,
				id: getUUID(),
				fragmentables: {},
			};
		default:
			return assertNever(parameters);
	}
};

const parseBlock = ({
	type,
	content,
}: {
	type: BlockType;
	content: string;
}): DocumentBlock => {
	switch (type) {
		case 'Paragraph':
		case 'Title': {
			return createBlock({ type, content, checkDictionary: false });
		}
		case 'Image': {
			const regex =
				/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/gm;
			if (!regex.test(content)) {
				const error = new Error(
					`To create an image block please enter a valid url to your image!`
				);
				error.name = 'Malformed input!';
				throw error;
			}

			return createBlock({
				type,
				source: content,
				checkDictionary: false,
			});
		}
		case 'Dialog': {
			const lines = content.split('\n').map((line) => {
				const splits = line.split(':');
				if (splits.length !== 2) {
					const error = new Error(
						`Input doesn't match the required format. Please enter a Dialog in the form of : 'speaker : speech' seperated by new lines!`
					);
					error.name = 'Malformed input!';
					throw error;
				}
				const speaker = line.split(':')[0];
				const speech = line.split(':')[1];
				return {
					speaker,
					speech,
				};
			});
			return createBlock({
				type,
				lines,
				checkDictionary: false,
			});
		}
		default:
			return assertNever(type);
	}
};

export { createBlock, blockTypes, parseBlock, notUndefined };
