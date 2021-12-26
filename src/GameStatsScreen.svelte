<script>

import Button from "./utility/Button.svelte";
import Icon from "./utility/Icon.svelte";

export let game;
export let goToAddPlayerScreen;
export let addNewRound;
export let completeGame;
export let goToRoundDetailScreen;
export let showPreviousGames;
export let shareGame;
</script>

<main>
    <main class="row">
        <h2> Game Stats </h2>
    </main>
    {#if game.rounds.length && game.state === 'In Progress'}
        <main class="row">
            <a href="/#" class="link" on:click={shareGame}>Share</a>
        </main>
    {/if}
    <main class="row">
        <Icon text={"Players : "+game.players.length} type="primary"/>
        <Icon text={"Rounds : "+game.rounds.length} type="tertiary" />
    </main>
    
    <br/>
    <ul>
        {#each game.players as player}
            <li>
                <div>
                    <main class="row">    
                        <Icon type="secondary" text={player.gamesWon} />
                        <span>
                            {player.name}
                        </span>
                    </main> 
                </div>
                <div class="score">
                    <Icon text={player.score} />
                </div>
            </li>
        {/each}
    </ul>
    
    <main class="footer">
        {#if game.state === 'In Progress' || game.state === 'Preparing'}
            <Button text="Add Round" type="primary" onClick={addNewRound} />
            {#if game.rounds.length}
                <Button text="Complete" type="primary" onClick={completeGame} />
                <Button text="Show Rounds" type="secondary" onClick={goToRoundDetailScreen} />
                {:else}       
                    <Button text="Previous" type="secondary" onClick={goToAddPlayerScreen} />
            {/if}
            {:else}
                <Button text="Previous" type="secondary" onClick={showPreviousGames} />
                <Button text="Show Rounds" type="secondary" onClick={goToRoundDetailScreen} />
        {/if}
    </main>
    
</main>

<style>
    
</style>
