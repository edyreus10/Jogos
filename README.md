# ONOFFICE — Sindicância & Serviços

Site institucional da ONOFFICE, administradora de condomínios. Site estático
(HTML/CSS/JS, sem build), pronto para hospedagem em qualquer servidor estático.

## Estrutura

- `index.html` — marcação e conteúdo de todas as seções.
- `css/style.css` — design system (cores, tipografia, animações, responsividade).
- `js/main.js` — carrossel do hero, animações de scroll, menu mobile, galeria/lightbox, contadores.
- `assets/img/logo.webp` — logotipo oficial.
- `assets/images/hero/` — fotografias reais usadas no slideshow do Hero.
- `assets/images/gallery/` — fotografias reais usadas na galeria de áreas comuns.
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — suporte a PWA/instalação.

## Rodando localmente

```
python3 -m http.server 8080
```

Acesse `http://localhost:8080`.

## Banco visual (fotografias)

**Hero** (`css/style.css`, classes `.hero-photo-*`): 3 das 6 categorias já usam
fotografias reais — Fachada, Hall de entrada e Piscina. As outras 3 (Salão de
festas, Espaço gourmet, Jardim) ainda usam a ilustração de marca (gradiente +
skyline) por não haver fotografia real disponível para elas ainda. Para
substituir, adicione o arquivo em `assets/images/hero/` e troque o `background`
da respectiva classe (`.hero-slide-4/5/6`) por `background-image:url(...)`,
seguindo o mesmo padrão de `.hero-photo-fachada`.

**Galeria** (`js/main.js`, array `GALLERY`): os itens Fachada, Hall de entrada,
Piscina, Lavanderia e Academia têm o campo `photo` apontando para um arquivo em
`assets/images/gallery/` (carregado com lazy-loading via IntersectionObserver).
Os demais itens (Jardim, Área social, Salão de festas, Coworking, Bicicletário,
Espaço gourmet, Áreas de convivência) continuam como ilustração de marca — para
adicionar a foto real, inclua o arquivo em `assets/images/gallery/` e adicione
o campo `photo: 'assets/images/gallery/arquivo.webp'` ao item correspondente.

Sempre que uma fotografia real for adicionada, é preciso ajustar o
`background-position` dela em `css/style.css` (blocos `.hero-photo-*` e
`.pattern.has-photo.sw-N`) para o enquadramento ficar bom em telas estreitas.
