<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m["aboutTitle"]()}</title>
</svelte:head>

<div class="about-page">
	<div class="card">
		<h1>{m["aboutTitle"]()}</h1>

		<div class="features">
			<div class="feature">
				<h2>{m["aboutFeature1"]()}</h2>
				<p>{m["aboutFeature1Desc"]()}</p>
			</div>
			<div class="feature">
				<h2>{m["aboutFeature2"]()}</h2>
				<p>{m["aboutFeature2Desc"]()}</p>
			</div>
			<div class="feature">
				<h2>{m["aboutFeature3"]()}</h2>
				<p>{m["aboutFeature3Desc"]()}</p>
			</div>
		</div>

		<div class="links">
			<p>{m["aboutCredit"]()} (<a href="https://www.freepik.com" target="_blank" rel="noopener">Freepik</a>)</p>
			<p>{m["aboutRepo"]()}: <a href="https://github.com/cup113/full-clock" target="_blank" rel="noopener">github.com/cup113/full-clock</a></p>
			<p>{m["aboutFeedback"]()}: <a href="https://f.kdocs.cn/g/iuGauWIo/" target="_blank" rel="noopener">f.kdocs.cn/g/iuGauWIo/</a></p>
		</div>

		<a href="/" class="back-link">{m["backToHome"]()}</a>
	</div>
</div>

<style>
	.about-page {
		position: fixed;
		inset: 0;
		background: #004400;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: Arial, 等线, sans-serif;
		overflow-y: auto;
	}
	.card {
		max-width: 600px;
		padding: 40px 32px;
		text-align: center;
	}
	h1 {
		font-size: 28px;
		margin: 0 0 32px;
	}
	.features {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-bottom: 32px;
	}
	.feature h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}
	.feature p {
		font-size: 14px;
		opacity: 0.8;
		margin: 0;
		line-height: 1.6;
	}
	.links {
		font-size: 13px;
		opacity: 0.7;
		margin-bottom: 32px;
	}
	.links a {
		color: #88bbff;
		text-decoration: none;
	}
	.links a:hover {
		text-decoration: underline;
	}
	.back-link {
		display: inline-block;
		padding: 10px 32px;
		border: 1px solid rgba(255,255,255,0.3);
		border-radius: 8px;
		color: #fff;
		text-decoration: none;
		font-size: 15px;
		transition: background 0.2s;
	}
	.back-link:hover {
		background: rgba(255,255,255,0.1);
	}
</style>
