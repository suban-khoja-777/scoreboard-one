<script>
    import { onMount } from "svelte";
    import Button from "./Button.svelte";

    export let header;
    export let onSave;
    export let onCancel;
    export let saveDisabled;
    export let saveLabel = 'Save';
    export let cancelLabel = 'Cancel';
    export let showSave;
    export let showCancel;

    onMount( () => {
        document.querySelector('dialog').showModal();
    })

</script>

<style>
    
    main.popup{
        display: flex;
        align-items: center;
        position: absolute;
        width: 100%;
        top: 0;
        bottom: 0;
        height: 100%;
    }

    dialog{
        border: none;
        box-shadow: 0 0.46875rem 2.1875rem rgb(31 10 6 / 3%), 0 0.9375rem 1.40625rem rgb(31 10 6 / 3%), 0 0.25rem 0.53125rem rgb(31 10 6 / 5%), 0 0.125rem 0.1875rem rgb(31 10 6 / 3%);
        width: 80%;
        border-radius: 5px;
    }

    main.body{
        display: flex;
        flex-direction: column;
    }

    dialog::backdrop {
        background: var(--bg-backdrop);
    }

</style>

<main class="popup">
    <dialog>
        <h2>{header}</h2>
        <main class="body">
            <slot />
        </main>
        <main class="row">
            {#if showSave}
                <Button disabled={saveDisabled} onClick={onSave} text={saveLabel} type="primary" />
            {/if}
            {#if showCancel}
                <Button onClick={onCancel} text={cancelLabel} type="secondary" />
            {/if}
        </main>
    </dialog>
</main>