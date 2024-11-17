
DROP TABLE IF EXISTS "PromptMessage";
CREATE TABLE "public"."PromptMessage" (
    "timestamp" bigint NOT NULL,
    "content" character varying NOT NULL,
    "userid" bigint NOT NULL,
    "type" character varying NOT NULL
) WITH (oids = false);

CREATE INDEX "PromptMessage_timestamp" ON "public"."PromptMessage" USING btree ("timestamp");

CREATE INDEX "PromptMessage_type" ON "public"."PromptMessage" USING btree ("type");


DROP TABLE IF EXISTS "TelegramMessage";
CREATE TABLE "public"."TelegramMessage" (
    "groupid" bigint NOT NULL,
    "content" character varying NOT NULL,
    "timestamp" bigint NOT NULL,
    "media" boolean NOT NULL,
    "userid" bigint NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "messageid_reaperbot" integer,
    "messageid_reaper" integer,
    "replyto_messageid_reaper" integer
) WITH (oids = false);

CREATE INDEX "TelegramMessage_groupid" ON "public"."TelegramMessage" USING btree ("groupid");

CREATE INDEX "TelegramMessage_groupid_content" ON "public"."TelegramMessage" USING btree ("groupid", "content");

CREATE INDEX "TelegramMessage_groupid_userid" ON "public"."TelegramMessage" USING btree ("groupid", "userid");

CREATE INDEX "TelegramMessage_timestamp" ON "public"."TelegramMessage" USING btree ("timestamp");

CREATE INDEX "TelegramMessage_userid" ON "public"."TelegramMessage" USING btree ("userid");

DROP TABLE IF EXISTS "TelegramMessageEntity";
CREATE TABLE "public"."TelegramMessageEntity" (
    "messageid" integer NOT NULL,
    "entityid" bigint NOT NULL
) WITH (oids = false);


DROP TABLE IF EXISTS "TelegramUser";
CREATE TABLE "public"."TelegramUser" (
    "userid" bigint NOT NULL,
    "username" character varying,
    "firstname" character varying,
    "lastname" character varying,
    "isbot" boolean NOT NULL
) WITH (oids = false);

CREATE UNIQUE INDEX userid_firstname ON "TelegramUser" (userid, firstname) NULLS NOT DISTINCT;
CREATE INDEX "TelegramUser_userid" ON "public"."TelegramUser" USING btree ("userid");

DROP TABLE IF EXISTS "UserSettings";
CREATE TABLE "public"."UserSettings" (
    "userid" bigint NOT NULL,
    "caninteract" boolean NOT NULL
) WITH (oids = false);

CREATE INDEX "UserSettings_userid" ON "public"."UserSettings" USING btree ("userid");

DROP TABLE IF EXISTS "Tweet";
CREATE TABLE "public"."Tweet" (
    "tweetid" character varying NOT NULL,
    "conversationid" character varying,
    "likes" integer,
    "bookmarkcount" integer,
    "name" character varying,
    "replies" integer,
    "retweets" integer,
    "text" character varying NOT NULL,
    "userid" bigint,
    "username" character varying,
    "isquoted" boolean,
    "isreply" boolean,
    "isretweet" boolean,
    "ispin" boolean,
    "sensitivecontent" boolean,
    "timestamp" integer,
    "html" character varying,
    CONSTRAINT "Tweet_tweetid" PRIMARY KEY ("tweetid")
) WITH (oids = false);

CREATE INDEX "Tweet_userid" ON "public"."Tweet" USING btree ("userid");
CREATE INDEX "Tweet_username" ON "public"."Tweet" USING btree ("username");

CREATE TYPE AiActor AS ENUM ('The Judge', 'The Oracle', 'The Dreamer', 
'The One');

CREATE ROLE rg_agent_db_user WITH LOGIN PASSWORD 'REPLACE_ME';

-- Grant privileges
GRANT CONNECT ON DATABASE rg_agent_db TO rg_agent_db_user;
GRANT USAGE ON SCHEMA public TO rg_agent_db_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rg_agent_db_user;

-- Apply privileges to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO rg_agent_db_user;

