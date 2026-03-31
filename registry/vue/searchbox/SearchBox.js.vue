<!-- registry/vue/searchbox/SearchBox.js.vue -->
<script setup>
import { ref } from "vue";

const props = defineProps({
  /** @type {string} */
  placeholder: { type: String, default: undefined },
  /** @type {boolean} */
  disabled: { type: Boolean, default: false },
});

const model = defineModel({ default: "" });
const emit = defineEmits(["search"]);

function handleInput(e) {
  model.value = e.target.value;
}

function handleSearch() {
  emit("search", model.value);
}

function handleKeyDown(e) {
  if (e.key === "Enter") {
    handleSearch();
  }
}
</script>

<template>
  <div class="win7-searchbox">
    <input
      type="search"
      role="searchbox"
      class="win7-searchbox-input"
      :value="model"
      @input="handleInput"
      @keydown="handleKeyDown"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
    />
    <button
      type="button"
      aria-label="search"
      class="win7-searchbox-button"
      @click="handleSearch"
      :disabled="props.disabled"
    ></button>
  </div>
</template>

<style scoped>
/* registry/css/searchbox.css */
/* 7.css 원본 기반 — [type=search] + .searchbox 스타일 */

.win7-searchbox {
  display: inline-block;
  position: relative;
}

.win7-searchbox-input {
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 2px;
  box-shadow: inset 1px 1px 0 #8e8f8f, inset -1px -1px 0 #ccc;
  box-sizing: border-box;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  height: 24px;
  min-width: 187px;
  padding: 3px 26px 3px 6px;
}

.win7-searchbox-input:placeholder-shown {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+");
  background-position: calc(100% - 8px);
  background-repeat: no-repeat;
  background-size: 14px;
}

.win7-searchbox-input:focus {
  outline: none;
}

.win7-searchbox-input::placeholder {
  font-style: italic;
}

.win7-searchbox-button {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+")
    no-repeat 50%,
    linear-gradient(#f2f2f2 45%, #ebebeb 0, #cfcfcf);
  background-size: 14px;
  border: 1px solid #8e8f8f;
  border-left: none;
  border-radius: 0;
  min-height: 22px;
  min-width: 26px;
  padding: 0;
  position: absolute;
  right: 1px;
  top: 1px;
  cursor: pointer;
}

.win7-searchbox-button:hover {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+")
    no-repeat 50%,
    linear-gradient(#eaf6fd 45%, #bee6fd 0, #a7d9f5);
  background-size: 14px;
  border-color: #3c7fb1;
}

.win7-searchbox-button:active {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+")
    no-repeat 50%,
    linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db);
  background-size: 14px;
  border-color: #6d91ab;
}
</style>
