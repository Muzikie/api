export const createSchema = {
	$id: 'campaign/create',
	title: 'Create transaction asset for campaign module',
	type: 'object',
	required: ['softGoal', 'hardGoal', 'deadline', 'apiId'],
	properties: {
		softGoal: {
			dataType: 'string',
			fieldNumber: 1,
		},
		hardGoal: {
			dataType: 'string',
			fieldNumber: 2,
		},
		deadline: {
			dataType: 'string',
			fieldNumber: 3,
		},
		apiId: {
			dataType: 'uint32',
			fieldNumber: 4,
		},
	},
};

export const addTierSchema = {
	$id: 'campaign/addTier',
	title: 'AddTier transaction asset for campaign module',
	type: 'object',
	required: ['amount', 'apiId', 'campaignId'],
	properties: {
		amount: {
			dataType: 'string',
			fieldNumber: 1,
		},
		apiId: {
			dataType: 'uint32',
			fieldNumber: 2,
		},
		campaignId: {
			dataType: 'string',
			fieldNumber: 3,
		},
	},
};

export const publishSchema = {
	$id: 'campaign/publish',
	title: 'Publish transaction asset for campaign module',
	type: 'object',
	required: ['campaignId'],
	properties: {
		campaignId: {
			dataType: 'string',
			fieldNumber: 1,
		},
	},
};

export const payoutSchema = {
	$id: 'campaign/payout',
	title: 'Payout transaction asset for campaign module',
	type: 'object',
	required: ['campaignId'],
	properties: {
		campaignId: {
			dataType: 'string',
			fieldNumber: 1,
		},
	},
};

export const contributeSchema = {
	$id: 'campaign/contribute',
	title: 'Contribute transaction asset for campaign module',
	type: 'object',
	required: ['campaignId', 'tierId'],
	properties: {
		campaignId: {
			dataType: 'string',
			fieldNumber: 1,
		},
		tierId: {
			dataType: 'uint32',
			fieldNumber: 2,
		},
	},
};

export const reimburseSchema = {
	$id: 'campaign/reimburse',
	title: 'Reimburse transaction asset for campaign module',
	type: 'object',
	required: ['campaignId'],
	properties: {
		campaignId: {
			dataType: 'string',
			fieldNumber: 1,
		},
	},
};