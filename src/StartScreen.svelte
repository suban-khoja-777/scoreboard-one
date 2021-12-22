<script>
    import Button from "./utility/Button.svelte";

    export let onNewGame;
    export let showPreviousGames;
    export let showHistory = false;
    export let clearGameHistory;
</script>
<main>
  

    <div class="illustration">
        <img class="card spade" src="resource/home.png" alt="home"/>
    </div>
    
    <main class="row">
        <!--<Button onClick={onClear} text="Clear Data" type="secondary" />-->
        {#if showHistory}
            <Button onClick={showPreviousGames} text="History" type="secondary" />
        {/if}
        <Button onClick={onNewGame} text="New Game" type="primary" />
    </main>

     <main class="row">
        {#if showHistory}
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
