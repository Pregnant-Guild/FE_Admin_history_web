import { UserData } from '@/interface/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    data: UserData | null;
    isAuthenticated: boolean;
}
const initialState: UserState = {
    data: null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserData>) => {
            state.data = action.payload;
            state.isAuthenticated = true;
        },
        clearUserData: (state) => {
            state.data = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;