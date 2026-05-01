<script lang="ts">
	import { prefs, save, type Preferences } from '../preferences.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, setLocale } from '$lib/paraglide/runtime.js';
	import { syncTime, applySync, removeSync, getSyncErrorMargin, isSyncApplied } from '../time.svelte';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let draft = $state<Preferences>({ ...prefs });
	let syncStatus = $state<'idle' | 'computing' | 'done'>('idle');
	let syncMargin = $state(0);

	const secondStyleLabels: Record<string, () => string> = {
		'fullscreen-bar': m["secondStyle_fullscreenBar"],
		'top-bar': m["secondStyle_topBar"],
		'digital': m["secondStyle_digital"],
		'off': m["secondStyle_off"],
	};

	$effect(() => {
		if (open) {
			draft = { ...prefs };
			syncStatus = 'idle';
		}
	});

	function handleSave() {
		Object.assign(prefs, draft);
		save(prefs);
		onClose();
	}

	async function handleSync() {
		syncStatus = 'computing';
		try {
			const result = await syncTime();
			applySync(result);
			syncMargin = result.errorMargin;
			syncStatus = 'done';
		} catch {
			syncStatus = 'idle';
		}
	}

	function handleRemoveSync() {
		removeSync();
		syncStatus = 'idle';
	}

	function handleLangChange(lang: 'en' | 'zh') {
		setLocale(lang);
		draft = { ...draft };
	}
</script>

{#if open}
	<div class="overlay" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" tabindex="-1">
		<div class="panel" onclick={(e) => e.stopPropagation()} role="presentation">
			<div class="panel-header">
				<h2>{m.settings()}</h2>
				<button class="close-btn" onclick={onClose} aria-label={m.close()}>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<div class="panel-body">
				<!-- Seconds Display -->
				<section>
					<h3>{m["secondStyle"]()}</h3>
					<div class="radio-group">
						{#each ['fullscreen-bar', 'top-bar', 'digital', 'off'] as val (val)}
							<label class="radio-label">
								<input type="radio" name="secondStyle" value={val} bind:group={draft.secondStyle} />
								<span>{secondStyleLabels[val]()}</span>
							</label>
						{/each}
					</div>
				</section>

				<!-- Title Style -->
				<section>
					<h3>{m["titleStyle"]()}</h3>
					<div class="radio-group">
						<label class="radio-label">
							<input type="radio" name="titleStyle" value="date" bind:group={draft.titleStyle} />
							<span>{m["titleStyle_date"]()}</span>
						</label>
						<label class="radio-label">
							<input type="radio" name="titleStyle" value="custom" bind:group={draft.titleStyle} />
							<span>{m["titleStyle_custom"]()}</span>
						</label>
						<label class="radio-label">
							<input type="radio" name="titleStyle" value="off" bind:group={draft.titleStyle} />
							<span>{m["titleStyle_off"]()}</span>
						</label>
					</div>
					{#if draft.titleStyle === 'custom'}
						<input class="text-input" type="text" bind:value={draft.titleCustomized} placeholder={m["titleCustomized"]()} />
					{/if}
				</section>

				<!-- Colors -->
				<section>
					<h3>{m.colors()}</h3>
					<div class="color-group">
						<label class="color-label">
							<span>{m.background()}</span>
							<input type="color" bind:value={draft.background} />
						</label>
						<label class="color-label">
							<span>{m.foreground()}</span>
							<input type="color" bind:value={draft.foreground} />
						</label>
						<label class="color-label">
							<span>{m["colorProgress"]()}</span>
							<input type="color" bind:value={draft.colorProgress} />
						</label>
					</div>
				</section>

				<!-- Font -->
				<section>
					<h3>{m["fontFamily"]()}</h3>
					<p class="hint">{m["fontFamilyHint"]()}</p>
					<input class="text-input" type="text" bind:value={draft.fontFamily} />
				</section>

				<!-- Time Sync -->
				<section>
					<h3>{m["timeSync"]()}</h3>
					<p class="hint">{m["timeSyncDesc"]()}</p>
					{#if syncStatus === 'idle'}
						{#if isSyncApplied()}
							<p class="sync-info">{m["timeSyncError"]()}: ±{getSyncErrorMargin().toFixed(0)}ms</p>
							<button class="btn" onclick={handleRemoveSync}>{m["timeSyncRemove"]()}</button>
						{:else}
							<button class="btn" onclick={handleSync}>{m["timeSyncApply"]()}</button>
						{/if}
					{:else if syncStatus === 'computing'}
						<p>{m["timeSyncComputing"]()}</p>
					{:else if syncStatus === 'done'}
						<p class="sync-info">{m["timeSyncDone"]()} ({m["timeSyncError"]()}: ±{syncMargin.toFixed(0)}ms)</p>
						<button class="btn" onclick={handleRemoveSync}>{m["timeSyncRemove"]()}</button>
					{/if}
				</section>

				<!-- Language -->
				<section>
					<h3>{m.language()}</h3>
					<div class="radio-group">
						<label class="radio-label">
							<input type="radio" name="lang" value="zh" checked={getLocale() === 'zh'} onchange={() => handleLangChange('zh')} />
							<span>中文</span>
						</label>
						<label class="radio-label">
							<input type="radio" name="lang" value="en" checked={getLocale() === 'en'} onchange={() => handleLangChange('en')} />
							<span>English</span>
						</label>
					</div>
				</section>
			</div>

			<div class="panel-footer">
				<button class="btn primary" onclick={handleSave}>{m.save()}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}
	.panel {
		background: #1a1a2e;
		color: #eee;
		border-radius: 12px;
		width: 90%;
		max-width: 500px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #333;
	}
	.panel-header h2 {
		margin: 0;
		font-size: 18px;
	}
	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #aaa;
		padding: 4px;
	}
	.close-btn:hover { color: #fff; }
	.panel-body {
		padding: 16px 20px;
		overflow-y: auto;
		flex: 1;
	}
	section {
		margin-bottom: 20px;
	}
	section h3 {
		font-size: 14px;
		margin: 0 0 8px;
		opacity: 0.8;
	}
	.hint {
		font-size: 12px;
		opacity: 0.5;
		margin: 0 0 8px;
	}
	.radio-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.radio-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		cursor: pointer;
	}
	.text-input {
		width: 100%;
		padding: 8px 10px;
		border: 1px solid #444;
		border-radius: 6px;
		background: #222;
		color: #eee;
		font-size: 13px;
		margin-top: 8px;
		box-sizing: border-box;
	}
	.color-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.color-label {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
	}
	.color-label input[type="color"] {
		width: 40px;
		height: 30px;
		border: none;
		padding: 0;
		cursor: pointer;
		background: none;
	}
	.sync-info {
		font-size: 12px;
		opacity: 0.7;
		margin: 0 0 8px;
	}
	.panel-footer {
		padding: 12px 20px;
		border-top: 1px solid #333;
		display: flex;
		justify-content: flex-end;
	}
	.btn {
		padding: 8px 20px;
		border: 1px solid #555;
		border-radius: 6px;
		background: #333;
		color: #eee;
		cursor: pointer;
		font-size: 13px;
	}
	.btn:hover { background: #444; }
	.btn.primary {
		background: #0066cc;
		border-color: #0066cc;
	}
	.btn.primary:hover { background: #0052a3; }
</style>
