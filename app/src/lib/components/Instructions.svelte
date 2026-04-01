<div class="instructions">
	<h2>Information Product Canvas</h2>
	<p>Gather Information Product requirements using the Information Product Canvas pattern template. Define business questions, outcomes, personas, delivery types, core business events, feature stories, will/wont's and vision for each Information Product.</p>

	<div class="options">
		<section class="option-card">
			<h3>Quick Start: Explore the Example</h3>
			<p>See what a completed canvas looks like and start building your own.</p>
			<ol>
				<li>The app loads with an example Information Product — <strong>SaaS Revenue Metrics</strong>.</li>
				<li>Browse the canvas grid to see how sections are filled in: Personas (CFO, RevOps, CS Lead), Business Questions, Vision, Outcomes, Feature Stories, and Will/Won't.</li>
				<li>Open <strong>Claude Code</strong> in this project directory and ask questions like:</li>
			</ol>
			<ul class="examples">
				<li>"Who is the SaaS Revenue Metrics product built for?"</li>
				<li>"What decisions will this product help people make?"</li>
				<li>"How does the data get delivered and how fresh does it need to be?"</li>
				<li>"What business events drive the data in this product?"</li>
				<li>"What's been deliberately left out of scope and why?"</li>
				<li>"Are there any gaps in this canvas I should think about?"</li>
			</ul>
		</section>

		<section class="option-card">
			<h3>Build Your Own Information Product Canvas</h3>
			<p>Create a new canvas, fill in the sections, then use Claude to review and improve it.</p>
			<ol>
				<li>Click <strong>New Canvas</strong> in the toolbar to create a blank model.</li>
				<li>Type a name in each section's input field and press Enter to add items.</li>
				<li>Double-click any item to rename it inline.</li>
				<li>Fill in all sections: Name, Product Owner, T-Shirt Size, Personas, Business Questions, Outcomes/Actions, Vision, Delivery Types, Data Sync, Core Business Events, Feature Stories, and Will/Won't.</li>
				<li>Click <strong>Save</strong> to persist your canvas. Use <strong>Export JSON</strong> to download, or <strong>Export PPTX</strong> for a PowerPoint slide. Then ask Claude:</li>
			</ol>
			<ul class="examples">
				<li>"Walk me through my canvas — does the story hang together?"</li>
				<li>"Do my business questions align with what my personas actually need?"</li>
				<li>"Is my vision clear enough for someone new to understand the product?"</li>
				<li>"What's missing that I might not have thought of?"</li>
				<li>"Help me tighten up the will/won't — is the scope too broad?"</li>
				<li>"Can you suggest feature stories based on my business questions?"</li>
				<li>"Draft a concept model based on my canvas"</li>
				<li>"Suggest metrics and their definitions for this product"</li>
				<li>"What data domain would this product sit in?"</li>
				<li>"What alternative delivery types could work for this product?"</li>
				<li>"This feels too big — suggest a way to break it into smaller IPCs"</li>
			</ul>
		</section>

		<section class="option-card chat-card">
			<h3>No Claude Code? Use Claude Chat Instead</h3>
			<p>Export your canvas as JSON and upload it directly to <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a>.</p>
			<ol>
				<li>Build your canvas and click <strong>Export JSON</strong> to download.</li>
				<li>Open <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a> and start a new conversation.</li>
				<li>Attach the JSON file using the paperclip icon, then ask your questions.</li>
			</ol>
			<ul class="examples">
				<li>"Here's my Information Product Canvas — does it tell a coherent story?"</li>
				<li>"Who are the personas and do their needs match the business questions?"</li>
				<li>"What would you add or change to make this canvas stronger?"</li>
				<li>"Help me spot any gaps or contradictions"</li>
				<li>"Suggest metrics and definitions based on my business questions"</li>
				<li>"How could I break this into smaller, more focused Information Products?"</li>
			</ul>
		</section>

		<section class="option-card">
			<h3>Managing Your Canvases</h3>
			<p>Switch between models, import/export, and generate slides.</p>

			<h4>Saving &amp; Exporting</h4>
			<ul>
				<li><strong>Save</strong> &mdash; writes the canvas JSON to <code>data/</code> so Claude can access it directly.</li>
				<li><strong>Export JSON</strong> &mdash; downloads the canvas to your downloads folder to share or re-import later.</li>
				<li><strong>Export PPTX</strong> &mdash; generates a PowerPoint slide matching the ADG template, one slide per Information Product.</li>
				<li><strong>Import JSON</strong> &mdash; load a previously exported canvas. Supports both native IPC format and graph format with nodes and links (auto-detected).</li>
			</ul>

			<h4>Canvas Sections</h4>
			<ul>
				<li><strong>Name</strong> &mdash; the Information Product name and description.</li>
				<li><strong>Product Owner</strong> &mdash; who owns this product (single value).</li>
				<li><strong>T-Shirt Size</strong> &mdash; effort estimate (single value).</li>
				<li><strong>Personas</strong> &mdash; who consumes this product.</li>
				<li><strong>Business Questions</strong> &mdash; what questions does this product answer.</li>
				<li><strong>Outcomes/Actions</strong> &mdash; what actions or outcomes result from answering the questions.</li>
				<li><strong>Vision</strong> &mdash; vision statements for this product.</li>
				<li><strong>Delivery Types</strong> &mdash; how the product is delivered (e.g. Dashboard, Report, API).</li>
				<li><strong>Data Sync</strong> &mdash; how data is synchronised (e.g. Real-time, Hourly, Daily).</li>
				<li><strong>Core Business Events</strong> &mdash; what events trigger or feed the product.</li>
				<li><strong>Feature Stories</strong> &mdash; user stories in "As a... I want... so that..." format.</li>
				<li><strong>Will/Won't</strong> &mdash; explicit scope: what's in and what's out.</li>
			</ul>
		</section>

		<section class="option-card security-card">
			<h3>Security Notice</h3>
			<p><strong>This app is designed to run locally on your own machine.</strong> Do not expose it to the internet or deploy it on a public server. The Save feature writes files directly to your filesystem. There is no user authentication, so anyone who can reach the server can read and overwrite your data.</p>
			<p>If you need to share your work, use the <strong>Export</strong> buttons to download files and share them manually.</p>
		</section>

		<section class="option-card data-storage-card">
			<h3>Data Storage</h3>
			<p><strong>Save</strong> writes files to the <code>data/</code> folder as JSON. This only works in dev mode (<code>npm run dev</code>) where the server can write to disk. Claude can then read these files directly.</p>
			<p><strong>Export</strong> downloads files to your browser's downloads folder for sharing or backup.</p>
		</section>
	</div>

	<section class="footer-section">
		<p>Code: <strong>MIT</strong> · Docs: <strong>CC BY-SA 4.0</strong> by AgileDataGuides. Free to share and adapt for any purpose with attribution.</p>
	</section>
</div>

<style>
	.instructions {
		max-width: 900px;
		line-height: 1.6;
	}

	h2 {
		font-size: 1.25rem;
		margin-bottom: 0.25rem;
	}

	.instructions > p {
		font-size: 0.875rem;
		color: var(--color-text-muted, #64748b);
		margin-bottom: 1.25rem;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.option-card {
		padding: 1rem 1.25rem;
		background: var(--color-surface, #ffffff);
		border-radius: 8px;
		border: 1px solid var(--color-border, #e2e8f0);
	}

	.option-card h3 {
		font-size: 1rem;
		margin: 0 0 0.375rem 0;
		padding: 0;
		border: none;
	}

	.option-card > p {
		font-size: 0.8125rem;
		color: var(--color-text-muted, #64748b);
		margin-bottom: 0.625rem;
	}

	.chat-card {
		background: #f8f6ff;
		border-color: #d4c8f0;
	}

	.chat-card a {
		color: var(--color-primary, #2563eb);
		text-decoration: underline;
	}

	.security-card {
		background: #fff8f0;
		border-color: #e8c090;
	}

	.data-storage-card {
		background: #f5f5f5;
		border-color: #ddd;
	}

	h4 {
		font-size: 0.875rem;
		margin-top: 0.875rem;
		margin-bottom: 0.375rem;
	}

	ol, ul {
		font-size: 0.8125rem;
		margin: 0 0 0.5rem 0;
		padding-left: 1.25rem;
	}

	li {
		margin-bottom: 0.25rem;
	}

	.examples {
		list-style: none;
		padding-left: 0.5rem;
		margin-top: 0.375rem;
	}

	.examples li {
		font-size: 0.8125rem;
		color: var(--color-text-muted, #64748b);
	}

	.examples li::before {
		content: '\203A  ';
		color: var(--color-primary, #2563eb);
		font-weight: 600;
	}

	code {
		background: white;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		font-size: 0.8125rem;
		border: 1px solid var(--color-border, #e2e8f0);
	}

	.footer-section {
		margin-top: 1.25rem;
	}

	.footer-section p {
		font-size: 0.75rem;
		color: var(--color-text-muted, #64748b);
	}
</style>
