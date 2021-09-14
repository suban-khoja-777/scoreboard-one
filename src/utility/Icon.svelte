<style>

    button{
        border: none;
        outline: none;
        margin: 0 0.4em;
        color: var(--white-color);
    }

    button.icon{
        background: var(--primary-color);
    }
    
</style>


<script>
    export let text;
    export let OnClick;
</script>

<main>
    <button on:click={OnClick} class="icon">{text}</button>
</main>