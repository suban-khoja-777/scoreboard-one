<script>
import Icon from "./utility/Icon.svelte";
import Button from "./utility/Button.svelte";

export let goToGameScreen;
export let rounds = [];
export let openRoundDetail;
export let totalRounds = 0;
</script>

<main>
    <main class="row">
        <h2> Round Details </h2>
        <Icon text={rounds.length} />
        {#if totalRounds}
            <main>/</main>
            <Icon text={totalRounds} />    
        {/if}
        
    </main>

    <main class="row">
        <ul class="round-list-container">
            {#each rounds as round , index}        
                <Button text="Round {index+1}" type="primary" onClick={ () => openRoundDetail(round)} />
                <br/>
            {/each}
        </ul>
    </main>
    
    <main class="footer">
        <Button text="Previous" type="secondary" onClick={goToGameScreen} />
    </main>
    
</main>

<style>

</style>
