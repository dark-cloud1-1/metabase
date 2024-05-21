import styled from "@emotion/styled";

import Link from "metabase/core/components/Link";
import { color } from "metabase/lib/colors";

export const SendCodeConiner = styled.div`
  display: flex;
  justify-content:center
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
  cursor: pointer;
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
  &:hover {
    opacity: 0.8;
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
