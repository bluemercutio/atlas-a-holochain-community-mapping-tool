<script lang="ts">
  import { beforeUpdate, onMount } from "svelte";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import { getContext } from "svelte";
  import { decode } from "@msgpack/msgpack";
  import type {
    AppAgentClient,
    Record,
    AgentPubKey,
    ActionHash,
  } from "@holochain/client";
  import { clientContext } from "../contexts";
  import type { TagItem, TagsSignal } from "../routes/tags/types";
  import "@material/mwc-button";
  import "@material/mwc-snackbar";
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-textfield";
  import "@material/mwc-circular-progress";
  import "@material/mwc-textarea";
  import type { Coordinates } from "../store/types";
  import { mapState } from "../store/store";
  export let author: AgentPubKey;
  export let defaultCoordinates: Coordinates;

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  let hashes: Array<ActionHash> | undefined;
  let loading = true;
  let error: any = undefined;
  let leafletMap: L.Map;

  let record: Record | undefined;
  let tagItem: TagItem | undefined;

  let editing = false;

  $: editing,
    error,
    loading,
    record,
    tagItem,
    hashes,
    tags,
    error,
    leafletMap,
    defaultCoordinates;

  let tags: TagItem[] = [];

  // mapState.subscribe((value) => {
  //   coordinates = value.coordinates;
  // });

  async function fetchTagItems() {
    try {
      const records = await client.callZome({
        cap_secret: null,
        role_name: "tags",
        zome_name: "tags",
        fn_name: "get_all_tags",
        payload: author,
      });
      hashes = records.map((r) => r.signed_action.hashed.hash);

      hashes.map(async (hash) => {
        let item = await fetchTagItem(hash);
        console.log("ITEM", item);
        tags = [...tags, item];
      });
    } catch (e) {
      error = e;
    }
    loading = false;
  }
  async function fetchTagItem(tagItemHash) {
    try {
      record = await client.callZome({
        cap_secret: null,
        role_name: "tags",
        zome_name: "tags",
        fn_name: "get_tag_item",
        payload: tagItemHash,
      });

      if (record) {
        tagItem = decode((record.entry as any).Present.entry) as TagItem;
        console.log("marker", {
          lat_str: tagItem.latitude,
          lat_int: parseFloat(tagItem.latitude),
          lon_str: tagItem.latitude,
          lon_int: parseFloat(tagItem.longitude),
        });
        console.log("TAG ITEM: ", tagItem);
        console.log(
          "TESTING",
          parseFloat(tagItem.latitude),
          parseFloat(tagItem.longitude)
        );

        L.marker([
          parseFloat(tagItem.latitude),
          parseFloat(tagItem.longitude),
        ]).addTo(leafletMap);

        return tagItem;
      }
    } catch (e) {
      error = e;
    }
  }

  onMount(async () => {
    await fetchTagItems();
    client.on("signal", (signal) => {
      if (signal.zome_name !== "tags") {
        return;
      }
      const payload = signal.payload as TagsSignal;
      if (payload.type !== "EntryCreated") {
        return;
      }
      if (payload.app_entry.type !== "TagItem") {
        return;
      }
      if (author.toString() !== client.myPubKey.toString()) {
        return;
      }
      hashes = [...hashes, payload.action.hashed.hash];
    });

    console.log("TAGS", tags);

    // Initialize the Leaflet.js map
    leafletMap = L.map("map").setView($mapState.coordinates, 16);

    // Add a tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Map data &copy; OpenStreetMap contributors",
    }).addTo(leafletMap);

    // Iterate over the response data and add a marker for each tag
  });

  $: if (leafletMap && $mapState.coordinates) {
    leafletMap.setView($mapState.coordinates, 16);
  }



</script>

{#if loading}
  <div
    style="display: flex; flex: 1; align-items: center; justify-content: center"
  >
    <mwc-circular-progress indeterminate />
  </div>
{:else if error}
  <span>Error fetching the tag items: {error.data.data}.</span>
{:else}
  <div id="map" style="height: 600px;" />
{/if}
