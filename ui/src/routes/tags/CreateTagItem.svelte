<script lang="ts">
  import GenericModal from "../../components/GenericModal.svelte";
  import type { AppAgentClient } from "@holochain/client";
  import type { TagItem } from "./types";
  import { closeMapModal } from "../../store/map/actions.mapState";
  import { closeCreateTagModal } from "../../store/create_tag/actions.create_tag";
  import type { Coordinates } from "../../store/map/type.mapState";
  import { createEventDispatcher } from 'svelte';

  export let defaultCoordinates: Coordinates;
  export let showCreateTagModal: boolean;
  const dispatch = createEventDispatcher();

  $: showCreateTagModal;

  const fields = [
    { label: "Name", required: true },
    { label: "Description", required: true },
    { label: "Latitude", required: true, value: defaultCoordinates.latitude },
    {
      label: "Longitude",
      required: true,
      value: defaultCoordinates.longitude,
    },
  ];


  function updateParent() {
    dispatch('child-update', showCreateTagModal);
  }

  function closeModal(e: Event) {
    e.preventDefault();
    console.log("Closing modal");
    closeCreateTagModal();
    updateParent()
  }
</script>

{#if showCreateTagModal}

{/if}
