<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    state?: "normal" | "paused" | "error";
    animate?: boolean;
    marquee?: boolean;
    class?: string;
  }

  let {
    value = 0,
    min = 0,
    max = 100,
    state = "normal",
    animate = false,
    marquee = false,
    class: className,
  }: Props = $props();

  let clampedValue = $derived(Math.min(Math.max(value, min), max));
  let percentage = $derived(((clampedValue - min) / (max - min)) * 100);
</script>

<div
  role="progressbar"
  aria-valuenow={marquee ? undefined : clampedValue}
  aria-valuemin={min}
  aria-valuemax={max}
  class={[
    "progressbar",
    state === "paused" && "paused",
    state === "error" && "error",
    animate && "animate",
    marquee && "marquee",
    className,
  ].filter(Boolean).join(" ")}
>
  {#if !marquee}
    <div style="width: {percentage}%"></div>
  {/if}
</div>

<style>
  /* inject-css.ts 가 registry/css/progressbar.css 내용을 여기에 자동 주입 */
</style>
