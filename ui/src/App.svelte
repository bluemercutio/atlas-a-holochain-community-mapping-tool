<script lang="ts">
  import AllTags from "./tags/tags/AllTags.svelte";
  import CreateTagItem from "./tags/tags/CreateTagItem.svelte";
  import { onMount, setContext } from "svelte";
  import type { ActionHash, AppAgentClient } from "@holochain/client";
  import { AppAgentWebsocket } from "@holochain/client";
  import "@material/mwc-circular-progress";

  import { clientContext } from "./contexts";
  import TopBar from "./components/TopBar.svelte";

  let client: AppAgentClient | undefined;
  let loading = true;
  let showCreateTagModal = false;

  $: client, loading;

  const openCreateTagModal = () => {
    showCreateTagModal = true;
  };

  const closeCreateTagModal = (e, force: boolean = false) => {
    const backdrop = document.querySelector(".backdrop");
    const closeButton = document.querySelector(".close-button");
    console.log(backdrop);
    if (e.target === backdrop || e.target === closeButton || force) {
      showCreateTagModal = false;
    }
  };

  onMount(async () => {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect("", "atlas");
    loading = false;
  });

  setContext(clientContext, {
    getClient: () => client,
  });
</script>

{#if showCreateTagModal}
  <CreateTagItem {closeCreateTagModal} />
{/if}

<main>
  {#if loading}
    <div
      style="display: flex; flex: 1; align-items: center; justify-content: center"
    >
      <mwc-circular-progress indeterminate />
    </div>
  {:else}
    <div id="content" style="display: flex; flex-direction: column; flex: 1;">
      <TopBar author={client.myPubKey}/>
      <AllTags author={client.myPubKey} />
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
