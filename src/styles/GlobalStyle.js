import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *{ box-sizing:border-box; }
  html, body { height: 100%; scroll-behavior: smooth; }
  body{
    margin:0;
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
    background:${({ theme }) => theme.cores.fundo};
    color:${({ theme }) => theme.cores.texto};
    transition: background 0.3s ease, color 0.3s ease;
  }
  a{ color:inherit; text-decoration:none; }
  button, input, select { font: inherit; }

  /* Impressão para PDF */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }
    aside, button, .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
  }
`;
