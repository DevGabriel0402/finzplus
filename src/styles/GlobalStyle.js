import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  *{ box-sizing:border-box; }
  html, body { height: 100%; }
  body{
    margin:0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    background:${({ theme }) => theme.cores.fundo};
    color:${({ theme }) => theme.cores.texto};
  }
  a{ color:inherit; text-decoration:none; }
  button, input, select { font: inherit; }
`;
