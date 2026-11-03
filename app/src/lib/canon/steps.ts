// THE one file for the canvas sections and the twelve steps.
//
// Every section title, colour and limit, and every step name, question,
// description, guide and example lives here, so the Canvas grid and the
// 12 Steps tab always say the same thing.
//
// The steps follow the Green Book, "An Agile Data Guide to Information
// Product Canvas" by Shane Gibson: one step per canvas area, in the order of
// the book's "First things first, Last things last" spread (pp. 112-113).
// Each step's name is the area's spread title, its question the heading on
// that spread, its description the area's line in "The 12 Canvas Areas"
// (pp. 32-33), its guide the book's advice to the Facilitator, and its
// example the spread's example canvas card. Read more opens the book's link
// for the area, the companion site's topic page.
//
// A guide is the spread's own sentences, condensed to a few. Three draw on
// the book's pages on order and sizing as well: Outcomes / Actions (the
// halting advice, pp. 112-113), Vision (the five prompts, pp. 54-55, put as
// one list) and T-Shirt Size (pp. 112-115). Keep the book's words as they
// are.
//
// Copy rules for anything the app adds: British spelling, "the
// organisation" never "the business", no em dashes, step labels in the form
// "Step 3 - Personas".

export interface SectionCanon {
	/** The entity label the section holds. */
	label: string;
	/** The section title on the Canvas grid, in the book's form. */
	title: string;
	color: string;
	/** One item only (Name, Product Owner, T-Shirt Size). */
	maxItems?: number;
	/** The word for one item and for many, used in a step's status line. */
	noun: [string, string];
	/** Values the book lists, offered on the add field. Any other value can still be typed. */
	suggestions?: string[];
	/** The add field's placeholder in a step. */
	placeholder: string;
}

export const SECTIONS = {
	global_info_product: { label: 'global_info_product', title: 'Name', color: '#0ea5e9', maxItems: 1, noun: ['Name', 'Names'], placeholder: 'Name the Information Product' },
	ipc_product_owner: { label: 'ipc_product_owner', title: 'Product Owner', color: '#0ea5e9', maxItems: 1, noun: ['Product Owner', 'Product Owners'], placeholder: 'Add the Product Owner' },
	ipc_tshirt_size: { label: 'ipc_tshirt_size', title: 'T-Shirt Size', color: '#0ea5e9', maxItems: 1, noun: ['T-Shirt Size', 'T-Shirt Sizes'], suggestions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'], placeholder: 'Pick or type a size' },
	ipc_vision: { label: 'ipc_vision', title: 'Vision', color: '#0ea5e9', noun: ['Vision', 'Visions'], placeholder: 'Add a Vision statement' },
	ipc_action_outcome: { label: 'ipc_action_outcome', title: 'Outcomes / Actions', color: '#7c3aed', noun: ['Outcome / Action', 'Outcomes / Actions'], placeholder: 'Add an Action and its Outcome' },
	global_persona: { label: 'global_persona', title: 'Personas', color: '#f97316', noun: ['Persona', 'Personas'], placeholder: 'Add a Persona' },
	global_business_question: { label: 'global_business_question', title: 'Business Questions', color: '#7c3aed', noun: ['Business Question', 'Business Questions'], placeholder: 'Add a Business Question' },
	ipc_delivery_type: {
		label: 'ipc_delivery_type',
		title: 'Delivery Types',
		color: '#f97316',
		noun: ['Delivery Type', 'Delivery Types'],
		suggestions: ['Dashboard', 'Report', 'Dataset', 'Data API', 'Data Sharing', 'Data Extract', 'Visualisation', 'Data Story', 'Analytical Model'],
		placeholder: 'Pick or type a Delivery Type'
	},
	ipc_data_sync: { label: 'ipc_data_sync', title: 'Data Sync', color: '#f97316', noun: ['Data Sync', 'Data Syncs'], placeholder: 'Add a Data Sync' },
	global_core_business_event: { label: 'global_core_business_event', title: 'Core Business Events', color: '#16a34a', noun: ['Core Business Event', 'Core Business Events'], placeholder: 'Add a Core Business Event' },
	ipc_feature_story: { label: 'ipc_feature_story', title: 'Feature Stories', color: '#f97316', noun: ['Feature Story', 'Feature Stories'], placeholder: 'Add a Feature Story' },
	ipc_will_wont: { label: 'ipc_will_wont', title: "Will / Won't", color: '#f97316', noun: ["Will or Won't", "Wills and Won'ts"], placeholder: "Add a Will or a Won't" }
} satisfies Record<string, SectionCanon>;

export type SectionLabel = keyof typeof SECTIONS;

export interface StepCanon {
	id: string;
	number: number;
	/** The area's name, its spread title in the book. */
	name: string;
	/** The question the step asks, the most prominent line of its panel: the heading on the area's spread. */
	question: string;
	/** The area's line in "The 12 Canvas Areas" (pp. 32-33). */
	description: string;
	/** The spread's advice to the Facilitator, in the book's words. */
	guide: string;
	/** The spread's example canvas card, or part of it. */
	example: string;
	/** The book's Read more link for the area: the companion site's topic page. */
	readMoreUrl: string;
	/** The canvas sections the step fills, in the order the panel shows them. */
	sections: SectionLabel[];
}

const SITE = 'https://informationproductcanvas.agiledataguides.com/t';

export const STEPS: StepCanon[] = [
	{
		id: 'questions',
		number: 1,
		name: 'Business Questions',
		question: 'What questions do you need information to help answer?',
		description: 'The business questions the delivered information will answer.',
		guide:
			"Business Questions usually start with 'how many', 'how much', 'how long', 'how often', 'where' and perhaps the most challenging one 'why'. We are seeking the first three to five business questions that come quickly to the forefront of the stakeholder's mind. Once the stakeholder stops to take a breath and starts to think more deeply, we stop and move onto the next area of the canvas.",
		example: 'How many orders have been placed? What is the percentage of abandoned orders?',
		readMoreUrl: `${SITE}/business-questions`,
		sections: ['global_business_question']
	},
	{
		id: 'outcomes',
		number: 2,
		name: 'Outcomes / Actions',
		question: 'What action will you take once you have the questions answered? What is the outcome once you have taken that action? What value will the Information Product help deliver?',
		description: 'The actions that will be taken and the outcomes that will be achieved by using the Information Product.',
		guide:
			'We are seeking answers to the question, "if you had this information at your fingertips, what Action would you take with it?" Then, "if these Actions succeed, what would the Outcomes be?" If the stakeholder cannot describe the Actions and Outcomes, consider halting the workshop: without a clear statement of value, the Information Product is unlikely to be prioritised for delivery.',
		example: 'Increase overall margin: optimise investment in new channels, optimise investment in new stores, reduce abandoned orders.',
		readMoreUrl: `${SITE}/outcomes`,
		sections: ['ipc_action_outcome']
	},
	{
		id: 'personas',
		number: 3,
		name: 'Personas',
		question: 'Who will use the Information Product?',
		description: 'The audience (personas) who will use the Information Product.',
		guide:
			'We want to identify who will directly interact with the Information Product, and who will take action based on the information. Personas can be based on skills, job roles, organisational units, or any other relevant categorisation. They may also identify systems of capture that the data will interface with.',
		example: 'Information Consumer, Data Analyst',
		readMoreUrl: `${SITE}/personas`,
		sections: ['global_persona']
	},
	{
		id: 'delivery',
		number: 4,
		name: 'Delivery Types',
		question: 'How do you want to consume the Information?',
		description: 'The output mediums by which the Information Product will be accessed.',
		guide:
			"The Delivery Type is the medium through which the information is accessed by the users. There could be one or multiple delivery types for a specific Information Product. Consider the Personas' needs and preferences, the nature of the data, and the Actions that need to be taken based on the information.",
		example: 'Dashboard, Data Extract',
		readMoreUrl: `${SITE}/delivery-type`,
		sections: ['ipc_delivery_type']
	},
	{
		id: 'sync',
		number: 5,
		name: 'Data Sync',
		question: 'When do you want the Information refreshed?',
		description: 'When the data in the Information Product needs to be refreshed by.',
		guide:
			'Stakeholders often consider when they want to access the information, not when the Information Product needs to be refreshed with new data. Data Sync involves synchronising new data from the Systems of Capture all the way through to the final Information Product: monthly, weekly, daily, hourly, or near real-time. There is a considerable difference in the data engineering required for updates once a day compared to every 15 minutes.',
		example: 'Daily, before 7am',
		readMoreUrl: `${SITE}/data-sync`,
		sections: ['ipc_data_sync']
	},
	{
		id: 'events',
		number: 6,
		name: 'Core Business Events',
		question: 'What data is required? Where is that data first captured?',
		description: "The organisation's processes that generate the data required by the Information Product.",
		guide:
			"Core Business Events represent key business processes, activities or transactions that capture the data needed to answer the Business Questions. Use the Agile Data 'Who Does What' pattern to name them, and include related events that may provide further context. Stay at a high level: understanding the detail can occur once the Information Product is prioritised for delivery.",
		example: 'Customer Places Order, Customer Pays for Order, Store Ships Product',
		readMoreUrl: `${SITE}/core-business-events`,
		sections: ['global_core_business_event']
	},
	{
		id: 'stories',
		number: 7,
		name: 'Feature Stories',
		question: 'What special features do you need?',
		description: 'The key features users will need when accessing the Information Product, expressed using the user story pattern.',
		guide:
			'We are seeking the first three to five features that spring to mind for the stakeholders. We focus on what the user wants to do, not the how. If you are using an off-the-shelf last-mile tool and the requested features are available in that tool, there is no need to add them here. Our goal is to identify a few key features the data team will need to build, particularly those that are high risk or high effort.',
		example: 'As a Data Analyst, I want to be able to export the data.',
		readMoreUrl: `${SITE}/feature-stories`,
		sections: ['ipc_feature_story']
	},
	{
		id: 'scope',
		number: 8,
		name: "Will / Won't",
		question: 'What is in scope and what is out of scope?',
		description: 'A statement of the scope boundary and high-level acceptance criteria for the Information Product.',
		guide:
			"We often find it more valuable to identify what won't be included, as stakeholders generally assume their requirements will be automatically met. Involve stakeholders when deciding on exclusions, so they understand and agree with the reasons. This area may need multiple iterations, as the data team researches high-effort or high-risk features.",
		example: "Won't include abandon carts. Will include returned products in the order value calculation.",
		readMoreUrl: `${SITE}/will-wont`,
		sections: ['ipc_will_wont']
	},
	{
		id: 'name',
		number: 9,
		name: 'Information Product Name',
		question: 'What shall we call it?',
		description: 'The name that uniquely identifies the Information Product.',
		guide:
			"The name should, at a glance, reflect the Information Product's purpose and content. It could be based on the main Business Question, the Core Business Event it supports, the key data it encapsulates, or the main Action or Outcome. Keep the name short but descriptive, and once agreed, use it consistently in all communications.",
		example: 'Order Revenue Metrics',
		readMoreUrl: `${SITE}/ipc-name`,
		sections: ['global_info_product']
	},
	{
		id: 'owner',
		number: 10,
		name: 'Product Owner',
		question: 'Who will make the trade off decisions as we build it?',
		description: 'Who will make the trade-off decisions throughout design, build, and delivery.',
		guide:
			'A single individual who can quickly make trade-off decisions as the data team delivers the Information Product, empowered to do so without having to ask a committee. It is not unusual to delay the identification of the Product Owner until the Information Product is prioritised for delivery. If not identified initially, list the primary stakeholder advocating for its delivery.',
		example: 'ADI McADI',
		readMoreUrl: `${SITE}/product-owner`,
		sections: ['ipc_product_owner']
	},
	{
		id: 'vision',
		number: 11,
		name: 'Vision',
		question: 'What is the elevator pitch?',
		description: 'The elevator pitch that summarises the value of the Information Product at a glance.',
		guide:
			'The Vision Statement is typically formulated after the rest of the canvas has been populated. Five parts: For (the primary Persona or sponsor), Who (the outcome they need, from Outcomes / Actions), The (the name melded with its primary Delivery Type), That (what it delivers, from Business Questions, Feature Stories and Will / Won\'t), Unlike (the alternative of not having it).',
		example: 'For the Chief Revenue Officer, Who needs to optimise the investment in new stores and new channels, The Order Revenue Metrics is a Dashboard, That automates the collection and consumption of order revenue data to understand the total order revenue and where it is driven from, Unlike the current manual excel process.',
		readMoreUrl: `${SITE}/vision-statement`,
		sections: ['ipc_vision']
	},
	{
		id: 'size',
		number: 12,
		name: 'T-Shirt Size',
		question: 'How long will it take to deliver?',
		description: 'The guesstimate of time needed to deliver the Information Product.',
		guide:
			'Only the data team should size an Information Product, typically after the workshop. The T-Shirt size is not an estimate, not a promise, and not a deadline. It is a relative best guess to help guide prioritisation. Value, from the Vision and Outcomes / Actions areas, should be the primary driver of what is delivered next.',
		example: 'L',
		readMoreUrl: `${SITE}/sizing`,
		sections: ['ipc_tshirt_size']
	}
];

/** "Step 3 - Personas" */
export function stepLabel(step: StepCanon): string {
	return `Step ${step.number} - ${step.name}`;
}
