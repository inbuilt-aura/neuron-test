// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import type { ThunkAction, Action } from "@reduxjs/toolkit";
import authReducer, { type AuthState } from "./authSlice";
import profileReducer, { type ProfileState } from "./sales/profileSlice";
import websocketReducer, {
  type WebSocketSliceState,
} from "./websocket/websocketSlice";
import { apiSlice } from "./apiSlice";
import { salesApiSlice } from "./sales/salesApiSlice";
import { clientApiSlice } from "./client/clientApiSlice";
import { managerApiSlice } from "./manager/managerApiSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  websocket: websocketReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [salesApiSlice.reducerPath]: salesApiSlice.reducer,
  [clientApiSlice.reducerPath]: clientApiSlice.reducer,
  [managerApiSlice.reducerPath]: managerApiSlice.reducer, // Add this
});

interface PreloadedState {
  auth: AuthState;
  profile: ProfileState;
  websocket: WebSocketSliceState;
}

export type RootState = ReturnType<typeof rootReducer>;

const STATE_VERSION = 1;

const loadState = (): Partial<PreloadedState> | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const serializedAuthState = localStorage.getItem("authState");
    const serializedProfileState = localStorage.getItem("profileState");
    const serializedSocketState = localStorage.getItem("socketState");
    const stateVersion = localStorage.getItem("stateVersion");

    if (stateVersion !== STATE_VERSION.toString()) {
      console.warn("Stored state version mismatch. Clearing stored state.");
      localStorage.clear();
      return undefined;
    }

    return {
      auth: serializedAuthState
        ? (JSON.parse(serializedAuthState) as AuthState)
        : undefined,
      profile: serializedProfileState
        ? (JSON.parse(serializedProfileState) as ProfileState)
        : undefined,
      websocket: serializedSocketState
        ? (JSON.parse(serializedSocketState) as WebSocketSliceState)
        : undefined,
    };
  } catch (err) {
    console.error("Failed to load state:", err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(salesApiSlice.middleware)
      .concat(clientApiSlice.middleware)
      .concat(managerApiSlice.middleware),
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem("authState", JSON.stringify(state.auth));
    localStorage.setItem("profileState", JSON.stringify(state.profile));
    localStorage.setItem("socketState", JSON.stringify(state.websocket));
    localStorage.setItem("stateVersion", STATE_VERSION.toString());
  });
}

export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
