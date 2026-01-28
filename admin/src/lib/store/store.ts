import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import tableReducer from './features/tableSlice';
import categoryReducer from './features/categorySlice'; // New
import menuReducer from './features/menuSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tables: tableReducer,
    categories: categoryReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;