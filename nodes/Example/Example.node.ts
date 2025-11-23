import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
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
		displayName: 'Tag Transactions',
		name: 'example',
		icon: { light: 'file:example.svg', dark: 'file:example.dark.svg' },
		version: 1,
		description: 'Tag transactions based on rules',
		defaults: {
			name: 'Tag Transactions',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const rules = this.getInputData(0).map((item) => item.json) as Rule[];
		const data = this.getInputData(1).map((item) => item.json) as Transaction[];

		return [
			data.map((item) => {
				const tags = rules
					.filter(({ rule }) => run(rule, item, { funcs: STRINGS_EXT_FUNCS }))
					.map(({ tag }) => tag);
				return { json: { ...item, tags } };
			}),
		];
	}
}
