import { createSlice } from "@reduxjs/toolkit";

interface CaughtTotalState {
    value: number;
}

const initialState: CaughtTotalState = {
    value: 0,
};

const caughtTotalSlice = createSlice({
    name: "caughtTotal",
    initialState,
    reducers: {
        increment(state) {
            state.value++;
        },
        decrement(state) {
            state.value--;
        },
        // boxTotal(state, action: PayloadAction<{start: number; end: number}>) {

        // },
    },
});

export const { increment, decrement } = caughtTotalSlice.actions;
export default caughtTotalSlice.reducer;
