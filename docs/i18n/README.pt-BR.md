<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · **Português** ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**Veja modelos 3D sem sair do editor.**

Um visualizador somente leitura para o [Orca](https://github.com/stablyai/orca) que abre GLB, glTF, STL, PLY, OBJ e FBX.
Gire em volta do modelo, reproduza as animações dele e confira de relance se ele tem o tamanho que você imagina.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#segurança)

[Início rápido](#início-rápido) · [Formatos](#formatos) · [Recursos](#recursos) · [Instalação](#instalação) · [Uso](#uso) ·
[Solução de problemas](#solução-de-problemas) · [Segurança](#segurança) · [Desenvolvimento](#desenvolvimento) ·
[Relatar um bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="O Stanford Bunny no 3D Viewer dentro do Orca, sobre uma grade no chão, com o tamanho, 156 × 154 × 121 mm, na barra de status" src="../images/hero.png" width="800">

</div>

## Início rápido

1. No Orca, abra **Configurações → Plugins → Instalar plugin**, digite `https://github.com/momokun7/orca-3d-viewer#v1.0.0` na aba **URL do Git** e escolha **Instalar**.
2. Abra um arquivo `.glb`, `.gltf`, `.stl`, `.ply`, `.obj` ou `.fbx`.
3. Arraste para girar e use a roda do mouse para aproximar.

Nenhuma permissão é pedida. Veja [Instalação](#instalação) e [Uso](#uso) para mais detalhes.

## Formatos

Um visualizador, seis formatos.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game em GLB: um tabuleiro de xadrez de mármore com peças de vidro e metal" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Corset em glTF com os dados incorporados: tecido bordado e fivelas" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy em STL: o barquinho usado para testar impressoras 3D, em um laranja gravado no arquivo" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="O Stanford Armadillo em PLY: um escaneamento 3D, em um verde gravado nos vértices" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="O Utah Teapot em OBJ, em um roxo gravado nos vértices" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox em FBX, com a textura dos botões e das grades dos alto-falantes" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Formato | Extensões | Cores e texturas | Animação | Unidade de tamanho | Observações |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Sim | Sim | Metros (como o glTF define) | Um `.gltf` precisa ter os dados incorporados |
| STL | `.stl` | Cores gravadas no arquivo; senão, uma cor padrão | Não | Milímetros (a convenção da impressão 3D), Z para cima | Binário e texto |
| PLY | `.ply` | Cores de vértice; senão, uma cor padrão | Não | Mostrado em metros | Binário e texto |
| OBJ | `.obj` | Cores de vértice (o `.mtl` não pode ser lido) | Não | Mostrado em metros | |
| FBX | `.fbx` | Apenas texturas incorporadas | Sim | A unidade que o arquivo declara | FBX binário 7.0 (2011) e posteriores |

glTF comprimido com Draco ou Meshopt e texturas KTX2 / Basis Universal também abrem.

## Recursos

### Olhe em volta

<table>
  <tr>
    <td width="50%"><img alt="Arrastar com o botão esquerdo do mouse gira a câmera em volta do coelho" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Arrastar com o botão direito e depois arrastar com Shift e o botão esquerdo desloca a vista para o lado" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Girar</b>: arrastar</td>
    <td align="center"><b>Deslocar</b>: arrastar com o botão direito, ou <kbd>Shift</kbd> + arrastar</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Rolar a roda do mouse aproxima e afasta o coelho" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Uma vista de cabeça para baixo volta à vista inicial com o botão de redefinir" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoom</b>: rolar</td>
    <td align="center"><b>Redefinir exibição</b>: o primeiro botão da barra de ferramentas</td>
  </tr>
</table>

### Tamanho real

Uma grade no chão, os eixos X / Y / Z e a largura × altura × profundidade do modelo, para que um modelo feito na
unidade errada se destaque na hora. O Stanford Bunny fica com 15,6 cm de largura.

<img alt="O coelho sobre uma grade de 10 mm; a barra de status mostra 156 × 154 × 121 mm e depois Grade 10 mm" src="../images/features/size.gif" width="600">

### Aramado, grade e eixos

Mostre a malha apenas como linhas, ou esconda a grade e os eixos. As contagens de vértices e triângulos ficam na
barra de status.

<img alt="O botão Aramado mostra a malha do coelho e depois o botão Grade e eixos esconde a grade do chão" src="../images/features/inspect.gif" width="600">

### Animações

Reproduza e pause, e escolha um clipe quando o modelo tiver vários.

<img alt="Uma raposa reproduz o clipe Survey, muda para Run pelo menu de clipes, depois pausa e reproduz de novo" src="../images/features/animations.gif" width="600">

### Sempre atualizado

Salve o arquivo e a vista mostra a nova versão, mantendo a câmera onde estava.

<img alt="Cada vez que o arquivo é salvo com Ctrl + S, o coelho muda de cor no lugar" src="../images/features/live.gif" width="600">

### Claro ou escuro

O visualizador abre no tema claro; o botão da lua na barra de ferramentas alterna para o tema escuro e de volta.
Ele lembra o tema, o aramado e a grade que você escolheu por último, mesmo depois de reiniciar o Orca (Orca 1.4.250 e
posteriores).

<img alt="Clicar no botão da lua na barra de ferramentas deixa o visualizador escuro, e clicar de novo o deixa claro" src="../images/features/theme.gif" width="600">

### Onze idiomas

O texto do visualizador segue o idioma do Orca: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 e 繁體中文.

### Detalhes para colar em uma issue

O botão **i** na barra de ferramentas (em uma tela de erro, o botão **Detalhes** abaixo da mensagem) abre um resumo:
a versão do visualizador, seu navegador e seus gráficos, os carregamentos recentes com o tempo que levaram e os erros
ocorridos. Use **Copiar** e cole em uma issue, e ela dirá o que aconteceu. O resumo não contém dados do modelo.

<img alt="O painel Detalhes: a versão do visualizador, o navegador, o histórico de carregamentos e o motivo pelo qual um arquivo foi recusado, com os botões Copiar e Fechar" src="../images/details.png" width="600">

## Instalação

1. No Orca, abra **Configurações → Plugins** e escolha **Instalar plugin**.
2. Na aba **URL do Git**, digite:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. Escolha **Instalar**. O visualizador não pede nenhuma permissão, então não há mais nada a conceder.

> [!IMPORTANT]
> Requer o aplicativo de desktop do Orca, versão 1.4.248 ou posterior.

## Uso

Abra um arquivo em qualquer um desses formatos e ele aparece em 3D. `.gltf` e `.obj` são arquivos de texto, então a
aba do editor alterna entre **Origem** (o texto) e **3D**.

| Ação | Como |
| --- | --- |
| Girar | Arrastar |
| Deslocar | Arrastar com o botão direito, <kbd>Shift</kbd> + arrastar, ou as teclas de seta |
| Zoom | Rolar |
| Redefinir exibição | O primeiro botão da barra de ferramentas |
| Aramado, grade e eixos | Os botões ao lado dele |
| Claro ou escuro | O botão da lua |
| Detalhes | O botão **i** |
| Animações | O botão de reproduzir e o menu de clipes, quando o modelo tiver animações |

## Limitações

> [!NOTE]
> Os plugins do Orca leem apenas o arquivo aberto, nunca os outros arquivos da mesma pasta, então dados guardados em
> arquivos separados não podem ser exibidos. Um `.gltf` cuja geometria fica em um `.bin` separado não abre, e
> texturas em arquivos de imagem separados e o `.mtl` de um OBJ ficam de fora. Um `.glb`, um `.gltf` com os dados
> incorporados ou um FBX com as texturas incorporadas mostra tudo.

- **Somente no aplicativo de desktop.** No Orca no navegador, o arquivo abre em Origem.
- **Até 64 MiB**, o limite do Orca para editores personalizados. Um modelo que, decodificado, ficaria muito maior do
  que é seguro manter, ou que usa algo que o visualizador não consegue ler, é recusado com uma mensagem explicando
  o motivo.
- **Sem FBX antigo ou de texto.** Exporte-o novamente como FBX binário 7.0 ou posterior.

Todos os 152 modelos GLB e glTF com dados incorporados do
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) da Khronos foram testados: todos abrem,
exceto três que precisam de uma extensão que o three.js não implementa.

## Solução de problemas

<details>
<summary>O arquivo abre como texto em vez de 3D</summary>

`.gltf` e `.obj` são arquivos de texto, então podem abrir em Origem (o texto). Escolha **3D** na aba do editor. No
Orca no navegador, o 3D não está disponível.

</details>

<details>
<summary>Faltam texturas ou cores</summary>

Texturas em arquivos de imagem separados não podem ser lidas por um plugin; a barra de status mostra os nomes dos
arquivos que não puderam ser lidos. Para glTF, use um `.glb`; para FBX, exporte com as texturas incorporadas. O
`.mtl` de um OBJ não pode ser lido, então ele aparece nas cores de vértice, se tiver, ou em uma cor padrão.

</details>

<details>
<summary>O tamanho parece errado</summary>

STL é mostrado em milímetros, e PLY e OBJ em metros, já que nenhum desses formatos guarda uma unidade. FBX e glTF
usam a unidade que o arquivo declara. Se o tamanho estiver errado por um fator de 1000 ou 100, verifique a unidade
em que o modelo foi exportado.

</details>

<details>
<summary>Aparece que o modelo não pode ser aberto</summary>

A mensagem explica o motivo. Modelos grandes demais, arquivos corrompidos e recursos que o visualizador não suporta
são recusados antes de serem abertos. Se o motivo não estiver claro, copie os **Detalhes** para uma issue.

</details>

<details>
<summary>Como relatar um bug</summary>

Use o modelo de [relatório de bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)
e cole o texto dos **Detalhes**. Se puder compartilhar o modelo, diga de onde ele veio. Um problema de segurança deve
ir em um [relatório privado](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), não em uma issue.

</details>

## Segurança

Um modelo é uma entrada não confiável, por isso o visualizador foi feito para ser um alvo sem graça.

- **Isolado**: ele roda no frame isolado de plugins do Orca, sob uma Content-Security-Policy rígida, sem rede.
- **Sem permissões**: o manifesto não pede nenhuma capacidade: nada de worker, comandos ou acesso a arquivos.
- **Somente leitura**: ele nunca edita nem salva o documento, e URIs dentro de um modelo nunca chegam a um loader.
- **Verificado antes**: todo formato é verificado contra limites de tamanho em uma thread separada antes de qualquer
  decodificação. Os arrays comprimidos do FBX são descomprimidos em pequenos passos e interrompidos assim que
  passam do tamanho declarado.
- **Testado**: a CI roda o visualizador sob a política de frame do Orca com modelos hostis e gerados por fuzzing, e
  verifica se o bundle commitado pode ser reproduzido a partir do código-fonte.

Veja o [SECURITY.md](../../SECURITY.md) para os detalhes.

## Desenvolvimento

O código do plugin fica em `build/src`. O `build/build.mjs` o empacota em `editor/`, que é commitado para que o Orca
possa carregar o plugin sem uma etapa de build.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Com o [mise](https://mise.jdx.dev), `mise run check` executa tudo o que a CI executa, e `mise tasks` lista o resto.

Para testar suas alterações no Orca, execute `orca plugin dev watch .` na raiz do repositório, ou adicione a pasta em
**Configurações → Plugins → Desenvolvimento**.

## Como contribuir

Issues, labels, o quadro do projeto, milestones e pull requests estão descritos no
[CONTRIBUTING.md](../../CONTRIBUTING.md). As traduções além do inglês e do japonês foram rascunhadas por máquina;
correções de falantes nativos são muito bem-vindas.

## Licença e créditos

[MIT](../../LICENSE). O three.js, o meshoptimizer, o fflate e o Lucide (MIT / ISC) e o decodificador Draco
(Apache-2.0) incluídos mantêm as próprias licenças; veja o [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Os modelos das imagens e GIFs vêm das fontes abaixo. Em todas as cópias, a conversão de formato, as cores (as do
3DBenchy, do Armadillo e do Teapot foram gravadas no arquivo por nós) e a orientação são edições nossas.

| Modelo | Usado em | Fonte | Licença |
| --- | --- | --- | --- |
| Stanford Bunny | Imagem principal, GIFs dos recursos | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Livre para uso não comercial, com crédito |
| Stanford Armadillo | PLY | Idem | Idem |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Modelo original do MaterialX Project, conversão para glTF por Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | GIF de animação | Khronos glTF Sample Assets. Modelo de PixelMannen (CC0 1.0), rigging e animação de tomkranis, conversão para glTF por @AsoboStudio e @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
