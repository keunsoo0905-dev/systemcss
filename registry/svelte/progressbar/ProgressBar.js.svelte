<script>
  /** @type {{ value?: number, min?: number, max?: number, state?: "normal" | "paused" | "error", animate?: boolean, marquee?: boolean, class?: string }} */
  let {
    value = 0,
    min = 0,
    max = 100,
    state = "normal",
    animate = false,
    marquee = false,
    class: className,
  } = $props();

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
/* registry/css/progressbar.css — 7.css progressbar 원본 */
[role=progressbar] {
  background: radial-gradient(circle at 0 50%, #0000001f 10px, transparent 30px),
    radial-gradient(circle at 100% 50%, #0000001f 10px, transparent 30px),
    linear-gradient(180deg, #f3f3f3af, #fcfcfcaf 3px, #dbdbdbaf 6px, #cacacaaf 0, #d5d5d5af),
    #ddd;
  border: 1px solid #8e8f8f;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px #f3f3f388, 0 0 0 1px #eaeaea88;
  height: 15px;
  margin: 2px 0;
  overflow: hidden;
}

[role=progressbar] > div {
  background-color: #0bd82c;
  background-image: linear-gradient(180deg, #f3f3f3af, #fcfcfcaf 3px, #dbdbdbaf 6px, transparent 0),
    radial-gradient(circle at 0 50%, #0000002f 10px, transparent 30px),
    radial-gradient(circle at 100% 50%, #0000002f 10px, transparent 30px),
    linear-gradient(180deg, transparent 65%, #ffffff55),
    linear-gradient(180deg, transparent 6px, #cacaca33 0, #d5d5d533);
  box-shadow: inset 0 0 0 1px #ffffff1f;
  height: 100%;
  overflow: hidden;
}

[role=progressbar].paused > div {
  background-color: #e6df1b;
}

[role=progressbar].error > div {
  background-color: #ef0000;
}

[role=progressbar].animate > div:before,
[role=progressbar].marquee:before {
  animation: progressbar 3s linear infinite;
  background: linear-gradient(90deg, transparent, #ffffff80, transparent 40%);
  content: "";
  display: block;
  height: 100%;
}

@keyframes progressbar {
  0% {
    transform: translateX(-40%);
  }
  60% {
    transform: translateX(100%);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
