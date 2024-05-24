import SliderCaptcha from "rc-slider-captcha"; // 导入验证码
import { useMemo, useRef, useState } from "react"; // 导入React钩子函数useMemo
import { t } from "ttag"; // 导入ttag用于国际化字符串
import * as Yup from "yup"; // 导入Yup用于表单验证

import FormCheckBox from "metabase/core/components/FormCheckBox"; // 导入复选框组件
import FormErrorMessage from "metabase/core/components/FormErrorMessage"; // 导入表单错误消息组件
import FormInput from "metabase/core/components/FormInput"; // 导入表单输入框组件
import FormSubmitButton from "metabase/core/components/FormSubmitButton"; // 导入表单提交按钮组件
import { Form, FormProvider } from "metabase/forms"; // 导入表单和表单提供者组件
import * as Errors from "metabase/lib/errors"; // 导入错误处理工具

import type { LoginData } from "../../types"; // 导入登录数据类型

import {
  SendCodeConiner,
  SendCodeButton,
  SendCodeButtonDisabled,
  SliderCaptchaBG,
  SliderCaptchaBox,
  SliderExit,
} from "./LoginForm.styled";
import { bgImg, puzzleImg } from "./img.json";
// 定义登录表单的验证规则
const LOGIN_SCHEMA = Yup.object().shape({
  // username: Yup.string()
  //   .required(Errors.required) // 用户名必填验证
  //   .when("$isLdapEnabled", {
  //     is: false,
  //     then: schema => schema.email(Errors.email), // 如果LDAP未启用，则验证为邮箱格式
  //   }),
  username: Yup.string()
    .required(Errors.required)
    .matches(
      /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$|^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      "手机号格式不正确",
    ), // 用户名必填验证
  password: Yup.string().required(Errors.required), // 密码必填验证
  phoneCode: Yup.number()
    .required(Errors.required)
    .test(
      "length",
      "验证码格式不正确",
      value => value?.toString().length === 6,
    ),
  remember: Yup.boolean(), // 记住我字段布尔类型验证
});

// 定义登录表单组件的属性类型
interface LoginFormProps {
  isLdapEnabled: boolean; // 是否启用LDAP的标志
  hasSessionCookies: boolean; // 是否存在会话cookies的标志
  onSubmit: (data: LoginData) => void; // 提交表单的回调函数
}

// 生效样式
const style = document.querySelector('[type="text/css"]');
style?.setAttribute("nonce", window.MetabaseNonce || "");
style?.removeAttribute("type");
// 登录表单组件
export const LoginForm = ({
  isLdapEnabled,
  hasSessionCookies,
  onSubmit,
}: LoginFormProps): JSX.Element => {
  // 初始表单值
  const initialValues = useMemo(
    () => ({
      password: "",
      remember: !hasSessionCookies,
    }),
    [hasSessionCookies],
  );

  // 验证上下文
  const validationContext = useMemo(
    () => ({
      isLdapEnabled,
    }),
    [isLdapEnabled],
  );
  // 是否显示验证码
  const [sliderCaptcha, setSliderCaptcha] = useState(false);
  // 是否正在验证人机状态
  const [codeSending, setCodeSending] = useState(false);
  // 是否正在计时
  let [timeRemaining, setTimeRemaining] = useState(60);
  let timer: any;
  // 开始计时
  const timingStart = (time: number) => {
    setCodeSending(true);
    timeRemaining = time;
    setTimeRemaining(timeRemaining);
    timer = setInterval(() => {
      timeRemaining--;
      setTimeRemaining(timeRemaining);
      // console.log('执行',timeRemaining);
      if (timeRemaining <= 0) {
        clearInterval(timer);
        setCodeSending(false);
      }
    }, 1000);
  };

  const phoneInput = useRef<any>(null);
  return (
    <FormProvider
      initialValues={initialValues} // 提供表单的初始值
      validationSchema={LOGIN_SCHEMA} // 提供表单的验证规则
      validationContext={validationContext} // 提供表单验证的上下文
      onSubmit={onSubmit} // 提交表单时的回调函数
    >
      <Form>
        {/* 用户名输入框 */}
        <FormInput
          name="username" // 字段名称
          title={t`手机号`}
          placeholder={t`请输入手机号`}
          autoFocus // 自动聚焦
          ref={phoneInput}
        />
        {/* 密码输入框 */}
        <FormInput
          name="password" // 字段名称
          title={t`Password`} // 输入框标题
          type="password" // 输入框类型
          placeholder={t`请输入密码`} // 输入框占位符
        />

        <SendCodeConiner>
          <FormInput
            name="phoneCode" // 字段名称
            title={t`验证码`} // 输入框标题
            type="input" // 输入框类型
            placeholder={t`请输入手机验证码`} // 输入框占位符
            maxLength={6}
          />
          {(codeSending && (
            <SendCodeButtonDisabled>{t`重新发送${timeRemaining}`}</SendCodeButtonDisabled>
          )) || (
            <SendCodeButton
              onClick={() => setSliderCaptcha(true)}
            >{t`发送验证码`}</SendCodeButton>
          )}
        </SendCodeConiner>

        {sliderCaptcha && (
          <SliderCaptchaBG>
            <SliderCaptchaBox>
              <SliderExit>
                <span>安全验证</span>
                <span className="exit" onClick={() => setSliderCaptcha(false)}>
                  X
                </span>
              </SliderExit>
              <SliderCaptcha
                showRefreshIcon={true}
                request={async () => ({
                  bgUrl: bgImg,
                  puzzleUrl: puzzleImg,
                })}
                onVerify={async (data: any) => {
                  if (data.x >= 80 && data.x <= 110) {
                    await setTimeout(() => {
                      setSliderCaptcha(false);
                      timingStart(3);
                    }, 1000);
                    return Promise.resolve();
                  }
                  return Promise.reject();
                }}
              />
            </SliderCaptchaBox>
          </SliderCaptchaBG>
        )}

        {/* 如果不存在会话cookies，则显示“记住我”复选框 */}
        {!hasSessionCookies && (
          <FormCheckBox name="remember" title={t`Remember me`} />
        )}
        {/* 登录按钮 */}
        <FormSubmitButton title={t`Sign in`} primary fullWidth />
        {/* 表单错误消息 */}
        <FormErrorMessage />
      </Form>
    </FormProvider>
  );
};
