const API = {
    endpoint : 'https://scoreboard-v1-developer-edition.ap27.force.com/api/services/apexrest/game/'
};

export const createGame = (currentGame) => {
    return fetch(API.endpoint,{
        method : 'POST',
        body : JSON.stringify({
            data : JSON.stringify(currentGame)})
    })
    .then(res => res.json())
}

export const getGame = (sharableGameId) => {
    return fetch(API.endpoint+sharableGameId,{
        method : 'GET'
    })
    .then(res => res.json())
}

export const updateGame = (generatedGameId,currentGame) => {
    fetch(API.endpoint,{
        method : 'PATCH',
        body : JSON.stringify({
            id : generatedGameId,
            data : JSON.stringify(currentGame)})
    });
}