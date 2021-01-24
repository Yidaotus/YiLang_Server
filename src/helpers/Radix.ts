export interface IRadixEdge<T> {
	prefix: string;
	node: IRadixNode<T>;
}

export interface IRadixNode<T> {
	value: T | null;
	key: string;
	edges: Array<IRadixEdge<T>>;
}

const prefixLength = (s1: string, s2: string) => {
	let length = 0;
	for (let i = 0; i < s1.length; i++) {
		if (s1[i] !== s2[i] || i >= s2.length) {
			return length;
		}
		length++;
	}
	return length;
};

const split = <T>(
	parentNode: IRadixNode<T>,
	nodeLeft: IRadixNode<T>,
	nodeRight: IRadixNode<T>,
	commonPrefix: string,
	edgeKey: number,
	seenPrefixLength: number
) => {
	const splitNode: IRadixNode<T> = {
		value: null,
		key: nodeLeft.key.substr(0, seenPrefixLength + commonPrefix.length),
		edges: new Array<IRadixEdge<T>>(),
	};

	const p1 = nodeLeft.key.substring(seenPrefixLength + commonPrefix.length, nodeLeft.key.length);

	if (p1) {
		splitNode.edges.push({
			prefix: p1,
			node: nodeLeft,
		});
	}

	const p2 = nodeRight.key.substring(seenPrefixLength + commonPrefix.length, nodeRight.key.length);
	if (p2) {
		splitNode.edges.push({
			prefix: p2,
			node: nodeRight,
		});
	}

	parentNode.edges.splice(edgeKey, 1);
	parentNode.edges.push({
		prefix: commonPrefix,
		node: splitNode,
	});
};

const findAll = <T>(node: IRadixNode<T>, key: string, seenPrefix: number = 0, entries: Array<T>) => {
	const suffix = key.substring(seenPrefix, key.length);
	const prefix = key.substr(0, seenPrefix);

	if (node.value && node.key === prefix) {
		entries.push(node.value);
	}

	for (const edge of node.edges) {
		const commonPrefixLength = prefixLength(suffix, edge.prefix);
		if (commonPrefixLength > 0) {
			findAll(edge.node, key, seenPrefix + commonPrefixLength, entries);
		}
	}
};

const find = <T>(node: IRadixNode<T>, key: string, seenPrefix: number = 0): IRadixNode<T> | null => {
	const suffix = key.substring(seenPrefix, key.length);

	if (node.key === key) {
		return node;
	}

	for (const edge of node.edges) {
		const commonPrefixLength = prefixLength(suffix, edge.prefix);
		if (commonPrefixLength === edge.prefix.length) {
			return find(edge.node, key, seenPrefix + commonPrefixLength);
		}
	}

	return null;
};

const insert = <T>(node: IRadixNode<T>, key: string, value: T, seenPrefix: number = 0) => {
	const suffix = key.substring(seenPrefix, key.length);
	if (node.key === key) {
		return;
	}

	for (const [edgeKey, edge] of node.edges.entries()) {
		const commonPrefixLength = prefixLength(suffix, edge.prefix);
		if (commonPrefixLength > 0) {
			if (commonPrefixLength == suffix.length) {
				const newNode = {
					key,
					value,
					edges: new Array<IRadixEdge<T>>(),
				};

				newNode.edges.push({
					prefix: edge.prefix.substring(commonPrefixLength, edge.prefix.length),
					node: edge.node,
				});

				node.edges.splice(edgeKey, 1);
				node.edges.push({ prefix: suffix, node: newNode });
				return;
			}
			if (commonPrefixLength === edge.prefix.length) {
				insert(edge.node, key, value, seenPrefix + commonPrefixLength);
				return;
			}
			if (commonPrefixLength < edge.prefix.length) {
				const newNode = {
					key,
					value,
					edges: new Array<IRadixEdge<T>>(),
				};
				split(
					node,
					edge.node,
					newNode,
					edge.prefix.substr(0, commonPrefixLength),
					edgeKey,
					seenPrefix
				);
				return;
			}
		}
	}
	node.edges.push({
		prefix: suffix,
		node: {
			value,
			key,
			edges: new Array<IRadixEdge<T>>(),
		},
	});
};

export { insert, findAll, find };
