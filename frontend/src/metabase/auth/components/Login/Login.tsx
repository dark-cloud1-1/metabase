import type { Location } from "history";
import { t } from "ttag";

import { useSelector } from "metabase/lib/redux";
import type { AuthProvider } from "metabase/plugins/types";
import { getApplicationName } from "metabase/selectors/whitelabel";
import { Box } from "metabase/ui";

import { getAuthProviders } from "../../selectors";
import { AuthLayout } from "../AuthLayout";

interface LoginQueryString {
  redirect?: string;
}

interface LoginQueryParams {
  provider?: string;
}

interface LoginProps {
  params?: LoginQueryParams;
  location?: Location<LoginQueryString>;
}

export const Login = ({ params, location }: LoginProps): JSX.Element => {
  // 从 Redux store 中获取认证提供程序的列表
  const providers = useSelector(getAuthProviders);
  // 根据传入的提供程序名称选择要显示的提供程序
  const selection = getSelectedProvider(providers, params?.provider);
  // 获取重定向 URL
  const redirectUrl = location?.query?.redirect;
  // 获取应用程序名称
  const applicationName = useSelector(getApplicationName);

  return (
    // 渲染登录页面布局
    <AuthLayout>
      {/* 显示应用程序名称 */}
      <Box
        role="heading"
        c="text-dark"
        fz="1.25rem"
        fw="bold"
        lh="1.5rem"
        ta="center"
      >
        {t`Sign in to ${applicationName}`}
      </Box>
      {/* 如果选择了提供程序，则渲染该提供程序的登录面板 */}
      {selection && selection.Panel && (
        <Box mt="2.5rem">
          {/* 渲染提供程序的登录面板，并传递重定向 URL */}
          <selection.Panel redirectUrl={redirectUrl} />
        </Box>
      )}
      {/* 如果没有选择提供程序，则渲染所有提供程序的登录按钮 */}
      {!selection && (
        <Box mt="3.5rem">
          {/* 渲染所有提供程序的登录按钮 */}
          {providers.map(provider => (
            <Box key={provider.name} mt="2rem" ta="center">
              {/* 渲染提供程序的登录按钮，并传递重定向 URL */}
              <provider.Button isCard={true} redirectUrl={redirectUrl} />
            </Box>
          ))}
        </Box>
      )}
    </AuthLayout>
  );
};

// 根据提供程序名称选择要显示的提供程序
const getSelectedProvider = (
  providers: AuthProvider[],
  providerName?: string,
): AuthProvider | undefined => {
  const provider =
    providers.length > 1
      ? providers.find(p => p.name === providerName)
      : providers[0];

  // 如果提供程序存在面板，则返回该提供程序
  return provider?.Panel ? provider : undefined;
};
