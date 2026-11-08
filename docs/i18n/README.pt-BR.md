<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) ·
[Français](README.fr.md) · [한국어](README.ko.md) · **Português** ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

Um visualizador somente leitura para o [Orca](https://github.com/stablyai/orca) que abre arquivos GLB, glTF, STL, PLY, OBJ e FBX.
Gire ao redor do modelo, reproduza as animações e confira num piscar de olhos se ele tem mesmo o tamanho que você imagina.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#segurança)

[Início rápido](#início-rápido) · [Formatos](#formatos) · [Recursos](#recursos) · [Instalação](#instalação) · [Uso](#uso) ·
[Solução de problemas](#solução-de-problemas) · [Segurança](#segurança) · [Desenvolvimento](#desenvolvimento) ·
[Relatar um bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="O Stanford Bunny no 3D Viewer dentro do Orca, sobre uma grade no chão, com as dimensões 156 × 154 × 121 mm na barra de status" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/hero.png" width="800">

</div>

## Início rápido

1. No Orca, abra **Configurações → Plugins**, pesquise **3D Viewer**, clique em **Revisar e instalar** e depois instale e ative o plugin. O botão **Open in Orca** na [página do plugin](https://www.onorca.dev/plugins/momokun7/orca-3d-viewer) também o abre.
2. Abra um arquivo `.glb`, `.gltf`, `.stl`, `.ply`, `.obj` ou `.fbx`.
3. Arraste para girar e use a roda do mouse para aproximar ou afastar.

O plugin não pede nenhuma permissão. Para mais detalhes, veja [Instalação](#instalação) e [Uso](#uso).

## Formatos

Seis formatos em um só visualizador.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game em GLB: um tabuleiro de xadrez de mármore com peças de vidro e metal" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/glb.png"></td>
    <td width="33%"><img alt="Corset em glTF com os dados incorporados: tecido bordado e fivelas" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy em STL: o barquinho usado para testar impressoras 3D, com a cor laranja gravada no arquivo" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="O Stanford Armadillo em PLY: um escaneamento 3D com a cor verde gravada nos vértices" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/ply.png"></td>
    <td width="33%"><img alt="O Utah Teapot em OBJ, com a cor roxa gravada nos vértices" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox em FBX, com a textura dos botões e das telas dos alto-falantes" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Formato | Extensões | Cores e texturas | Animação | Unidade de tamanho | Observações |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Sim | Sim | Metros (definido pelo glTF) | O `.gltf` precisa ter os dados incorporados |
| STL | `.stl` | Cores gravadas no arquivo ou, na falta delas, uma cor padrão | Não | Milímetros (padrão da impressão 3D), Z para cima | Binário e texto |
| PLY | `.ply` | Cores de vértice ou, na falta delas, uma cor padrão | Não | Exibido em metros | Binário e texto |
| OBJ | `.obj` | Cores de vértice (o `.mtl` não é lido) | Não | Exibido em metros | |
| FBX | `.fbx` | Só texturas incorporadas | Sim | A unidade declarada no arquivo | FBX binário 7.0 (2011) ou mais recente |

Também abrem glTF comprimido com Draco ou Meshopt e texturas KTX2 / Basis Universal.

## Recursos

### Explore o modelo

<table>
  <tr>
    <td width="50%"><img alt="Arrastar com o botão esquerdo do mouse gira a câmera ao redor do coelho" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/orbit.gif"></td>
    <td width="50%"><img alt="Arrastar com o botão direito e, depois, com Shift e o botão esquerdo desloca a vista para o lado" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Girar</b>: arrastar</td>
    <td align="center"><b>Deslocar</b>: arrastar com o botão direito ou <kbd>Shift</kbd> + arrastar</td>
  </tr>
  <tr>
    <td width="50%"><img alt="Girar a roda do mouse aproxima e afasta o coelho" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/zoom.gif"></td>
    <td width="50%"><img alt="Uma vista de cabeça para baixo volta à posição inicial com o botão Redefinir exibição" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoom</b>: roda do mouse</td>
    <td align="center"><b>Redefinir exibição</b>: o primeiro botão da barra de ferramentas</td>
  </tr>
</table>

### Tamanho real

Uma grade no chão, os eixos X / Y / Z e as dimensões do modelo (largura × altura × profundidade): se ele foi criado
na unidade errada, você percebe na hora. O Stanford Bunny, por exemplo, mede 15,6 cm de largura.

<img alt="O coelho sobre uma grade de 10 mm; a barra de status mostra 156 × 154 × 121 mm e, em seguida, Grade 10 mm" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/size.gif" width="600">

### Wireframe, grade e eixos

Veja a malha só com as arestas ou oculte a grade e os eixos. O número de vértices e triângulos aparece na barra de
status.

<img alt="O botão Wireframe mostra a malha do coelho e, em seguida, o botão Grade e eixos oculta a grade do chão" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/inspect.gif" width="600">

### Animações

Reproduza, pause e, se o modelo tiver mais de um clipe, escolha qual quer ver.

<img alt="Uma raposa reproduz o clipe Survey, troca para Run pelo menu de clipes, pausa e volta a reproduzir" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/animations.gif" width="600">

### Sempre atualizado

Salvou o arquivo, a visualização já mostra a nova versão, e a câmera continua onde estava.

<img alt="A cada Ctrl + S no arquivo, o coelho muda de cor sem sair do lugar" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/live.gif" width="600">

### Claro ou escuro

O visualizador abre no tema claro, e o botão da lua na barra de ferramentas alterna entre o claro e o escuro. A
última escolha de tema, wireframe e grade fica salva, mesmo depois de reiniciar o Orca (Orca 1.4.250 ou mais
recente).

<img alt="Um clique no botão da lua da barra de ferramentas escurece o visualizador, e outro clique o deixa claro de novo" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/features/theme.gif" width="600">

### Onze idiomas

Os textos do visualizador seguem o idioma do Orca: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 e 繁體中文.

### Detalhes prontos para colar em uma issue

O botão **i** da barra de ferramentas (ou, em uma tela de erro, o botão **Detalhes** logo abaixo da mensagem) abre um
resumo com a versão do visualizador, o navegador e a placa de vídeo, os últimos carregamentos e quanto tempo cada um
levou, além dos erros que ocorreram. Clique em **Copiar**, cole em uma issue e pronto: está tudo ali. O resumo não
inclui dados do modelo, exceto trechos citados em mensagens de erro.

<img alt="O painel Detalhes: a versão do visualizador, o navegador, o histórico de carregamentos e o motivo pelo qual um arquivo foi recusado, com os botões Copiar e Fechar" src="https://raw.githubusercontent.com/momokun7/orca-3d-viewer/readme-media/details.png" width="600">

## Instalação

O 3D Viewer está no catálogo de plugins da comunidade do Orca. Instalado pelo catálogo, ele se atualiza sozinho quando sai uma versão nova.

1. No Orca, abra **Configurações → Plugins** e pesquise **3D Viewer**.
   O botão **Open in Orca** na [página do plugin](https://www.onorca.dev/plugins/momokun7/orca-3d-viewer) abre a mesma página.
2. Clique em **Revisar e instalar**, confira o que ele pode acessar e depois instale e ative o plugin. O visualizador não pede nenhuma permissão.

Se o 3D Viewer não aparecer, adicione o catálogo da comunidade em **Adicionar plugin → Fontes do catálogo…** com a URL `https://github.com/stablyai/orca-community-plugins.git` e a ref `main`.

<details>
<summary>Instalar por uma URL do Git</summary>

1. Abra **Configurações → Plugins → Instalar plugin** e, na aba **URL do Git**, cole este endereço em **URL do repositório**:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.2
   ```

2. Clique em **Continuar**, depois em **Instalar** e, na janela seguinte, em **Ativar plugin**.

Instalado dessa forma, o plugin não se atualiza sozinho.

</details>

> [!IMPORTANT]
> É necessário o aplicativo de desktop do Orca, versão 1.4.248 ou mais recente.

## Uso

Basta abrir um arquivo em qualquer um desses formatos para vê-lo em 3D. Como `.gltf` e `.obj` são arquivos de
texto, a aba do editor permite alternar entre **Origem** (o texto) e **3D**.

| Ação | Como |
| --- | --- |
| Girar | Arrastar |
| Deslocar | Arrastar com o botão direito, <kbd>Shift</kbd> + arrastar ou as setas do teclado |
| Zoom | Roda do mouse |
| Redefinir exibição | O primeiro botão da barra de ferramentas |
| Wireframe, grade e eixos | Os botões logo ao lado |
| Claro ou escuro | O botão da lua |
| Detalhes | O botão **i** |
| Animações | O botão de reproduzir e o menu de clipes, quando o modelo tem animações |

## Limitações

> [!NOTE]
> Os plugins do Orca só têm acesso ao arquivo aberto, e não aos outros arquivos da mesma pasta. Por isso, dados
> guardados em arquivos separados não podem ser exibidos: um `.gltf` com a geometria em um `.bin` à parte não abre,
> e texturas em arquivos de imagem separados ou o `.mtl` de um OBJ ficam de fora. Já um `.glb`, um `.gltf` com os
> dados incorporados ou um FBX com as texturas incorporadas aparecem completos.

- **Só no aplicativo de desktop.** No Orca pelo navegador, o arquivo abre em Origem.
- **Até 64 MiB**, o limite do Orca para editores personalizados. Se um modelo ficar grande demais para ser mantido
  com segurança depois de decodificado, ou usar algo que o visualizador não consegue ler, ele é recusado com uma
  mensagem explicando o motivo.
- **Sem FBX antigo nem em texto.** Exporte o arquivo de novo como FBX binário 7.0 ou mais recente.

Testamos todos os 152 modelos GLB e glTF com dados incorporados do
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) da Khronos: todos abrem, menos três, que
dependem de uma extensão que o three.js não implementa.

## Solução de problemas

<details>
<summary>O arquivo abre como texto, e não em 3D</summary>

Como `.gltf` e `.obj` são arquivos de texto, eles podem abrir em Origem (o texto). Escolha **3D** na aba do editor.
No Orca pelo navegador, a visualização 3D não está disponível.

</details>

<details>
<summary>Faltam texturas ou cores</summary>

Plugins não conseguem ler texturas em arquivos de imagem separados; a barra de status mostra os nomes dos arquivos que
ficaram de fora. No caso do glTF, use um `.glb`; no do FBX, exporte com as texturas incorporadas. Como o `.mtl` de
um OBJ não é lido, o modelo aparece com as cores de vértice, se houver, ou com uma cor padrão.

</details>

<details>
<summary>O tamanho parece errado</summary>

STL é exibido em milímetros, e PLY e OBJ em metros, porque nenhum desses formatos guarda a unidade. FBX e glTF usam a
unidade declarada no arquivo. Se o tamanho estiver 1000 ou 100 vezes maior ou menor do que deveria, confira em que
unidade o modelo foi exportado.

</details>

<details>
<summary>Aparece uma mensagem dizendo que o modelo não pode ser aberto</summary>

A própria mensagem explica o motivo. Modelos grandes demais, arquivos corrompidos e recursos que o visualizador não
suporta são barrados antes de abrir. Se o motivo não ficar claro, copie os **Detalhes** e cole em uma issue.

</details>

<details>
<summary>Como relatar um bug</summary>

Preencha o formulário de [relatório de bug](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)
e cole o texto dos **Detalhes**. Se puder compartilhar o modelo, diga de onde ele veio. Problemas de segurança devem ser
enviados por um [relatório privado](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), e não por uma issue.

</details>

## Segurança

Todo modelo é uma entrada não confiável, por isso o visualizador foi pensado para oferecer o mínimo possível a um
atacante.

- **Isolado**: roda no frame isolado de plugins do Orca, sob uma Content-Security-Policy rígida e sem acesso à rede.
- **Sem permissões**: o manifesto não pede nenhuma capacidade, ou seja, nada de worker, comandos ou acesso a arquivos.
- **Somente leitura**: nunca edita nem salva o documento, e as URIs contidas em um modelo nunca chegam a um loader.
- **Verificado antes**: em todos os formatos, os limites de tamanho são conferidos em uma thread separada, antes de
  qualquer decodificação. Os arrays comprimidos do FBX são descomprimidos aos poucos, e o processo é interrompido
  assim que passam do tamanho declarado.
- **Testado**: a CI roda o visualizador sob a política de frame do Orca com modelos maliciosos e gerados por fuzzing,
  e verifica se o bundle commitado pode ser reproduzido a partir do código-fonte.

Os detalhes estão no [SECURITY.md](../../SECURITY.md).

## Desenvolvimento

O código do plugin fica em `build/src`. O `build/build.mjs` gera o pacote em `editor/`, que vai commitado no
repositório para que o Orca carregue o plugin sem precisar de uma etapa de build.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Com o [mise](https://mise.jdx.dev), `mise run check` executa tudo o que a CI executa, e `mise tasks` lista as demais
tarefas.

Para testar suas alterações no Orca, execute `orca plugin dev watch .` na raiz do repositório ou adicione a pasta em
**Configurações → Plugins → Desenvolvimento**.

## Como contribuir

O [CONTRIBUTING.md](../../CONTRIBUTING.md) explica como funcionam as issues, as labels, o quadro do projeto, os
milestones e os pull requests. Com exceção do inglês e do japonês, as traduções foram rascunhadas por máquina;
correções de falantes nativos são muito bem-vindas.

## Licença e créditos

[MIT](../../LICENSE). Os componentes incluídos, three.js, meshoptimizer, fflate e Lucide (MIT / ISC) e o
decodificador Draco (Apache-2.0), mantêm suas próprias licenças; veja o [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Os modelos que aparecem nas imagens e nos GIFs, no ícone do plugin e nas imagens da página do plugin no Orca vêm das fontes abaixo. Em todas as cópias, a conversão de formato, as
cores (no 3DBenchy, no Armadillo e no Teapot, fomos nós que as gravamos no arquivo) e a orientação foram alteradas por
nós.

| Modelo | Usado em | Fonte | Licença |
| --- | --- | --- | --- |
| Stanford Bunny | Imagem principal, GIFs dos recursos, ícone do plugin, página do plugin | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Fonte: Stanford University Computer Graphics Laboratory | Uso não comercial livre, com crédito |
| Stanford Armadillo | PLY | Idem | Idem |
| A Beautiful Game | GLB, página do plugin | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Modelo original do MaterialX Project, conversão para glTF de Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX, página do plugin | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | GIF das animações, página do plugin | Khronos glTF Sample Assets. Modelo de PixelMannen (CC0 1.0), rigging e animação de tomkranis, conversão para glTF de @AsoboStudio e @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
