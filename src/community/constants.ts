export const DEFAULT_PROMPT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='680' viewBox='0 0 1200 680'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#11132A'/>
      <stop offset='55%' stop-color='#1C1F45'/>
      <stop offset='100%' stop-color='#2E2A5D'/>
    </linearGradient>
    <radialGradient id='glow1' cx='30%' cy='25%' r='50%'>
      <stop offset='0%' stop-color='#8A7CFF' stop-opacity='0.5'/>
      <stop offset='100%' stop-color='#8A7CFF' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='glow2' cx='75%' cy='75%' r='45%'>
      <stop offset='0%' stop-color='#6E7BFF' stop-opacity='0.45'/>
      <stop offset='100%' stop-color='#6E7BFF' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='1200' height='680' fill='url(#bg)'/>
  <rect width='1200' height='680' fill='url(#glow1)'/>
  <rect width='1200' height='680' fill='url(#glow2)'/>
  <g opacity='0.32' stroke='#C9CEFF' stroke-width='1'>
    <path d='M120 160h960'/>
    <path d='M120 320h960'/>
    <path d='M120 480h960'/>
    <path d='M240 120v440'/>
    <path d='M600 120v440'/>
    <path d='M960 120v440'/>
  </g>
  <g fill='none' stroke='#DCE0FF' stroke-opacity='0.5' stroke-width='2'>
    <path d='M200 230c80-80 190-80 270 0s190 80 270 0 190-80 270 0'/>
    <path d='M180 450c80-80 190-80 270 0s190 80 270 0 190-80 270 0'/>
  </g>
  <text x='60' y='620' fill='#E9ECFF' fill-opacity='0.82' font-size='34' font-family='Segoe UI, Arial, sans-serif'>PromptIT Community Placeholder</text>
</svg>
`);
