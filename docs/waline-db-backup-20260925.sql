PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "wl_Comment" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "user_id" INTEGER,
  "comment" TEXT,
  "orig" TEXT,
  "insertedAt" TEXT DEFAULT (datetime('now')),
  "ip" TEXT,
  "link" TEXT,
  "mail" TEXT,
  "nick" TEXT,
  "pid" INTEGER,
  "rid" INTEGER,
  "sticky" INTEGER DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "like" INTEGER DEFAULT 0,
  "ua" TEXT,
  "url" TEXT,
  "createdAt" TEXT DEFAULT (datetime('now')),
  "updatedAt" TEXT DEFAULT (datetime('now'))
);
INSERT INTO "wl_Comment" ("id","user_id","comment","orig","insertedAt","ip","link","mail","nick","pid","rid","sticky","status","like","ua","url","createdAt","updatedAt") VALUES(1,NULL,'<p>hi</p>',replace('hi\n','\n',char(10)),'2026-09-25 08:43:37','157.254.38.168','','','匿名',NULL,NULL,0,'approved',0,'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0','/','2026-09-25 08:43:37','2026-09-25 08:43:37');
INSERT INTO "wl_Comment" ("id","user_id","comment","orig","insertedAt","ip","link","mail","nick","pid","rid","sticky","status","like","ua","url","createdAt","updatedAt") VALUES(5,1,'<p>rise my friends</p>',replace('rise my friends\n','\n',char(10)),'2026-09-25 09:07:53','157.254.38.168','https://github.com/wwwcjj','13728533155@163.com','wwwcjj',NULL,NULL,0,'approved',0,'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0','/yinming-literature-club/discussion.html','2026-09-25 09:07:53','2026-09-25 09:07:53');
CREATE TABLE IF NOT EXISTS "wl_Counter" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "time" INTEGER DEFAULT 0,
  "reaction0" INTEGER DEFAULT 0,
  "reaction1" INTEGER DEFAULT 0,
  "reaction2" INTEGER DEFAULT 0,
  "reaction3" INTEGER DEFAULT 0,
  "reaction4" INTEGER DEFAULT 0,
  "reaction5" INTEGER DEFAULT 0,
  "reaction6" INTEGER DEFAULT 0,
  "reaction7" INTEGER DEFAULT 0,
  "reaction8" INTEGER DEFAULT 0,
  "url" TEXT NOT NULL,
  "createdAt" TEXT DEFAULT (datetime('now')),
  "updatedAt" TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS "wl_Users" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "display_name" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "password" TEXT NOT NULL DEFAULT '',
  "type" TEXT NOT NULL DEFAULT 'guest',
  "label" TEXT DEFAULT '',
  "url" TEXT DEFAULT '',
  "avatar" TEXT DEFAULT '',
  "github" TEXT DEFAULT '',
  "twitter" TEXT DEFAULT '',
  "facebook" TEXT DEFAULT '',
  "google" TEXT DEFAULT '',
  "weibo" TEXT DEFAULT '',
  "qq" TEXT DEFAULT '',
  "2fa" TEXT DEFAULT '',
  "createdAt" TEXT DEFAULT (datetime('now')),
  "updatedAt" TEXT DEFAULT (datetime('now'))
);
INSERT INTO "wl_Users" ("id","display_name","email","password","type","label","url","avatar","github","twitter","facebook","google","weibo","qq","2fa","createdAt","updatedAt") VALUES(1,'wwwcjj','13728533155@163.com','','administrator','','https://github.com/wwwcjj','https://avatars.githubusercontent.com/u/278610647?v=4','wwwcjj','','','','','','','2026-09-25 08:58:38','2026-09-25 08:58:38');
CREATE TABLE IF NOT EXISTS "wl_Settings" (
  "key" TEXT PRIMARY KEY,
  "value" TEXT NOT NULL DEFAULT '',
  "updatedAt" TEXT DEFAULT (datetime('now'))
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('wl_Comment',5);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('wl_Users',2);
CREATE INDEX "idx_comment_url" ON "wl_Comment" ("url");
CREATE INDEX "idx_comment_status" ON "wl_Comment" ("status");
CREATE INDEX "idx_comment_rid" ON "wl_Comment" ("rid");
CREATE INDEX "idx_comment_pid" ON "wl_Comment" ("pid");
CREATE INDEX "idx_comment_user_id" ON "wl_Comment" ("user_id");
CREATE INDEX "idx_comment_insertedAt" ON "wl_Comment" ("insertedAt");
CREATE UNIQUE INDEX "idx_counter_url" ON "wl_Counter" ("url");
CREATE UNIQUE INDEX "idx_users_email" ON "wl_Users" ("email");
