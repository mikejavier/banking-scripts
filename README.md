## Limpar dados extraidos do banco

- Fazer extração dos dados no banco como CSV
- Colocar o CSV na raiz deste projeto com o nome **extracao**
- Colocar a ultima planilha enviada para enriquecer com o nome **base_enriquecer**
- Rodar o script de limpeza com: `node clean.js`
- Aguardar a mensagem de concluido no terminal

## Criar base para ser enriquecida no Serasa (Delta)

- Fazer extração dos dados no banco como CSV
- Colocar o CSV na raiz deste projeto com o nome **extracao**
- Colocar a ultima planilha enviada para enriquecer com o nome **base_enriquecer**
- Rodar o script para gerar a base com: `node delta.js`
- Aguardar a mensagem de concluido no terminal

## Enriquecer base com dados do Serasa

- Fazer extração dos dados no banco como CSV
- Colocar o CSV na raiz deste projeto com o nome **extracao**
- Colocar a planilha enriquecida pelo Serasa com o nome **base_enriquecida**
- Rodar o script para gerar a base enriquecida com: `node enrichment_serasa.js`
- Aguardar a mensagem de concluido no terminal

## Enriquecer base com dados do Experiencia

- Fazer extração dos dados no banco como CSV
- Colocar o CSV na raiz deste projeto com o nome **extracao**
- Colocar a planilha enriquecida pelo experiencia com o nome **base_enriquecida_exp**
- Rodar o script para gerar a base enriquecida com: `node enrichment_exp.js`
- Aguardar a mensagem de concluido no terminal