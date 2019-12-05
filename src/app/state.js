export const state = {
    pokemon: [],
    numPokemon: ({ pokemon }) => {
        return pokemon.length
    },
    isLoading: true,
    numCaught: ({ pokemon }) => {
        return pokemon.filter(item => item.caught).length
    },
    numBoxes: ({ pokemon }) => {
        return pokemon.length % 30
    },
    boxes: ({ pokemon, numBoxes }) => {
        let boxes = [];
        for (let i = 0; i < numBoxes; i++) {
            boxes.push(pokemon.slice(i * 30, i * 30 + 30));
        }
        return boxes
    },
    percentComplete: ({ numPokemon, numCaught }) => {
        return ((numCaught / numPokemon) * 100).toFixed(2);
    }
}