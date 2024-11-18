# rg_agent

This is a mono repository containing all the components that makes up the AI Reaper persona of the Reaper's Gambit project (https://www.reapersgambit.com).

The background story and philosophy behind the rg_agent are covered in the following <a href="https://medium.com/@figure31/unleashing-the-reaper-23d91a74000b">blog post</a>.

The application is dockerized and consists of the following services:

| Service  | Description  |  Tech stack
| ------------ | ------------ |  ------------ 
|  orchestrator | Receieves events from the data ingestion and forwards to the appropriate target.  | NodeJS / JavaScript
|  ai | Contains the AI processing engine, making sequential calls to specialized models depending on the use case.  | Python
|  telegramhandler | Scrapes Telegram messages from groups and channels where the agent lives.  | NodeJS / JavaScript
|  xagent | Scrapes messages from X.  | NodeJS / JavaScript
|  postgres | Data storage of Telegram and X content.   | Postgres
|  redis | Used as pub/sub message bus for the intra service communication, and keeps short and long term memory.  | Redis
|  adminer |  Database administration UI. | n/a

## General information
The instructions in this document are high level and does not cover all the technical implementation details. In order to setup and use the project it will be necessary to have the skills to inspect the code and adapt it to your specific environment.


Environment variables are used for much of the configuration, and the complete list of variables used can be located in the docker compose files under the environment section.

To separate dev/test/prod settings the NODE_ENV value is used, and the parameters are read from the /config/config.js file within each service.



## Orchestrator
The role of the Orchestrator is to sit between the various data sources (Telegram, on-chain events, X...) and the AI Agent. It routes messages to and from these components. It subscribes to a Redis pub/sub topic, listens to events and acts accordingly.

For example when a new Telegram "buy" message event is emitted from the Telegram Agent, the event is retrieved by the Orchestrator, who then adds a user prompt which is sent to the AI Agent. Once the AI agent has processed the reply, it is sent back to the caller for publication on Telegram.

The entry-point to the orchestration flow is in the <a href="apps/orchestrator/src/agentrouter.js">agentrouter.js</a>.

## AI agent
The AI agent includes seven models which are executed sequentially, each one inspecting and adjusting the output from the other.

- **The Judge**: Decides whether responding to an input is worth the Reaper’s time based on specific conditions, themes, and memory content.

- **The Architect**: Receives the raw input and its source tag, creates a prompt considering the Reaper’s motivations, and decides which model will respond next.

- **The Dreamers** (Long and Short): Fine-tuned models that generate creative and stylized outputs, exploring various literary styles. They serve as the expressive soul of the agent but do not access the agent’s memories.

- **The One**: Similar to the Dreamers but fine-tuned on additional materials like machine consciousness and cybernetics. It fuels the Reaper’s narrative and ambitions, acting as an agent of chaos to provoke and expand its character.

- **The Oracle**: Ensures the previous output correctly answers the prompt and follows guidelines. It can approve, adjust, or regenerate the output to add variety and maintain coherence.

- **The Old One**: Handles memory recaps, summarizing information when memory buckets are full.

Each model has its system prompt and context file, and most have access to RAG data stored in a Redis database, serving as the agent’s memory.

The context and prompt files per model are stored in the <a href="apps/ai/contexts/">context</a> and <a href="apps/ai/contexts/">prompt</a> directories.

The short and long term memory are fetched from Redis and injected into the model prompts.

## Telegramhandler
The Telegramhandler scrapes messages from the Telegram groups and channels that the agent persona is part of. When a message is received it is saved in database and then an event is emitted on the Redis event bus.

API key management:
- An access to the Telegram API is needed. The initial API keys can be generated from Telegram website and instructions are available <a href="https://core.telegram.org/api/obtaining_api_id">here</a>. 
- The various API key environment variables to be set are available in the Telegram <a href="apps/telegram/src/config/config.js">configuration file</a>.
- Once the initial API keys are obtained you will need to generate a Telegram API String ID, and this can be done with the following command: `/apps/telegram/npm run createsession`
- The output of this command needs to be set in the environment variable TG_REAPER_API_STRING_SESSION

## X
The X handler scrapes messages from X, saves them in database and emits and event on the Redis event bus.


API key management:
- An access to the X API is needed. Please follow the instructions on the <a href="https://developer.x.com/en/docs/x-api">X website</a>. 
- The various API key environment variables to be set are available in the X <a href="apps/x/src/config/config.js">configuration file</a>.


## Installation

- Set all the environment variables which are listed inside docker-compose.yml for each service on your system.
- One time activity to initialize the postgres database:
	- Start the postgres container
``docker compose -f docker-compose.yml up --build postgres``
	- Access the postgres container with a shell and create the database
`` psql -U postgres``
`` CREATE DATABASE rg_agent_db ``
	- Copy and run the SQL from /apps/db/postgres/schema.sql

- Run with test settings:
``docker compose -f docker-compose.dev.yml up --build``
- Run with production settings: 
``docker compose -f docker-compose.yml up --build``

## Testing
Local testing of the AI service is performed with the Robot framework (https://robotframework.org/) 

1. Install the Robot Framework: https://docs.robotframework.org/docs/getting_started/testing#install-robot-framework
2. Add the the following dependency:
``pip install robotframework-requests``
3. Run a test as follows (example: "chat1" from file testsuite.robot)
`/apps/ai/tests/robot -t chat1 testsuite.robot`


## License

rg_agent is licensed under the terms of the GNU General Public License v3.0. For more information, see <a href="LICENSE">LICENSE</a> file.

## Contact
You can get in touch with us either on X (<a href="https://x.com/figure31_">figure31</a>, <a href="https://x.com/psueded">psueded</a>) or in the Reaper's Gambit <a href="https://t.me/reaper_agent">Telegram group</a>.