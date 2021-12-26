<script>
    import Button from "./utility/Button.svelte";
    export let onNewGame;
    export let showPreviousGames;
    export let showHistory = false;
    export let clearGameHistory;
    export let sharableGameId;
    export let isValidGameId;
    export let gotoHome;
</script>
<main>

    <div class="illustration">
        {#if !sharableGameId}
            <img class="card spade" src="resource/home.png" alt="home"/>
            {:else if !isValidGameId}
            <img class="card spade" src="resource/not-found.png" alt="home"/>
            <h2>Game Not found!</h2>
        {/if}
    </div>
    
    <main class="row">
        {#if !sharableGameId}
            {#if showHistory}
                <Button onClick={showPreviousGames} text="History" type="secondary" />
            {/if}
            <Button onClick={onNewGame} text="New Game" type="primary" />
            {:else if !isValidGameId}
            <Button text="Home" type="secondary" onClick={gotoHome} />
        {/if}
    </main>

     <main class="row">
        {#if showHistory && !sharableGameId}
            <a href="/#" class="link" on:click={clearGameHistory}>Clear History</a>
        {/if}
    </main>
</main>

<style>

    .illustration{
        margin-top: 10%;
        margin-bottom: 5%;
        text-align: center;
        margin: 50px auto;
    }

    img.card{
        width: 200px;
    }

</style>
