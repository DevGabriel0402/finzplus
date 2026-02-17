import React, { useRef } from "react";
import styled from "styled-components";

const InputData = styled.input`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.cores.textoFraco};
    background: ${({ theme }) => theme.cores.hover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.cores.texto};
    background: ${({ theme }) => theme.cores.hover};
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(${({ theme }) => (theme?.modo === "dark" ? 1 : 0)});
    opacity: 0.7;
    padding: 4px;
    border-radius: 4px;
  }

  &::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
    background: ${({ theme }) => theme.cores.hover};
  }
`;

export const CampoData = React.forwardRef(function CampoData(props, ref) {
  const inputRef = useRef(null);

  const handleClick = (e) => {
    const input =
      inputRef.current || (ref && typeof ref !== "function" ? ref.current : null);

    if (input) {
      try {
        if (typeof input.showPicker === "function") input.showPicker();
        else input.focus();
      } catch {
        input.focus();
      }
    }

    if (props.onClick) props.onClick(e);
  };

  return (
    <InputData
      {...props}
      ref={(node) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      onClick={handleClick}
    />
  );
});

CampoData.displayName = "CampoData";
