# Yumi Run

Jogo de corrida infinita em pixel art. A Yumi precisa pular os bugs e desviar dos erros.

Site estático feito só com HTML, CSS e JavaScript puro: não precisa instalar nada nem rodar build.


## Onde mexer

- **Controles:** espaço, seta para cima ou W para pular; seta para baixo ou S para abaixar (no celular, toque para pular e arraste para baixo para abaixar).
- **Placa do título:** `index.html` e a parte `.hang` / `.plate` do `css/style.css`.
- **Dificuldade:** em `js/main.js`, procure por `330` (velocidade inicial), `780` (velocidade máxima) e `1900` (gravidade).
- **Recorde:** fica salvo no navegador de cada jogador (`localStorage`, chave `yumi-hi`).
- **Som:** sempre ligado, começa depois do primeiro toque ou tecla (regra dos navegadores).

