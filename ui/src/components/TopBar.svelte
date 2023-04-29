<script lang="ts">
  import { closeMapModal, openMapModal } from "../store/map/actions.mapState";
  import type { Coordinates } from "../store/map/type.mapState";
  import {
    closeCreateTagModal,
    openCreateTagModal,
  } from "../store/create_tag/actions.create_tag";
  export let showMapModal: boolean;
  export let showCreateTagModal: boolean;
  export let defaultCoordinates: Coordinates;

  const toggleMapModal = () => {
    showMapModal ? closeMapModal() : openMapModal();
  };
  const toggleCreateTagModal = () => {
    showCreateTagModal
      ? closeCreateTagModal()
      : openCreateTagModal(defaultCoordinates);
  };

</script>

<div class="top-bar">
  <h3>ATLAS</h3>
  <div>
    <button on:click={() => toggleCreateTagModal()}>Create Tag</button>
    <button on:click={() => toggleMapModal()}>Map</button>
  </div>
</div>

<style>
  .top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
  font-size: 1.2rem;
  height: 60px;
  position: sticky; /* Keep this as 'sticky' */
  top: 0;
  /* left: 0; */ /* Remove this line */
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
}

  .top-bar button {
    padding: 8px 15px;
    background-color: #555;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    text-transform: uppercase;
    font-weight: bold;
  }
  .top-bar button:hover {
    background-color: #777;
  }
</style>
