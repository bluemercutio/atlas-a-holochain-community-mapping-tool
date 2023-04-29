<script lang="ts">
    import { onMount } from 'svelte';
    import CircleButton from '../circle-button/CircleButton.svelte';
  
    let container: HTMLElement;
  
    onMount(() => {
      container.style.display = 'none';
    });
  
    const  showMenu = () =>{
      container.style.display = 'block';
    }
  
    const  hideMenu = () =>{
      container.style.display = 'none';
    }
  </script>
  
  <style>
    .circle-menu-container {
      position: relative;
      width: 100px;
      height: 100px;
    }
  
    .circle {
      position: absolute;
      border-radius: 50%;
    }
  
    .main-circle {
      width: 100%;
      height: 100%;
      background-color: #f0f0f0;
    }
  
    .top-bar-element:hover ~ .circle-menu-container {
      display: block;
    }
  </style>
  
  <div class="top-bar-element" on:mouseover={showMenu} on:mouseleave={hideMenu}>
    Hover me
  </div>
  <div class="circle-menu-container" bind:this="{container}">
    <div class="circle main-circle"></div>
    <CircleButton
      classname="circle"
      icon="text"
      size="20%"
      style="top: 0; left: 40%;"
    />
    <CircleButton
      classname="circle"
      icon="image"
      size="20%"
      style="top: 40%; left: 80%;"
    />
    <CircleButton
      classname="circle"
      icon="audio"
      size="20%"
      style="top: 40%; left: 0;"
    />
    <CircleButton
      classname="circle"
      icon="document"
      size="20%"
      style="top: 80%; left: 40%;"
    />
  </div>
  