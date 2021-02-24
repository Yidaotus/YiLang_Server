import { ObjectId } from 'mongoose';

export type DictionaryEntryField =
	| 'word'
	| 'translation'
	| 'createdAt'
	| 'updatedAt';

const ApiStatuses = {
	OK: 1,
	UNAUTHANTICATED: 2,
	UNAUTHORIZED: 3,
	INVALIDARGUMENT: 4,
	ERROR: 5,
} as const;
type ApiStatus = typeof ApiStatuses[keyof typeof ApiStatuses];
export { ApiStatus, ApiStatuses };

type ApiMethod = 'post' | 'put' | 'patch' | 'get' | 'delete';

interface ApiEndpoint {
	path: string;
	method: ApiMethod;
}
interface ApiPath {
	path: string;
	endpoints: {
		[key: string]: ApiEndpoint;
	};
}

const ApiPaths: { [key: string]: ApiPath } = {
	user: {
		path: 'user',
		endpoints: {
			login: {
				path: 'login',
				method: 'post',
			},
			register: {
				path: 'register',
				method: 'post',
			},
			auth: {
				path: 'auth',
				method: 'get',
			},
			verify: {
				path: 'verify',
				method: 'post',
			},
		},
	},
	dict: {
		path: 'dict',
		endpoints: {
			add: {
				path: 'entries',
				method: 'post',
			},
			applyDelta: {
				path: 'delta',
				method: 'post',
			},
			modify: {
				path: 'entry',
				method: 'patch',
			},
			delete: {
				path: 'entry',
				method: 'delete',
			},
			getAll: {
				path: 'entries',
				method: 'get',
			},
			get: {
				path: 'entry',
				method: 'get',
			},
			fetch: {
				path: 'entry/fetch',
				method: 'post',
			},
			analyze: {
				path: 'analyze',
				method: 'post',
			},
		},
	},
};

export { ApiPaths };

export interface IRegisterParams {
	username: string;
	email: string;
	password: string;
}

export interface IVerifyEmailParams {
	token: string;
}

export interface ILoginParams {
	email: string;
	password: string;
}

export interface IUserResponseData {
	id?: ObjectId;
	email: string;
	username: string;
}

export interface ILoginResponseData {
	user: IUserResponseData;
	token: string;
}

export interface IUserData {
	id: string;
}

export interface ITokenData {
	user: IUserData;
}

export interface IApiResponse<T> {
	status: ApiStatus;
	message: string;
	payload?: T;
}

export interface IDictionaryEntryParams {
	word: string;
	translation: string;
	lang: string;
}

export interface IFragementData {
	position: number;
	entries: IDictionaryEntryData[];
}

export interface IEntryTag {
	name: string;
	color?: string;
	comment?: string; // Te versions are used for conjugation ect..
}

interface ITextPosition {
	start: number;
	end: number;
}

interface ISource<T> {
	pos: ITextPosition;
	source: T;
}

interface IDictionaryVariant {
	key: string;
	tags: IEntryTag[];
	comment: string;
	spelling?: string;
}

export interface ISentence {
	content: string;
	translation: string;
}

interface IDocument {
	title: string;
	content: string;
	lang: string;
	source?: string;
}

export interface IDictionaryDelta {
	removedEntries: Array<string>;
	updatedEntries: Array<{ [key: string]: IDictionaryEntryData }>;
	addedEntries: Array<{ [key: string]: IDictionaryEntryData }>;
}

export interface IDictionaryEntryData {
	entryId: string;
	key: string;
	lang: string;
	translations: string[];
	sourceDocument?: ISource<IDocument>;
	firstSeen?: ISource<ISentence>;
	tags: IEntryTag[];
	// type: IEntryType;
	comment?: string;
	spelling?: string;
	variations: IDictionaryVariant[];
}

export interface IDictionaryFetchParams {
	sortBy: DictionaryEntryField;
	lang: string;
	limit: number;
	skip: number;
}

export interface IDocumentParam {
	document: string;
	lang: string;
}
