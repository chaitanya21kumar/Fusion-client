import { createSlice } from "@reduxjs/toolkit";

const moduleSlice = createSlice({
  name: "module",
  initialState: {
    current_module: "Home",
    active_tab: "Notifications",
    unreadCount: 0,
  },

  reducers: {
    setCurrentModule: (state, action) => {
      state.current_module = action.payload;
    },
    setActiveTab_: (state, action) => {
      state.active_tab = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
  },
});

export const {
  setCurrentModule,
  setActiveTab_,
  setUnreadCount,
  decrementUnreadCount,
  incrementUnreadCount,
} = moduleSlice.actions;
export default moduleSlice.reducer;
