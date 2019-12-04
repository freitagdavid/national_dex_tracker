export const togglePokemon = ({ state }, pokeId) => {
    state.pokemon[pokeId].caught = !state.pokemon[pokeId].caught
}