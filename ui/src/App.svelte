<script lang="ts">
  import AllTags from "./routes/tags/AllTags.svelte";
  import CreateTagItem from "./routes/tags/CreateTagItem.svelte";
  import { onMount, setContext } from "svelte";
  import type { ActionHash, AppAgentClient } from "@holochain/client";
  import { AppAgentWebsocket } from "@holochain/client";
  import "@material/mwc-circular-progress";
  import Map from "./components/map/Map.svelte";

  import { clientContext } from "./contexts";
  import TopBar from "./components/TopBar.svelte";
  import Footer from "./components/Footer.svelte";
  import { getCurrentProfile } from "./client";

  import { mapState } from "./store/store";
  import type { Coordinates, DisplayMode } from "./store/types";
  import type { Profile } from "./routes/profiles/types";



  let client: AppAgentClient | undefined;
  let loading = true;
  let profile : Profile
  let showMapModal: boolean;
  let coordinates: Coordinates;
  let displayMode: DisplayMode;


  $: client, loading, profile, showMapModal, coordinates, displayMode;

  onMount(async () => {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect("", "atlas");
    profile = await checkForProfile()
    loading = false;
  });

  setContext(clientContext, {
    getClient: () => client,
  });

  const checkForProfile = async () => {
    const res = await getCurrentProfile(client.myPubKey, client)
    console.log('Profile: ', res)
    if  (!(res instanceof Error)){
      return res
    } 
    return null
  }
  mapState.subscribe((value) => {
    showMapModal = value.showModal;
    coordinates = value.coordinates;
    displayMode = value.display_mode;
    console.log('Change: ', value)
  });

</script>

<main>
  {#if showMapModal}
  <!-- smits -34.264478833198794, 18.464277119200723 -->
  <!-- ct -33.94894079496996, 18.396664895093583 -->
  <Map author={client.myPubKey} defaultCoordinates={coordinates} {displayMode}/>
{/if}
  {#if loading}
    <div
      style="display: flex; flex: 1; align-items: center; justify-content: center"
    >
      <mwc-circular-progress indeterminate />
    </div>
  {:else}
    <div id="content" style="display: flex; flex-direction: column; flex: 1;">
      <TopBar author={client.myPubKey} />
      <AllTags author={client.myPubKey} />
      <Footer {profile} owner={client.myPubKey}  />
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
