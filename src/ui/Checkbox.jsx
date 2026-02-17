import styled from "styled-components";

const Wrapper = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const Box = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ checked, tipo, theme }) =>
    checked
      ? tipo === "entrada"
        ? theme.cores.sucessoBg
        : theme.cores.erroBg
      : theme.cores.superficie};

  display: grid;
  place-items: center;
  transition: all 0.2s ease;

  svg {
    width: 12px;
    height: 12px;
    color: ${({ tipo, theme }) =>
      tipo === "entrada" ? theme.cores.sucesso : theme.cores.erro};
    opacity: ${({ checked }) => (checked ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
`;

export default function Checkbox({ checked, onChange, tipo }) {
  return (
    <Wrapper>
      <HiddenInput type="checkbox" checked={checked} onChange={onChange} />
      <Box checked={checked} tipo={tipo}>
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z" />
        </svg>
      </Box>
    </Wrapper>
  );
}
