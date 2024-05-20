import { createReducer } from "@reduxjs/toolkit";

import { createAsyncThunk } from "metabase/lib/redux";
import MetabaseSettings from "metabase/lib/settings";
import { SessionApi, SettingsApi } from "metabase/services";
import type { UserSettings } from "metabase-types/api";

// 定义刷新站点设置的异步 Redux thunk action 类型常量
export const REFRESH_SITE_SETTINGS = "metabase/settings/REFRESH_SITE_SETTINGS";

// 创建一个异步的 Redux thunk action，用于刷新站点设置
export const refreshSiteSettings = createAsyncThunk(
  REFRESH_SITE_SETTINGS, // 指定 action 的类型，通常用一个字符串常量表示
  async ({ locale }: { locale?: string } = {}) => {
    // 从参数中解构出可能的 locale 参数，默认为空字符串
    // 调用后端 API 获取站点设置信息
    const settings = await SessionApi.properties(null, {
      // 根据是否提供了 locale 参数设置请求头信息
      // eslint-disable-next-line no-literal-metabase-strings -- Not a user facing string
      headers: locale ? { "X-Metabase-Locale": locale } : {},
    });

    // 将获取到的站点设置信息存储到 MetabaseSettings 中
    MetabaseSettings.setAll(settings);

    // 将获取到的站点设置信息返回，以便在操作完成后进行后续处理
    return settings;
  },
);

interface UpdateUserSettingProps<K extends keyof UserSettings> {
  key: K;
  value: UserSettings[K];
  shouldRefresh?: boolean;
}

export const UPDATE_USER_SETTING = "metabase/settings/UPDATE_USER_SETTING";
export const updateUserSetting = createAsyncThunk(
  UPDATE_USER_SETTING,
  async (
    {
      key,
      value,
      shouldRefresh = true,
    }: UpdateUserSettingProps<keyof UserSettings>,
    { dispatch },
  ) => {
    const setting = {
      key,
      value,
    };
    try {
      await SettingsApi.put(setting);
      if (!shouldRefresh) {
        // When we aren't refreshing all the settings, we need to put the setting into the state
        return setting;
      }
    } catch (error) {
      console.error("error updating user setting", setting, error);
      throw error;
    } finally {
      if (shouldRefresh) {
        await dispatch(refreshSiteSettings({}));
      }
    }
  },
);

export const settings = createReducer(
  { values: window.MetabaseBootstrap || {}, loading: false },
  builder => {
    builder.addCase(refreshSiteSettings.pending, state => {
      state.loading = true;
    });
    builder.addCase(refreshSiteSettings.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.values = payload;
    });
    builder.addCase(refreshSiteSettings.rejected, state => {
      state.loading = false;
    });
    builder.addCase(updateUserSetting.fulfilled, (state, { payload }) => {
      if (payload) {
        state.values[payload.key] = payload.value;
      }
    });
  },
);
