import styled from "@emotion/styled";

import Link from "metabase/core/components/Link";
import { color } from "metabase/lib/colors";

export const SendCodeConiner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SendCodeButton = styled.div`
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  border: 1px solid #eeecec;
  border-radius: 8px;
  background-color: ${color("brand")};
  color: #fff;
  flex: 1;
  text-align: center;
  align-self: end;
  margin-bottom: 1.25rem;
  margin-left: 1.25rem;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.8;
  }
`;

export const SendCodeButtonDisabled = styled.div`
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  border: 1px solid #eeecec;
  border-radius: 8px;
  background-color: ${color("bg-white")};
  color: ${color("text-dark")};
  flex: 1;
  text-align: center;
  align-self: end;
  margin-bottom: 1.25rem;
  margin-left: 1.25rem;
  white-space: nowrap;
  &:hover {
    opacity: 0.8;
  }
`;

export const SliderCaptchaBG = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #00000069;
  color: ${color("text-dark")};
  z-index: 999;
  & > div {
    margin: auto;
  }
`;

export const SliderCaptchaBox = styled.div`
  padding: 1rem;
  background: #fff;
  margin: auto;
  border-radius: 0.5rem;
  & .rc-slider-captcha-panel-inner {
    overflow: visible;
  }
  & .rc-slider-captcha-jigsaw-refresh {
    position: absolute;
    top: -1.9rem;
    right: 1.2rem;
    color: #000;
    font-size: 1rem;
  }
`;
export const SliderExit = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  & > .exit {
    transform: scaleX(1.5);
  }
`;

export const GoogleButtonRoot = styled.div`
  display: flex;
  justify-content: center;
  flex-flow: column wrap;
  align-items: center;
`;

export const AuthError = styled.div`
  color: ${color("error")};
  text-align: center;
`;

export const AuthErrorRoot = styled.div`
  margin-top: 1rem;
`;

export const TextLink = styled(Link)`
  cursor: pointer;
  color: ${color("text-dark")};

  &:hover {
    color: ${color("brand")};
  }
`;
