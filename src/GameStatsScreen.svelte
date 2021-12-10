<script>

import Button from "./utility/Button.svelte";
import Icon from "./utility/Icon.svelte";

export let players = [];
export let goToAddPlayerScreen;
export let rounds = [];
export let addNewRound;
export let completeGame;
export let goToRoundDetailScreen;
export let totalRounds = 0;
</script>


<main>
    <main class="row">
        <h2> Game Stats </h2>
    </main>

    <main class="row">
        {#if rounds.length}
            <Button text={"Players : "+players.length} type="primary"/>
            <Button text="Show Rounds" type="secondary" onClick={goToRoundDetailScreen} />
            <Button text={"Rounds : "+rounds.length} type="primary" />
            {#if totalRounds}
                <main>/</main>
                <Icon text={totalRounds} />    
            {/if}
        {/if}
    </main>
    <br/>
    <ul>
        {#each players as player , index}
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
        {#if !rounds.length}
            <Button text="Previous" type="secondary" onClick={goToAddPlayerScreen} />
            {:else}
            <Button text="Complete" type="primary" onClick={completeGame} />
        {/if}
        <Button text="Add Round" type="primary" onClick={addNewRound} /> 
    </main>
    
</main>

<style>
    
</style>
