import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { run } from '@bufbuild/cel';
import { STRINGS_EXT_FUNCS } from '@bufbuild/cel/ext/strings';

type InputItem = {
	tag: string;
	rule: string;
};

export class Example implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Example',
		name: 'example',
		icon: { light: 'file:example.svg', dark: 'file:example.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Basic Example Node',
		defaults: {
			name: 'Example',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

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

		return [result];
	}
}
