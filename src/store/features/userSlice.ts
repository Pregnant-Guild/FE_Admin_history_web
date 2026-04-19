import { UserData } from '@/interface/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getUserFromCookie } from '@/lib/cookieStorage';

const getStoredApplication = () => {
    if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem('selected_application');
        return saved ? JSON.parse(saved) : null;
    }
    return null;
};

const getStoredUserData = (): UserData | null => {
    if (typeof window === "undefined") {
        return null;
    }
    return getUserFromCookie();
};

interface UserState {
    data: UserData | null;
    isAuthenticated: boolean;
    selectedApplication: any | null; 
}

const storedUserData = getStoredUserData();

const initialState: UserState = {
    data: storedUserData,
    isAuthenticated: Boolean(storedUserData),
    selectedApplication: getStoredApplication(),
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
        setSelectedApplication: (state, action: PayloadAction<any>) => {
            state.selectedApplication = action.payload;
            if (typeof window !== "undefined") {
                sessionStorage.setItem('selected_application', JSON.stringify(action.payload));
            }
        },
        clearSelectedApplication: (state) => {
            state.selectedApplication = null;
            if (typeof window !== "undefined") {
                sessionStorage.removeItem('selected_application');
            }
        },
    },
});

export const { setUserData, clearUserData, setSelectedApplication, clearSelectedApplication } = userSlice.actions;
export default userSlice.reducer;