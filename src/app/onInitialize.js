export const onInitialize = ({ state, actions, effects }, instance) => {
    state.pokemon = effects.storage.loadPokemon();

    instance.reaction(
        ({ pokemon }) => pokemon,
        pokemon => effects.storage.savePokemon(pokemon),
        { nested: true }
    )
}