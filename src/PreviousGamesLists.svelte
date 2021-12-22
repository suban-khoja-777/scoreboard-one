<script>
import Button from "./utility/Button.svelte";

export let games = [];
export let openGameDetail;
export let goToHomeScreen;
</script>

<main>
    <main class="row">
        <h2> Previous Games </h2>
    </main>

    <main class="row">
        <ul class="round-list-container">
            {#each games as game}        
                <Button text="Played on {game.date_time}" type="primary" onClick={ () => openGameDetail(game)} />
                <br/>
            {/each}
        </ul>
    </main>
    
    <main class="footer">
        <Button text="Previous" type="secondary" onClick={goToHomeScreen} />
    </main>
    
</main>

<style>

</style>
