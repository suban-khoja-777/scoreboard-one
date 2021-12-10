<script>
	import { onMount } from 'svelte';

	import {generatePlayerId , generateGameId} from './utility/Utility';

	import Popup from './utility/Popup.svelte';
	import Icon from "./utility/Icon.svelte";
	import Badge from './utility/Badge.svelte';

	import StartScreen from './StartScreen.svelte';
	import AddPlayerScreen from './AddPlayerScreen.svelte';
	import GameStatsScreen from './GameStatsScreen.svelte';
	import RoundsDetailScreen from './RoundsDetailScreen.svelte';

	const APP_NAME = 'SCOREBOARD_APP';

	let state = {
		"players":[],
		"games":[]
	}; 

	const POPUP = {
		NEW_PLAYER : false,
		EXISTING_PLAYER  : false,
		ADD_ROUND : false,
		ROUND_DETAIL_POPUP : false
	}

	const SCREEN = {
		HOME_SCREEN : false,
		ADD_PLAYER_SCREEN : false,
		GAME_STAT_SCREEN : false,
		ROUND_DETAIL_SCREEN : false
	}

	let newPlayer = {
		id : '',
		name : '',
		score : 0,
		gamesWon : 0,
		saveForFuture : false
	}

	let existingPlayerSelected = [];

	let currentGame;

	let newRound = {};

	let selectedRoundForDetail = {};

	onMount(() => {
		
		if(!getDb()){
			updateDb();
		}
		
		state = getDb();

		const InProgressGame = state.games.filter(game => game.state === 'In Progress' || game.state === 'Preparing');
		if(InProgressGame.length){
			currentGame = InProgressGame[0];
			if(currentGame.state === 'In Progress'){
				navigateTo('GAME_STAT_SCREEN');
			}else{
				navigateTo('ADD_PLAYER_SCREEN');
			}
		}else{
			navigateTo('HOME_SCREEN');
		}

		//clearAppData();
		// state.games = [];
		// window.localStorage.setItem(APP_NAME,JSON.stringify(state));

	});

	const startNewGame = () => {
        let new_game = {
			id : generateGameId(),
            state : 'Preparing',
            players : [],
            rounds : []
        }
		currentGame = new_game;
        state.games.push(new_game);
		state = state;
        updateDb();
		navigateTo('ADD_PLAYER_SCREEN');		
    }

	const addNewPLayer = () => {
		togglePopup('NEW_PLAYER');
	}

	const getExistingPlayers = () => {
		togglePopup('EXISTING_PLAYER');
	}

	const deleteNewPlayer = (id) => {
		currentGame.players = currentGame.players.filter(player => player.id !== id);
		currentGame = currentGame;
		state.games = state.games.filter(game => game.id !== currentGame.id);
		state.games.push(currentGame);
		updateDb();
	}

	const deleteExistingPlayer = (id) => {
		state.players = state.players.filter(player => player.id !== id);
		state = state;
		updateDb();
	}

	const newPlayerSave = () => {

		if(newPlayer.name){
			newPlayer.id = generatePlayerId();
			if(newPlayer.saveForFuture){
				delete newPlayer.score;
				state.players.push(JSON.parse(JSON.stringify(newPlayer)));
			}
			delete newPlayer.saveForFuture;
			newPlayer.score = 0;
			newPlayer.gamesWon = 0;
			currentGame.players.push(JSON.parse(JSON.stringify(newPlayer)));
			currentGame = currentGame;
			state.games = state.games.filter(game => game.id !== currentGame.id);
			state.games.push(currentGame);
			state = state;
			updateDb();
			togglePopup('NEW_PLAYER');
			newPlayer = {
				id : '',
				name : '',
				score : 0,
				gamesWon : 0,
				saveForFuture : false
			}
		}
	}

	const newPlayerCancel = () => {
		togglePopup('NEW_PLAYER');
	}

	const existingPlayerCancel = () => {
		existingPlayerSelected = [];
		togglePopup('EXISTING_PLAYER');
	}

	const existingPlayerSave = () => {
		for(let existingPlayer of existingPlayerSelected){
			let player = JSON.parse(JSON.stringify(existingPlayer));
			player.score = 0;
			player.gamesWon = 0;
			currentGame.players.push(player);
		}
		existingPlayerSelected = [];
		currentGame = currentGame;
		state.games = state.games.filter(game => game.id !== currentGame.id);
		state.games.push(currentGame);
		state = state;
		updateDb();
		togglePopup('EXISTING_PLAYER');
	}

	const selectExistingPlayer = (event) => {
		if(event.target.checked){
			existingPlayerSelected.push(state.players.filter(player => player.id === event.target.name)[0]);
		}else{
			existingPlayerSelected = existingPlayerSelected.filter(player => player.id !== event.target.name);
		}
		existingPlayerSelected = existingPlayerSelected;
	}

	const goToGameScreen = () => {
		currentGame.state = 'In Progress';
		currentGame = currentGame;
		state.games = state.games.filter(game => game.id !== currentGame.id);
		state.games.push(currentGame);
		state = state;
		updateDb();
		
		navigateTo('GAME_STAT_SCREEN');
	}

	const goToAddPlayerScreen = () => {
		currentGame.state = 'Preparing';
		currentGame = currentGame;
		state.games = state.games.filter(game => game.id !== currentGame.id);
		state.games.push(currentGame);
		state = state;
		updateDb();
		navigateTo('ADD_PLAYER_SCREEN');
	}

	const addNewRound = () => {
		togglePopup('ADD_ROUND');
	}

	const saveNewRound = () => {

		if(Object.keys(newRound).length !== currentGame.players.length){
			alert('Please add score for All Players');
			return;
		}

		for(let player_id in newRound){
			if(Number(newRound[player_id]) == 0){
				currentGame.players.filter(player => player.id === player_id)[0].gamesWon += 1;	
			}
			currentGame.players.filter(player => player.id === player_id)[0].score += Number(newRound[player_id]);
		}

		currentGame.players.sort(function(first,second){ 
			if(first.score !== second.score){
				return first.score - second.score;
			}else{
				return second.gamesWon - first.gamesWon;
			}
		});
		
		currentGame.rounds.push(JSON.parse(JSON.stringify(newRound)));

		currentGame = currentGame;
		state.games = state.games.filter(game => game.id !== currentGame.id);
		state.games.push(currentGame);
		
		updateDb();
		togglePopup('ADD_ROUND');
	}

	const cancelNewRound = () => {
		if(Object.keys(newRound).length){
			const sure = window.confirm('Are you sure?');
			if(!sure) return;
		}
		newRound = {};
		togglePopup('ADD_ROUND');
	}

	const updatePlayerScore = (event) => {
		const wonPlayerList = Object.values(newRound).filter(round => round == 0);
		if(wonPlayerList.length && event.target.value == 0){
			alert("Only 1 player can have 0 points");
			event.target.value = null;
		}
		if(event.target.value || !isNaN(event.target.value)){
			newRound[event.target.name] = Number(event.target.value);
		}else{
			delete newRound[event.target.name];
		}
			
	}

	const completeGame = () => {
		const sure = window.confirm('Are you sure?');
		if(!sure) return;
		currentGame.state = 'Completed';
		currentGame = currentGame;
		state.games = state.games.filter(game => game.id !== currentGame.id);
		state.games.push(currentGame);
		
		updateDb();
		navigateTo('HOME_SCREEN');
	}

	const goToRoundDetailScreen = (index) => {
		navigateTo('ROUND_DETAIL_SCREEN');
	}

	const openRoundDetail = (round) => {
		selectedRoundForDetail = JSON.parse(JSON.stringify(round));
		togglePopup('ROUND_DETAIL_POPUP');
	}

	const closeRoundDetail = () =>{
		togglePopup('ROUND_DETAIL_POPUP',false);
	}

	const togglePopup = (popupToToggle) => {
		POPUP[popupToToggle] = !POPUP[popupToToggle];
	}

	const navigateTo = (screenToNavigate) => {
		for(let screen in SCREEN){
			SCREEN[screen] = false;
		}
		SCREEN[screenToNavigate] = true;
	}

	const getDb = () => {
		if(!window.localStorage.getItem(APP_NAME)) return;
		return JSON.parse(window.localStorage.getItem(APP_NAME)); 
	}

	const updateDb = () => {
		window.localStorage.setItem(APP_NAME,JSON.stringify(state));	
	}
	
	const clearAppData = () => {
		window.localStorage.removeItem(APP_NAME);
		state = {
			"players":[],
			"games":[]
		};
	}

</script>

<main>
	<header>Scoreboard</header>
	
	{#if SCREEN.HOME_SCREEN }
		<StartScreen onNewGame={startNewGame} onClear={clearAppData}/>
	{/if}

	{#if SCREEN.ADD_PLAYER_SCREEN }
		<AddPlayerScreen players={currentGame.players} {addNewPLayer} {getExistingPlayers} {deleteNewPlayer} {goToGameScreen}/>
	{/if}

	{#if SCREEN.GAME_STAT_SCREEN}
		<GameStatsScreen rounds={currentGame.rounds} players={currentGame.players} {goToAddPlayerScreen} {addNewRound} {completeGame} {goToRoundDetailScreen}/>
	{/if}

	{#if SCREEN.ROUND_DETAIL_SCREEN}
		<RoundsDetailScreen rounds={currentGame.rounds} players={currentGame.players} {goToGameScreen} {openRoundDetail}/>
	{/if}

	{#if POPUP.NEW_PLAYER}
		<Popup header="Add New Player" onSave={newPlayerSave} onCancel={newPlayerCancel} saveDisabled={!newPlayer.name} showSave showCancel>
			<!-- <input type="text" class="m-b-10" placeholder="Player Name" on:input={handleNewPlayerName}> -->
			<input type="text" class="m-b-10" placeholder="Player Name" bind:value={newPlayer.name} />
			<main class="m-b-10 row">
				<input id="futuresave" type="checkbox" name="futuresave" bind:checked={newPlayer.saveForFuture} >
				<!-- <input id="futuresave" type="checkbox" name="futuresave" on:input={handleNewPlayerForFuture}> -->
				<label for="futuresave">Save for future use</label>
			</main>
		</Popup>
	{/if}

	{#if POPUP.EXISTING_PLAYER}
		<Popup header="Select Existing Players" onSave={existingPlayerSave} onCancel={existingPlayerCancel} saveDisabled={!existingPlayerSelected.length} showSave showCancel>
			
				{#if state.players.length}
					<ul class="existing-player">
						{#each state.players as player}
							{#if currentGame.players.findIndex(plr => plr.id === player.id) === -1}
								<li id={player.id}>
									<label>
										<input type="checkbox" class="m-r-5" name={player.id} id={player.id} on:input={selectExistingPlayer}>
										{player.name}
									</label> 
									<div class="actions">
										<Icon text="X" OnClick={() => deleteExistingPlayer(player.id)} />
									</div>
								</li>
							{/if}
						{/each}
					</ul>	
				{:else}
					<p>No Existing Players Found.</p>
				{/if}

		</Popup>
	{/if}
	
	{#if POPUP.ADD_ROUND}
		<Popup header="Add Score" onSave={saveNewRound} onCancel={cancelNewRound} showSave showCancel>
			<ul class="add-round">
				{#each currentGame.players as player}
					<li class="round-player" id={player.id}>
						<label for={player.id}>{player.name}</label>
						<input type="number" name={player.id} on:input={updatePlayerScore}> 
					</li>
				{/each}
			</ul>	
		</Popup>
	{/if}
	
	{#if POPUP.ROUND_DETAIL_POPUP}
		<Popup header="Round Detail" onCancel={closeRoundDetail} showCancel cancelLabel="Close">
			<ul class="add-round">
				{#each currentGame.players as player , index}
					<li class="round-player" id={player.id}>
						<div>
							<span class="index"> {index+1}. </span> 
							<label for={player.id}>{player.name}</label>
						</div>
						<main class="row">
							{#if selectedRoundForDetail[player.id] == 0}
								<Badge text="winner" style="success" animation/>
							{/if}
							<Icon text={selectedRoundForDetail[player.id]} />
						</main>
					</li>
				{/each}
			</ul>	
		</Popup>
	{/if}
	
	

	
</main>

<style>

</style>
