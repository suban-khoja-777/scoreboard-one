const API = {
    endpoint : 'https://scoreboard1-ed8d.restdb.io/rest/game',
    analytics_endpoint : 'https://scoreboard-v1-developer-edition.ap27.force.com/api/services/apexrest/analytics'
};

const headers = {
    "Content-Type" : "application/json",
    "x-apikey" : "61c981ae9b75bf12abba3c32"
}

export const createGame = (currentGame) => {
    return fetch(API.endpoint,{
        method : 'POST',
        headers,
        body : JSON.stringify(currentGame)
    })
    .then(res => res.json())
}

export const getGame = (sharableGameId) => {
    return fetch(API.endpoint+'/'+sharableGameId,{
        method : 'GET',
        headers
    })
    .then(res => res.json())
}

export const updateGame = (generatedGameId,currentGame) => {
    fetch(API.endpoint+'/'+generatedGameId,{
        method : 'PATCH',
        headers,
        body : JSON.stringify(currentGame)
    });
}

export const newGame = (data) => {
    fetch(API.analytics_endpoint,{
        method : 'POST',
        headers,
        body : JSON.stringify({data})
    });
}
