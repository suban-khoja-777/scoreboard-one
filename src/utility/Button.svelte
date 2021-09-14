<script>
    export let text = '';
    export let onClick;
    export let type;
    export let disabled;
</script>

<main>
    <button class={type} {disabled} on:click={onClick}>{text}</button>
</main>

<style>
    button{
        -webkit-box-align: baseline;
        align-items: baseline;
        border-width: 0px;
        border-radius: 3px;
        box-sizing: border-box;
        display: inline-flex;
        font-size: 1em;
        font-style: normal;
        font-family: inherit;
        font-weight: 500;
        max-width: 100%;
        position: relative;
        text-align: center;
        text-decoration: none;
        transition: background 0.1s ease-out 0s, box-shadow 0.15s cubic-bezier(0.47, 0.03, 0.49, 1.38) 0s;
        white-space: nowrap;
        cursor: pointer;
        line-height: 2.28571em;
        padding: 0px 10px;
        vertical-align: middle;
        width: auto;
        -webkit-box-pack: center;
        justify-content: center;
        outline: none;
        box-shadow: transparent 0px 0px 0px 2px;
        margin : 0 5px 0 0;
        color: var(--white-color);
    }

    button.primary{
        background-color: var(--primary-color);
        border: 2px solid var(--primary-color);
    }

    button.secondary{
        background: var(--black-color);
        border: 2px solid var(--black-color);
    }

    button:disabled{
        opacity: 0.25;
        cursor: none;
    }
   
</style>
