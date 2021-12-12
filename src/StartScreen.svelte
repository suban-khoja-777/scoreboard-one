<script>
    import Button from "./utility/Button.svelte";

    export let onNewGame;
    // export let onClear;
</script>
<main>
  

    <div class="illustration">
        <img class="card spade" src="resource/home.png" alt="home"/>
    </div>
    
    <main class="row">
        <!--<Button onClick={onClear} text="Clear Data" type="secondary" />-->
        <Button onClick={onNewGame} text="New Game" type="primary" />
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
        box-shadow: rgb(0 0 0 / 8%) 0px 0.7rem 2.5rem;
    }

</style>
