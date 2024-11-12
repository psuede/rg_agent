# rg_agent

This is a mono repository containing all the components that makes up the AI Reaper persona of the Reaper's Gambit project (https://www.reapersgambit.com).

The application is dockerized and consists of the following services:

| Service  | Description  |
| ------------ | ------------ |
|  ai | Contains the AI orchestration engine, making sequential calls to specialized models depending on the use case.  |
|  telegramhandler | Scrapes Telegram messages from groups and channels where the agent lives  |
|  orchestrator | Recieves events from the data ingestion and forwards to the appropriate target  |
|  xagent | Scrapes messages from X  |
|  postgres | Data storage of Telegram and X content   |
|  redis | Used as pub/sub message bus for the intra service communication, and keeps short and long term memory  |
|  adminer |  Database administration UI |

##Installation
- Set all the environment variables which are listed inside docker-compose.yml for each service on your system.
- Test settings: docker compose -f docker-compose.yml -up
- Production settings: docker compose -f docker-compose.dev.yml -up


## Testing
Local testing of the AI service is performed with the Robot framework (https://robotframework.org/) 

1. Install the Robot Framework: https://docs.robotframework.org/docs/getting_started/testing#install-robot-framework
2. Add the the following dependency:
``pip install robotframework-requests``
3. Run a test as follows (example: "chat1" from file testsuite.robot)
`/apps/ai/tests/robot -t chat1 testsuite.robot`