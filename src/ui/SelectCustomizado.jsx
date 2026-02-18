import styled from "styled-components";
import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  outline: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.cores.textoFraco};
    background: ${({ theme }) => theme.cores.hover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.cores.texto};
    background: ${({ theme }) => theme.cores.hover};
  }
`;

const SelectButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const SelectDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.cores.superficie2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 12px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: ${({ theme }) => theme.sombras.suave};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.cores.borda};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.cores.textoFraco};
    }
  }
`;

const SelectOption = styled.button`
  width: 100%;
  padding: 12px 12px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.cores.hover};
  }

  ${(props) =>
    props.$selected &&
    `
    background: ${props.theme.cores.borda};
    font-weight: 600;
  `}
`;

const OptionContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export function SelectCustomizado({
  value,
  onChange,
  options = [],
  placeholder = "Selecione...",
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const safeOptions = options || [];
  const opcaoSelecionada = safeOptions.find((opt) => opt.value === value);
  const textoSelecionado = opcaoSelecionada?.label || placeholder;
  const IconeSelecionado = opcaoSelecionada?.icon || null;

  return (
    <SelectContainer ref={containerRef}>
      <SelectButton onClick={() => setAberto(!aberto)} type="button">
        <SelectButtonContent>
          {IconeSelecionado ? <IconeSelecionado size={16} /> : null}
          <span>{textoSelecionado}</span>
        </SelectButtonContent>
        <FiChevronDown
          size={16}
          style={{
            transform: aberto ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </SelectButton>

      {aberto && (
        <SelectDropdown>
          {safeOptions.map((opt) => (
            <SelectOption
              key={opt.value}
              $selected={value === opt.value}
              onClick={() => {
                onChange({ target: { value: opt.value } });
                setAberto(false);
              }}
              type="button"
            >
              <OptionContent>
                {opt.icon ? <opt.icon size={16} /> : null}
                <span>{opt.label}</span>
              </OptionContent>
            </SelectOption>
          ))}
        </SelectDropdown>
      )}
    </SelectContainer>
  );
}
