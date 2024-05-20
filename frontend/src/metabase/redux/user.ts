import { createAction, createReducer } from "@reduxjs/toolkit";

import Users from "metabase/entities/users";
import { createAsyncThunk } from "metabase/lib/redux";
import { CLOSE_QB_NEWB_MODAL } from "metabase/query_builder/actions";
import { UserApi } from "metabase/services";
import type { User } from "metabase-types/api";

// 创建一个异步的 Redux thunk action，用于刷新当前用户信息
export const refreshCurrentUser = createAsyncThunk(
  "metabase/user/REFRESH_CURRENT_USER", // 指定 action 的类型，通常用一个字符串常量表示
  async (_, { fulfillWithValue }) => {
    // 参数中不需要传入额外的数据，因此使用占位符 _
    try {
      // 调用后端 API 获取当前用户信息
      return UserApi.current();
    } catch (e) {
      // 如果发生错误，使用 fulfillWithValue 方法返回一个带有 null 值的成功操作，以便后续处理
      return fulfillWithValue(null);
    }
  },
);

export const loadCurrentUser = createAsyncThunk(
  "metabase/user/LOAD_CURRENT_USER",
  async (_, { dispatch, getState }) => {
    if (!getState().currentUser) {
      await dispatch(refreshCurrentUser());
    }
  },
);

export const clearCurrentUser = createAction(
  "metabase/user/CLEAR_CURRENT_USER",
);

export const currentUser = createReducer<User | null>(null, builder => {
  builder
    .addCase(clearCurrentUser, () => null)
    .addCase(refreshCurrentUser.fulfilled, (state, action) => action.payload)
    .addCase(CLOSE_QB_NEWB_MODAL, state => {
      if (state) {
        state.is_qbnewb = false;
        return state;
      }
      return state;
    })
    .addCase(Users.actionTypes.UPDATE, (state, { payload }) => {
      const isCurrentUserUpdated = state?.id === payload.user.id;
      if (isCurrentUserUpdated) {
        return {
          ...state,
          ...payload.user,
        };
      }
      return state;
    });
});
