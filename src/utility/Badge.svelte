<style>
    
    .success{
        background-color: #27c26c;
        color: var(--white-color);
        margin: 0 0.4em;
        padding: 0.15em;
        border-radius: 3px;
    }

    @keyframes fadeInFromNone {
        0% { opacity: 0; }
        20% { opacity: 0; }
        40% { opacity: 0.3; }
        60% { opacity: 0.5; }
        80% { opacity: 0.9; }
        100% { opacity: 1; }
        80% { opacity: 0.9; }
        60% { opacity: 0.5; }
        40% { opacity: 0.3; }
        20% { opacity: 0; }
    }

    .animation{
        animation: fadeInFromNone 1s infinite;
        animation-direction : alternate;
    }
    
</style>

<script>
    export let style;
    export let text;
    export let animation;
</script>

<main>
    <span class="{style} {animation?'animation':''}">{text}</span>
</main>