<script>
import Button from "./utility/Button.svelte";
import Icon from "./utility/Icon.svelte";

export let getExistingPlayers;
export let addNewPLayer;
export let players = [];
export let deleteNewPlayer;
export let goToGameScreen;
</script>

<main>
    <main class="row">
        <h2> Add Players </h2>
    </main>
    <ul>
        {#each players as player , index}
            <li>
                <div>
                    <span class="index"> {index+1}. </span> 
                    <span>{player.name}</span> 
                </div>
                <div class="actions">
                    <Icon text="X" OnClick={() => deleteNewPlayer(player.id)} />
                </div>
            </li>
        {/each}
    </ul>
    <main class="row">
        <Button text="Existing" type="secondary" onClick={getExistingPlayers} /> 
        <Button text="New" type="primary" onClick={addNewPLayer} /> 
    </main>
    <main class="footer">
        <Button disabled={players.length < 3} text="Next" type="primary" onClick={ () => goToGameScreen(true)} /> 
    </main>
    
</main>

<style>

</style>
