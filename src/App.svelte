<script>
	import { onMount } from 'svelte';

	import {generatePlayerId , generateGameId , getDateTimeAsString,generateRoundId} from './utility/Utility';
	import {createGame,getGame,updateGame} from './utility/api';
	import Popup from './utility/Popup.svelte';
	import Icon from "./utility/Icon.svelte";
	import Badge from './utility/Badge.svelte';

	import StartScreen from './StartScreen.svelte';
	import AddPlayerScreen from './AddPlayerScreen.svelte';
	import GameStatsScreen from './GameStatsScreen.svelte';
	import RoundsDetailScreen from './RoundsDetailScreen.svelte';
	import PreviousGamesLists from './PreviousGamesLists.svelte';

	const APP_NAME = 'SCOREBOARD_APP';

	let state = {
		"players":[],
		"games":[]
	}; 

	const POPUP = {
		NEW_PLAYER : false,
		EXISTING_PLAYER  : false,
		ADD_ROUND : false,
		ROUND_DETAIL_POPUP : false,
		SHARE_ROUND_POPUP : false,
		SPINNER_POPUP : false
	}

	const SCREEN = {
		HOME_SCREEN : false,
		ADD_PLAYER_SCREEN : false,
		GAME_STAT_SCREEN : false,
		ROUND_DETAIL_SCREEN : false,
		PREVIOUS_GAMES_SCREEN : false
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

	let newRound = {
		id : "",
		scores : {

		}
	};

	let selectedRoundForDetail = {};
	let backupOfExistingRound = {};
	let roundSaveLabel = "Edit";
	let isEditingRound = false;
	let isLinkGenerated = false;
	let generatedLink;
	let sharableGameId;
	let isValidGameId;
	let generatedGameId;
	let RTEventHandler;
	onMount(() => {

		RTEventHandler = new restdb("61c981ae9b75bf12abba3c32", {realtime: true});
		
		RTEventHandler.on('NEW_ROUND', function(err, game) {
			if(err) return;
			if(game && game.data && sharableGameId){
				currentGame = game.data;
				currentGame = currentGame;
			}
    	});
		
		sharableGameId = getGameIdFromURL();

		if(sharableGameId){
			if(isValidGameId){
				togglePopup('SPINNER_POPUP');
				getGame(sharableGameId)
				.then(res =>{
					if(res._id){
						togglePopup('SPINNER_POPUP');
						currentGame = res;
						currentGame.state = 'READONLY';
						navigateTo('GAME_STAT_SCREEN');
					}else{
						togglePopup('SPINNER_POPUP');
						isValidGameId = false;
						navigateTo('HOME_SCREEN');
					}
				})
				.catch(err => console.log('## err',err))
			}else{
				navigateTo('HOME_SCREEN');
			}
		}else{
			//check if game is already shared.
			const shareLink = window.localStorage.getItem('SCOREBOARD_APP_SHARE_LINK');
			//@@TODO Validate Link based on Regex.
			if(shareLink){
				isLinkGenerated = true;
				//@@TODO USE URL Object for getting parameter
				generatedGameId = shareLink.searchParams.get('game');
				generatedLink = shareLink;
			}
			

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
		}
	});

	const getGameIdFromURL = () => {
		let _url = new URL(window.location.href);
		if(_url.searchParams.get('game')){
			const gameId = _url.searchParams.get('game');
			isValidGameId = true;
			return gameId;
		}else{
			isValidGameId = false;
			return null;
		}
	}

	const startNewGame = () => {
        let new_game = {
			id : generateGameId(),
			date_time : getDateTimeAsString(),
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
				delete newPlayer.gamesWon;
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

	const goToGameScreen = (changeState) => {
		if(changeState)
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

		if(Object.keys(newRound.scores).length !== currentGame.players.length){
			alert('Please add score for All Players');
			return;
		}
		newRound.id = generateRoundId();
		for(let player_id in newRound.scores){
			if(Number(newRound.scores[player_id]) == 0){
				currentGame.players.filter(player => player.id === player_id)[0].gamesWon += 1;	
			}
			currentGame.players.filter(player => player.id === player_id)[0].score += Number(newRound.scores[player_id]);
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
		
		if(generatedGameId){
			updateGame(generatedGameId,currentGame);
			RTEventHandler.publish("NEW_ROUND", currentGame, function(error, result){
				console.log('error ',error);
				console.log('result ',result);
    		})
		}
		updateDb();
		togglePopup('ADD_ROUND');
	}

	const cancelNewRound = () => {
		if(Object.keys(newRound.scores).length){
			const sure = window.confirm('Are you sure?');
			if(!sure) return;
		}
		newRound = {
			id : "",
			scores : {}
		};
		togglePopup('ADD_ROUND');
	}

	const updatePlayerScore = (event) => {
		// const wonPlayerList = Object.values(newRound).filter(round => round == 0);
		// if(wonPlayerList.length && Number(event.target.value) === 0){
		// 	alert("Only 1 player can have 0 points");
		// 	event.target.value = null;
		// }
		if(event.target.value || !isNaN(event.target.value)){
			newRound.scores[event.target.name] = Number(event.target.value);
		}else{
			delete newRound.scores[event.target.name];
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
		isLinkGenerated = false;
		generatedLink = null;
		generatedGameId = null;
	}

	const goToRoundDetailScreen = (index) => {
		navigateTo('ROUND_DETAIL_SCREEN');
	}

	const openRoundDetail = (round) => {
		selectedRoundForDetail = JSON.parse(JSON.stringify(round));
		togglePopup('ROUND_DETAIL_POPUP');
	}

	const closeRoundDetail = () =>{
		isEditingRound = false;
		roundSaveLabel = "Edit";
		backupOfExistingRound = {};
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

	const showPreviousGames = () => {
		navigateTo('PREVIOUS_GAMES_SCREEN');
	}

	const goToHomeScreen = () => {
		navigateTo('HOME_SCREEN');
	}

	const openGameDetail = (gameToOpen) => {
		currentGame = gameToOpen;
		navigateTo('GAME_STAT_SCREEN');
		console.log('gameToOpen',gameToOpen);
	}

	const editExistingRound = () => {
		if(isEditingRound){
			if(Object.keys(selectedRoundForDetail.scores).length !== currentGame.players.length){
				alert('Please add score for All Players');
				return;
			}
			
			let round_index = currentGame.rounds.findIndex(round => round.id === selectedRoundForDetail.id);
			console.log('round_index',round_index);

			let previous_won_player_id;
			let new_won_player_id;

			for(let player_id in selectedRoundForDetail.scores){
				if(Number(selectedRoundForDetail.scores[player_id]) == 0){
					new_won_player_id = player_id;
				}
			}

			for(let player_id in backupOfExistingRound.scores){
				if(Number(backupOfExistingRound.scores[player_id]) == 0){
					previous_won_player_id = player_id;
				}
			}

			if(new_won_player_id != previous_won_player_id){
				currentGame.players.filter(player => player.id === new_won_player_id)[0].gamesWon += 1;
				currentGame.players.filter(player => player.id === previous_won_player_id)[0].gamesWon -= 1;	
			}

			for(let player_id in selectedRoundForDetail.scores){
				currentGame.players.filter(player => player.id === player_id)[0].score += Number(selectedRoundForDetail.scores[player_id]);
				currentGame.players.filter(player => player.id === player_id)[0].score -= Number(backupOfExistingRound.scores[player_id]);
			}

			currentGame.players.sort(function(first,second){ 
				if(first.score !== second.score){
					return first.score - second.score;
				}else{
					return second.gamesWon - first.gamesWon;
				}
			});
			
			currentGame.rounds = [...currentGame.rounds.slice(0,round_index), selectedRoundForDetail ,...currentGame.rounds.slice(round_index + 1,currentGame.rounds.length)];

			currentGame = currentGame;
			state.games = state.games.filter(game => game.id !== currentGame.id);
			state.games.push(currentGame);
			
			updateDb();
			togglePopup('ROUND_DETAIL_POPUP');
			isEditingRound = false;
			roundSaveLabel = "Edit";
		}else{
			backupOfExistingRound = JSON.parse(JSON.stringify(selectedRoundForDetail));
			isEditingRound = true;
			roundSaveLabel = "Save";
		}
	}

	const clearGameHistory = () => {
		const sure = window.confirm('Are you sure?');
		if(!sure) return;
		state.games = [];
		updateDb();
	}

	const updatePlayerExistingScore = (event) => {
		if(event.target.value || !isNaN(event.target.value)){
			selectedRoundForDetail.scores[event.target.name] = Number(event.target.value);
		}else{
			delete selectedRoundForDetail.scores[event.target.name];
		}
	}

	const shareGame = () => {
		togglePopup('SHARE_ROUND_POPUP');
		if(isLinkGenerated) return;
		createGame(currentGame)
		.then(res => {
			if(res._id){
				isLinkGenerated = true;
				generatedGameId = res._id;
				let _url = new URL(window.location.href);
				_url.searchParams.set('game',generatedGameId);
				generatedLink = _url.href;
				window.localStorage.setItem('SCOREBOARD_APP_SHARE_LINK',generatedLink);
			}
		})
		.catch(err => console.log('## err',err))
	}

	const cancelShare = () => {
		togglePopup('SHARE_ROUND_POPUP');
	}

	const copyShareLink = () => {
		try{
			navigator.clipboard.writeText(generatedLink)
			.then(() => {
				alert("copied!"); // success 
				cancelShare();
			})
			.catch((err) => {
				alert("err",err); // error
			});
		}catch(exp){
			alert(exp);
		}
	} 

	const gotoHome =() => {
		const _url = new URL(window.location.href);
		window.location.href = _url.origin;
	}

</script>

<main>
	
	<header>Scoreboard </header>

	{#if SCREEN.HOME_SCREEN }
		<StartScreen onNewGame={startNewGame} {showPreviousGames} showHistory={state.games.length} {clearGameHistory} {gotoHome} {sharableGameId}  {isValidGameId}/>
	{/if}

	{#if SCREEN.ADD_PLAYER_SCREEN }
		<AddPlayerScreen players={currentGame.players} {addNewPLayer} {getExistingPlayers} {deleteNewPlayer} {goToGameScreen}/>
	{/if}

	{#if SCREEN.GAME_STAT_SCREEN}
		<GameStatsScreen game={currentGame} {goToAddPlayerScreen} {showPreviousGames} {addNewRound} {completeGame} {goToRoundDetailScreen} {shareGame} {gotoHome}/>
	{/if}

	{#if SCREEN.ROUND_DETAIL_SCREEN}
		<RoundsDetailScreen rounds={currentGame.rounds} players={currentGame.players} {goToGameScreen} {openRoundDetail}/>
	{/if}

	{#if SCREEN.PREVIOUS_GAMES_SCREEN}
		<PreviousGamesLists games={state.games} {goToHomeScreen} {openGameDetail}/>
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
		<Popup header="Round Detail" onSave={editExistingRound} onCancel={closeRoundDetail} showCancel cancelLabel="Close" saveLabel={roundSaveLabel} showSave={currentGame.state === 'In Progress'}>
			<ul class="add-round">
				{#each currentGame.players as player}
					<li class="round-player" id={player.id}>
						
						<div>
							<label for={player.id}>{player.name}</label>
						</div>
						<main class="row">
							{#if isEditingRound}
								<div class="row row-end">
									<input type="number" value={selectedRoundForDetail.scores[player.id]} name={player.id} on:input={updatePlayerExistingScore}>
								</div>
								{:else}
								{#if selectedRoundForDetail.scores[player.id] == 0}
									<Badge text="winner" style="success" animation/>
								{/if}
								<Icon text={selectedRoundForDetail.scores[player.id]} />
							{/if}
						</main>
							
					</li>
				{/each}
			</ul>	
		</Popup>
	{/if}

	{#if POPUP.SHARE_ROUND_POPUP}
		<Popup showCancel showSave={isLinkGenerated && navigator.clipboard} saveLabel="Copy" onCancel={cancelShare} onSave={copyShareLink}>
			<div class="flex space-between m-b-10">
				{#if !isLinkGenerated}
					<div class="flex align-center">
						<div class="inline-block">
							<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
								<circle cx="50" cy="50" fill="none" stroke="#42434d" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
									<animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
								</circle>
							</svg>
						</div>
						<div class="inline-block">
							Generating Link...
						</div>
					</div>
					{:else}
					<div class="flex align-center">
						<div class="inline-block">
							<a href="/#" class="link">{generatedLink}</a>
						</div>
					</div>
					
				{/if}
			</div>
		</Popup>
	{/if}

	{#if POPUP.SPINNER_POPUP}
		<Popup>
			<div class="flex align-center">
				<div class="inline-block m-r-5">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
						<circle cx="50" cy="50" fill="none" stroke="#42434d" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
							<animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
						</circle>
					</svg>
				</div>
				<div class="inline-block">
					Getting Game Details...
				</div>
			</div>
		</Popup>
	{/if}
</main>

<style>

</style>
