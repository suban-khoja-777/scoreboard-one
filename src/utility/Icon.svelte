<style>

    button{
        border: none;
        outline: none;
        margin: 0 0.4em;
        color: var(--white-color);
    }

    button.primary{
        background: var(--primary-color);
    }

    button.secondary{
        background-color: #27c26c;
    }

    button.tertiary{
        background-color: var(--black-color);
    }
    
</style>


<script>
    export let text;
    export let OnClick;
    export let type = "primary";
</script>

<main>
    <button on:click={OnClick} class={type}>{text}</button>
</main>
