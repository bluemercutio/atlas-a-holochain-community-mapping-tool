<script lang="ts">
  import AllTags from "./routes/tags/AllTags.svelte";
  import { onMount, setContext } from "svelte";
  import type {  AppAgentClient } from "@holochain/client";
  import { AppAgentWebsocket } from "@holochain/client";
  import "@material/mwc-circular-progress";
  import Map from "./components/map/Map.svelte";
  import { clientContext } from "./contexts";
  import TopBar from "./components/TopBar.svelte";
  import Footer from "./components/Footer.svelte";
  import { createTagItem, getCurrentProfile } from "./client";
  import { mapState } from "./store/map";
  import type { Coordinates, DisplayMode } from "./store/map/type.mapState";
  import type { Profile } from "./routes/profiles/types";
  import { createTagState } from "./store/tag";
  import type { CreateTagState } from "./store/tag/type.createTag";
  import GenericModal from "./components/GenericModal.svelte";
  import { setClient } from "./store/client/actions.client";
  import { clientState } from "./store/client";
  import { getFieldsForCreateTag } from "./routes/tags/utils";
  import { closeCreateTagModal } from "./store/tag/actions.createTag";

  let client: AppAgentClient | undefined;
  let loading = true;
  let profile: Profile;
  let showMapModal: boolean;
  let showCreateTagModal: boolean;
  let createTagCoordinates: { latitude: number; longitude: number };
  let mapCoordinates: Coordinates;
  let displayMode: DisplayMode;
  let createTagDefaults: CreateTagState;

  $: client,
    loading,
    profile,
    showMapModal,
    showCreateTagModal,
    mapCoordinates,
    createTagDefaults,
    displayMode;

  onMount(async () => {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect("", "atlas");
    profile = await checkForProfile();
    setClient(client, profile);
    loading = false;
  });

  setContext(clientContext, {
    getClient: () => client,
  });

  const checkForProfile = async () => {
    const res = await getCurrentProfile(client.myPubKey, client);
    console.log("Profile: ", res);
    if (!(res instanceof Error)) {
      return res;
    }
    return null;
  };

  const closeModal = (e: Event) => {
    e.preventDefault();
    console.log("Closing create tag modal");
    closeCreateTagModal();
  };

  mapState.subscribe((value) => {
    showMapModal = value.showMapModal;
    mapCoordinates = value.coordinates;
    displayMode = value.display_mode;
    console.log("MAPSTATE Change: ", value);
  });

  createTagState.subscribe((value) => {
    showCreateTagModal = value.showCreateTagModal;
    createTagCoordinates = value.coordinates;
    console.log("Default Coordinates: ", createTagCoordinates);

    console.log("CREATETAGSTATE Change: ", value);
  });

  clientState.subscribe((value) => {
    client = value.client;
    profile = value.profile;
    console.log("CLIENTSTATE Change: ", value);
  });


</script>

<main>
  {#if loading}
    <div
      style="display: flex; flex: 1; align-items: center; justify-content: center"
    >
      <mwc-circular-progress indeterminate />
    </div>
  {:else}
    {#if showMapModal}
      <Map
        author={client.myPubKey}
        defaultCoordinates={mapCoordinates}
        {displayMode}
      />
    {/if}
    {#if showCreateTagModal}
      <GenericModal
        title="Create a Tag"
        fields={getFieldsForCreateTag(createTagCoordinates.latitude, createTagCoordinates.longitude)}
        createItemFunction={createTagItem}
        closeFunction={closeModal}
        itemType="TagItem"
      />
    {/if}

    <div id="content" style="display: flex; flex-direction: column; flex: 1;">
      <TopBar {showMapModal} {showCreateTagModal} defaultCoordinates={createTagCoordinates} />
      <AllTags author={client.myPubKey} />
      <Footer {profile} owner={client.myPubKey} />
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    /* max-width: 240px; */
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
