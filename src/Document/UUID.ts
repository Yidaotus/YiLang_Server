import { v4 as uuidv4 } from 'uuid';

// UUID type alias for string. We attach a isUUID property so typescript
// can distinguish this type with plain strings, which clearly indicates
// intend.
export type UUID = string & { isUUID: true };

/**
 * Convert a plain string to a UUID or create a new uuid
 */
const getUUID = (uuidString: string = uuidv4()): UUID => {
	return uuidString as UUID;
};

export { getUUID };
