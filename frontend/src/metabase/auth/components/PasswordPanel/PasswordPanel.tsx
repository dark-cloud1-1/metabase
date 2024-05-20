import { useCallback } from "react"; // 导入React钩子函数useCallback
import { t } from "ttag"; // 导入ttag用于国际化字符串

import { useDispatch, useSelector } from "metabase/lib/redux"; // 导入Redux钩子函数

import { login } from "../../actions"; // 导入登录action
import {
  getExternalAuthProviders,
  getHasSessionCookies,
  getIsLdapEnabled,
} from "../../selectors"; // 导入selector函数
import type { LoginData } from "../../types"; // 导入登录数据类型
import { AuthButton } from "../AuthButton"; // 导入身份验证按钮组件
import { LoginForm } from "../LoginForm"; // 导入登录表单组件

import { ActionList, ActionListItem } from "./PasswordPanel.styled"; // 导入密码面板样式组件

// 定义密码面板组件的属性类型
interface PasswordPanelProps {
  redirectUrl?: string; // 重定向URL
}

// 密码面板组件
export const PasswordPanel = ({ redirectUrl }: PasswordPanelProps) => {
  const providers = useSelector(getExternalAuthProviders); // 获取外部身份验证提供商
  const isLdapEnabled = useSelector(getIsLdapEnabled); // 获取LDAP是否启用的状态
  const hasSessionCookies = useSelector(getHasSessionCookies); // 获取是否存在会话cookies的状态
  const dispatch = useDispatch(); // 获取Redux的dispatch函数

  // 提交表单的回调函数
  const handleSubmit = useCallback(
    async (data: LoginData) => {
      await dispatch(login({ data, redirectUrl })).unwrap(); // 使用dispatch触发登录action，并传递登录数据和重定向URL
      // debugger;
    },
    [dispatch, redirectUrl], // 依赖项为dispatch和redirectUrl
  );

  return (
    <div>
      {/* 登录表单组件 */}
      <LoginForm
        isLdapEnabled={isLdapEnabled}
        hasSessionCookies={hasSessionCookies}
        onSubmit={handleSubmit}
      />
      {/* 身份验证相关操作列表 */}
      <ActionList>
        {/* 忘记密码按钮 */}
        <ActionListItem>
          <AuthButton link="/auth/forgot_password">
            {t`I seem to have forgotten my password`}
          </AuthButton>
        </ActionListItem>
        {/* 外部身份验证提供商按钮 */}
        {providers.map(provider => (
          <ActionListItem key={provider.name}>
            <provider.Button redirectUrl={redirectUrl} />
          </ActionListItem>
        ))}
      </ActionList>
    </div>
  );
};
