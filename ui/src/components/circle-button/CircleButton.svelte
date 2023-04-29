<script lang="ts">
  import { mdiTextBox } from "@mdi/js";
  import { mdiImageOutline } from "@mdi/js";
  import { mdiVolumeHigh } from '@mdi/js';
  import { mdiFormatText } from '@mdi/js';

  export let icon: "text" | "image" | "audio" | "document";
  export let size: string;
  export let style = "";
  export let classname = "";

  let circleButton: HTMLElement;

  import { onMount } from "svelte";

  onMount(() => {
    circleButton.style.width = size;
    circleButton.style.height = size;
  });

  function getIcon() {
    switch (icon) {
      case "text":
        return mdiFormatText;
      case "image":
        return mdiImageOutline;
      case "audio":
        return mdiVolumeHigh;
      case "document":
        return mdiTextBox;
      default:
        return "";
    }
  }
</script>

<div class="circle-button {classname}" bind:this={circleButton} {style}>
  <svg class="profile-icon" viewBox="0 0 24 24">
    <path d={getIcon()} />
  </svg>
</div>

<style>
  .circle-button {
    position: absolute;
    border-radius: 50%;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
