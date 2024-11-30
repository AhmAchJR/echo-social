
-- Migration: Add userrequests table
CREATE TABLE IF NOT EXISTS userrequests (
    requestid INTEGER PRIMARY KEY AUTOINCREMENT,
    senderid INTEGER NOT NULL,
    receiverid INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderid) REFERENCES users(userid),
    FOREIGN KEY (receiverid) REFERENCES users(userid)
);
