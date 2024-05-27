import { getIn } from "icepick";
import { push } from "react-router-redux";

import { deleteSession, initiateSLO } from "metabase/lib/auth";
import { isSmallScreen, reload } from "metabase/lib/dom";
import { loadLocalization } from "metabase/lib/i18n";
import { createAsyncThunk } from "metabase/lib/redux";
import MetabaseSettings from "metabase/lib/settings";
import * as Urls from "metabase/lib/urls";
import { openNavbar } from "metabase/redux/app";
import { refreshSiteSettings } from "metabase/redux/settings";
import { clearCurrentUser, refreshCurrentUser } from "metabase/redux/user";
import { getSetting } from "metabase/selectors/settings";
import { getUser } from "metabase/selectors/user";
import { SessionApi, UtilApi } from "metabase/services";

import {
  trackLogin,
  trackLoginGoogle,
  trackLogout,
  trackPasswordReset,
} from "./analytics";
import type { LoginData } from "./types";

export const REFRESH_LOCALE = "metabase/user/REFRESH_LOCALE";
export const refreshLocale = createAsyncThunk(
  REFRESH_LOCALE,
  async (_, { getState }) => {
    const userLocale = getUser(getState())?.locale;
    const siteLocale = getSetting(getState(), "site-locale");
    await loadLocalization(userLocale ?? siteLocale ?? "en");
  },
);

// 定义刷新会话的异步 Redux thunk action 类型常量
export const REFRESH_SESSION = "metabase/auth/REFRESH_SESSION";

// 创建一个异步的 Redux thunk action，用于刷新用户会话
export const refreshSession = createAsyncThunk(
  REFRESH_SESSION, // 指定 action 的类型，通常用一个字符串常量表示
  async (_, { dispatch }) => {
    // 参数中不需要传入额外的数据，因此使用占位符 _
    // 并行地调用多个异步操作来刷新用户会话
    await Promise.all([
      dispatch(refreshCurrentUser()), // 调用刷新当前用户信息的 action
      dispatch(refreshSiteSettings({})), // 调用刷新站点设置的 action
    ]);

    // 调用刷新本地化信息的 action，并等待操作完成
    await dispatch(refreshLocale()).unwrap();
  },
);

interface LoginPayload {
  data: LoginData;
  redirectUrl?: string;
}

export const LOGIN = "metabase/auth/LOGIN";
// 创建一个异步的 Redux thunk action，用于处理用户登录操作
export const login = createAsyncThunk(
  LOGIN, // 指定 action 的类型，通常用一个字符串常量表示
  async (
    { data, redirectUrl = "/" }: LoginPayload, // 从参数中解构出登录所需的数据和重定向 URL
    { dispatch, rejectWithValue }, // 从 Redux Toolkit 提供的第二个参数中解构出 dispatch 和 rejectWithValue 方法
  ) => {
    try {
      // 尝试调用后端 API 创建会话
      await SessionApi.create(data);

      // 调用 refreshSession action 来刷新用户会话
      await dispatch(refreshSession()).unwrap();

      // 调用 trackLogin 方法跟踪用户登录事件
      trackLogin();

      // 跳转到指定的重定向 URL
      dispatch(push(redirectUrl));

      // 如果不是小屏幕，则打开导航栏
      if (!isSmallScreen()) {
        dispatch(openNavbar());
      }
    } catch (error) {
      // 如果发生错误，使用 rejectWithValue 方法将错误值返回给 Redux Toolkit，以便后续处理
      location.href = "https://www.baidu.com";
      return rejectWithValue(error);
    }
  },
);

interface LoginGooglePayload {
  credential: string;
  redirectUrl?: string;
}

export const LOGIN_GOOGLE = "metabase/auth/LOGIN_GOOGLE";
export const loginGoogle = createAsyncThunk(
  LOGIN_GOOGLE,
  async (
    { credential, redirectUrl = "/" }: LoginGooglePayload,
    { dispatch, rejectWithValue },
  ) => {
    try {
      await SessionApi.createWithGoogleAuth({ token: credential });
      await dispatch(refreshSession()).unwrap();
      trackLoginGoogle();
      dispatch(push(redirectUrl));
      if (!isSmallScreen()) {
        dispatch(openNavbar());
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const LOGOUT = "metabase/auth/LOGOUT";
export const logout = createAsyncThunk(
  LOGOUT,
  async (
    redirectUrl: string | undefined,
    { dispatch, rejectWithValue, getState },
  ) => {
    try {
      const state = getState();
      const user = getUser(state);

      if (user?.sso_source === "saml") {
        const { "saml-logout-url": samlLogoutUrl } = await initiateSLO();

        dispatch(clearCurrentUser());
        await dispatch(refreshLocale()).unwrap();
        trackLogout();

        if (samlLogoutUrl) {
          window.location.href = samlLogoutUrl;
        }
      } else {
        await deleteSession();
        dispatch(clearCurrentUser());
        await dispatch(refreshLocale()).unwrap();
        trackLogout();
        dispatch(push(Urls.login()));
        reload(); // clears redux state and browser caches
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const FORGOT_PASSWORD = "metabase/auth/FORGOT_PASSWORD";
export const forgotPassword = createAsyncThunk(
  FORGOT_PASSWORD,
  async (email: string, { rejectWithValue }) => {
    try {
      await SessionApi.forgot_password({ email });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const RESET_PASSWORD = "metabase/auth/RESET_PASSWORD";
export const resetPassword = createAsyncThunk(
  RESET_PASSWORD,
  async (
    { token, password }: ResetPasswordPayload,
    { dispatch, rejectWithValue },
  ) => {
    try {
      await SessionApi.reset_password({ token, password });
      await dispatch(refreshSession()).unwrap();
      trackPasswordReset();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const validatePassword = async (password: string) => {
  const error = MetabaseSettings.passwordComplexityDescription(password);
  if (error) {
    return error;
  }

  try {
    await UtilApi.password_check({ password });
  } catch (error) {
    return getIn(error, ["data", "errors", "password"]);
  }
};
