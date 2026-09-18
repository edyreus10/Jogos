# ONOFFICE — Sindicância & Serviços

Site institucional da ONOFFICE, administradora de condomínios. Site estático
(HTML/CSS/JS, sem build), pronto para hospedagem em qualquer servidor estático.

## Estrutura

- `index.html` — marcação e conteúdo de todas as seções.
- `css/style.css` — design system (cores, tipografia, animações, responsividade).
- `js/main.js` — carrossel do hero, animações de scroll, menu mobile, galeria/lightbox, contadores.
- `assets/img/logo.webp` — logotipo.
- `assets/video/logo-loop.mp4` — animação do logotipo (uso opcional).
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — suporte a PWA/instalação.

## Rodando localmente

```
python3 -m http.server 8080
```

Acesse `http://localhost:8080`.

## Observações

As imagens de ambientes (fachada, piscina, salão de festas etc.) são
ilustrações de marca (placeholders) na paleta azul institucional, já que
fotografias reais dos empreendimentos não foram fornecidas. Substitua os
elementos `.pattern` em `js/main.js` (array `GALLERY`) e os painéis `.blue-panel`
por fotos reais quando disponíveis.
