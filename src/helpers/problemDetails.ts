export interface IProblemDetails {
	type: string;
	title: string;
	status: number;
	detail?: string;
	instance?: string;
}

export type APIError<ProblemExtension> = IProblemDetails & ProblemExtension;
