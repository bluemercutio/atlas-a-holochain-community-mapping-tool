<script lang="ts">
  import CreateProfile from "../routes/profiles/CreateProfile.svelte";
  import CreateTagItem from "../routes/profiles/CreateProfile.svelte";
  import { mdiAccountCircle } from "@mdi/js";
  import type { Profile } from "../routes/profiles/types";

  let showCreateProfileModal = false;

  export let profile: Profile;
  export let owner: Uint8Array;


  const handleModalUpdate = (event) =>{
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

  {#if profile}
    <div class="profile-container">
      <svg class="profile-icon" viewBox="0 0 24 24">
        <path d={mdiAccountCircle} />
      </svg>
      <span class="separator">|</span>
      <p class="username">{profile.user_name}</p>
    </div>
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

  .profile-container {
    display: flex;
    align-items: center;
  }

  .profile-icon {
    width: 24px;
    height: 24px;
  }

  .separator {
    margin: 0 5px;
    color: rgba(0, 0, 0, 0.5);
  }

  .username {
    margin: 0;
  }
</style>
