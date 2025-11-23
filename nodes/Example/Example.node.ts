import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { run } from '@bufbuild/cel';
import { STRINGS_EXT_FUNCS } from '@bufbuild/cel/ext/strings';

type Transaction = {
	text: string;
};

type Rule = {
	tag: string;
	rule: string;
};

export class Example implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Example',
		name: 'example',
		icon: { light: 'file:example.svg', dark: 'file:example.dark.svg' },
		version: 1,
		description: 'Basic Example Node',
		defaults: {
			name: 'Example',
		},
		usableAsTool: true,
		group: ['transform'],
		inputs: [
			{
				displayName: 'Rules',
				type: NodeConnectionTypes.Main,
				required: true,
			},
			{
				displayName: 'Data',
				type: NodeConnectionTypes.Main,
				required: true,
			},
		],
		outputs: [NodeConnectionTypes.Main],
		outputNames: ['Tagged Data'],
		properties: [],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const rules = this.getInputData(0).map((item) => item.json) as Rule[];
		const data = this.getInputData(1).map((item) => item.json) as Transaction[];

		return [
			data.map((item) => {
				/* const tag = run(item.rule, { text: 'edeka obi' }, { funcs: STRINGS_EXT_FUNCS })
					? item.tag
					: null; */

				const tags = rules
					.filter(({ rule }) => run(rule, item, { funcs: STRINGS_EXT_FUNCS }))
					.map(({ tag }) => tag);

				return { json: { ...item, tags } };
			}),
		];

		/* const items = this.getInputData();

		const result: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const data = item.json;

				if (!data.tag || typeof data.tag !== 'string') {
					throw new NodeOperationError(
						this.getNode(),
						'Missing or invalid required field: "tag" must be a string',
						{ itemIndex },
					);
				}

				if (!data.rule || typeof data.rule !== 'string') {
					throw new NodeOperationError(
						this.getNode(),
						'Missing or invalid required field: "rule" must be a string',
						{ itemIndex },
					);
				}

				const validatedData = data as InputItem;

				const tag = run(validatedData.rule, { text: 'edeka obi' }, { funcs: STRINGS_EXT_FUNCS })
					? validatedData.tag
					: null;

				result.push({ json: { tag } });
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: { error: error.message }, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [result]; */
	}
}
