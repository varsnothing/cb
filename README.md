# A API das notificações


Essa é uma API web para gerenciar notificações em um sistema de filas.

O sistema de fila em si, não foi codificado, mas será brevemente apresentado no final desse documento.

## Instalação

Como pré-requisito, esse repositório carece das seguintes dependências no sistema operativo:

- Node v18+
- NPM v10+

Para instalar esse repositório, basta executar:
```sh
git clone git@github.com:varsnothing/cb.git
npm ci
```

## Execução

Para rodar esse servidor web, basta executar:
```sh
npm run start
```


## Instruções para configurar

- Copiar o arquivo .env.public para .env na raíz do diretório:
```sh
cp .env.public .env
```

- Criar instância gratuita do MongoDB Cloud, ou rodar o servidor de MongoDB localmente (instalação nativa ou via Docker).

Caso não queira criar uma instância no MongoDB Cloud, seguem instruções para configurar ambiente local: https://www.mongodb.com/docs/manual/installation/


- Adicionar URI da instância da MongoDB na variável MONGO_URI.
e.g. mongodb+srv://localhost:27017


## Instruções para testar

O servidor roda, por padrão, na porta 3000.

Nos pedaços de código abaixo, favor substituir a etiqueta: externalId pelo externalId do documento que precisar ser lido ou modificado.

Para facilitar o teste, pode-se criar um documento utilizando o primeiro exemplo, e anotar o externalId do documento criado para utilizar nas rotas subsequentes.

Essa API HTTP Web fornece 2 rotas estáticas e 1 rota dinâmica.

1. [Static] (CREATE): POST /
```sh
curl --request POST \
  --url http://localhost:3000/ \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/11.2.0' \
  --data '{
  "to": "12345",
  "body": "Hello world",
  "channel": "sms"
}'
```

2. [Static] (UPDATE): PATCH /
```sh
curl --request PATCH \
  --url http://localhost:3000/ \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/11.2.0' \
  --data '{
  "id": "${externalId}",
  "status": "sent"
}'
```


3. [Dynamic] (READ): GET /${externalId}
```sh
curl --request GET \
  --url http://localhost:3000/${externalId} \
  --header 'User-Agent: insomnia/11.2.0'
```


## Pensando nos próximos passos

### Caso a nossa aplicação fique indisponível por muito tempo, podemos perder eventos de mudança de status. Quais medidas você tomaria para deixar a aplicação mais robusta?

O ideal, sempre é garantir que a aplicação não se torne indisponível, ou que, ao menos, recupere-se rapidamente.

Para isso, podemos orquestrar o servidor com cães de guarda (e.g. PM2), bem como com Kubernetes, Swarm, ou conjuntos de réplicas da imagem do servidor.

Deveremos também, configurar um validador de saúde da aplicação, para garantir que, se após determinado número de tentativas, e após um periodo de tempo transcorrido, alguém seja alertado ou alguma ação mais sensível seja tomada (e.g. reiniciar serviços).

Além disso, podemos utilizar solucões como Redis, RabbitMQ ou afins, para construir nosso próprio OPLOG, criando mecanismos nos clientes (polling, sockets, localStorage, cookies), para re-tentar o envio até que a API torne-se disponível, e visando resolver o consenso com alguma abordagem já provada, como Paxos ou Raft.

Se a aplicação precisa garantir a consistência eventual, esse é um desafio historicamente documentado na ciência da computação em redes distribuídas e dificilmente alcançado sem o sacrifício da disponibilidade ou tolerância a falhas, conhecido como Teorema CAP.

### Precisamos enviar os eventos de mudança de status das notificações para um stream de eventos (e.g. Apache Kafka, Amazon Kinesis Data Streams, etc) para que outras aplicações possam consumí-los. Precisamos garantir que cada evento seja entregue pelo menos uma vez no stream. Como você faria esse processo?

Podemos manter nesse OPLOG o registro de quais eventos foram já enviados para o fluxo de eventos e quais já confirmaram a inserção no fluxo com sucesso.

Se o mais importante for garantir que o fluxo de eventos inclua todos os eventos, independente da ordem, um ciclo de coleta de lixo no nosso OPLOG, seja no próprio controlador dos envios para o fluxo ou no `crontab`, poderão garantir que nenhum evento fique parado na fila por muito tempo, permitindo que sejam realizadas novas tentativas de envio para o fluxo.


### Os eventos de mudança de estado podem vir eventualmente fora de ordem, caso o serviço externo de notificações demore para processar. Como você lidaria com isso?

Para gerir o consenso entre diversos eventos fora de ordem, precisamos de uma referência temporal ancilar. Esse referência, conquanto agnóstica das variações do ciclo de eventos do compilador que executa a função ou que mantêm o socket aberto, poderá garantir que o evento mais antigo ou o mais recente ganhe precedência na escrita ou leitura do OPLOG.

Para garantir que não entremos em concorrência de escrita ou leitura, ou em condições de corrida, podemos utilizar técnicas como o MuTex no controlador que ficará responsável por manipular a interface com a ferramenta de fluxo de dados utilizada.

Para os eventos que se tornem redundantes (um novo evento mais recente já foi emitido durante o período), podemos buscar ordenar os eventos antes mesmo de enviar para o gestor de fluxo de eventos, a fim de reduzir a complexidade temporal que viria com delegar para um lago de dados com volume muito superior, esse aferido ordenamento.

Podemos também garantir que o sistema de gestão de fluxo busque entender a sequencia dos eventos que lhe chegam à posteriori, garantindo que determinadas rotinas que seriam executadas em função de novos eventos possam ser interrompidas com a chegada de novos eventos. 



