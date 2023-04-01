<script lang="ts">
  import CreateProfile from "../routes/profiles/CreateProfile.svelte";
  import CreateTagItem from "../routes/profiles/CreateProfile.svelte";

  let showCreateProfileModal = false;

  export let hasProfile = false;
  export let owner: Uint8Array;

  function createProfile() {
    // code to create a profile
  }

  function handleModalUpdate(event) {
    showCreateProfileModal = event.detail;
  }

  const openCreateTagModal = () => {
    showCreateProfileModal = true;
  };
  const closeCreateProfileModal = (e, force: boolean = false) => {
    const backdrop = document.querySelector(".backdrop");
    const closeButton = document.querySelector(".close-button");
    console.log(backdrop);
    if (e.target === backdrop || e.target === closeButton || force) {
      showCreateProfileModal = false;
    }
  };
</script>

<footer>
  {#if showCreateProfileModal}
    <CreateProfile
      on:child-update={handleModalUpdate}
      {owner}
      showModal={showCreateProfileModal}
    />
  {/if}

  {#if hasProfile}
    <img src="profile-icon.png" alt="Profile Icon" />
  {:else}
    <button on:click={openCreateTagModal}>Create Profile</button>
  {/if}
</footer>

<style>
  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  }

  button {
    background-color: #1b1b1b;
    color: #fff;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  img {
    width: 30px;
    height: 30px;
  }
</style>
