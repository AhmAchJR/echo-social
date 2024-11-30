
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    userid INTEGER PRIMARY KEY AUTOINCREMENT,
    pass TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    handle TEXT NOT NULL UNIQUE,
    bio TEXT,
    username TEXT,
    pic TEXT
);

-- Create post table
CREATE TABLE IF NOT EXISTS post (
    postid INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER NOT NULL,
    content TEXT,
    visibility TEXT DEFAULT 'public',
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    commentid INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER NOT NULL,
    postid INTEGER NOT NULL,
    content TEXT,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    parentcommentid INTEGER,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (postid) REFERENCES post(postid),
    FOREIGN KEY (parentcommentid) REFERENCES comments(commentid)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    likeid INTEGER PRIMARY KEY AUTOINCREMENT,
    likename TEXT DEFAULT 'like',
    userid INTEGER NOT NULL,
    postid INTEGER NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (postid) REFERENCES post(postid)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notifyid INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER NOT NULL,
    notifytype TEXT,
    isread INTEGER DEFAULT 0,
    referenceid INTEGER,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    ntype TEXT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

-- Create chat table
CREATE TABLE IF NOT EXISTS chat (
    chatid INTEGER PRIMARY KEY AUTOINCREMENT,
    firstuserid INTEGER NOT NULL,
    secuserid INTEGER NOT NULL,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (firstuserid) REFERENCES users(userid),
    FOREIGN KEY (secuserid) REFERENCES users(userid)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    messageid INTEGER PRIMARY KEY AUTOINCREMENT,
    chatid INTEGER NOT NULL,
    senderid INTEGER NOT NULL,
    receiverid INTEGER NOT NULL,
    isread INTEGER DEFAULT 0,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    FOREIGN KEY (chatid) REFERENCES chat(chatid),
    FOREIGN KEY (senderid) REFERENCES users(userid),
    FOREIGN KEY (receiverid) REFERENCES users(userid)
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    imageid INTEGER PRIMARY KEY AUTOINCREMENT,
    postid INTEGER NOT NULL,
    imgurl TEXT NOT NULL,
    FOREIGN KEY (postid) REFERENCES post(postid)
);

-- Create userblocks table
CREATE TABLE IF NOT EXISTS userblocks (
    blockerid INTEGER NOT NULL,
    blockedid INTEGER NOT NULL,
    PRIMARY KEY (blockerid, blockedid),
    FOREIGN KEY (blockerid) REFERENCES users(userid),
    FOREIGN KEY (blockedid) REFERENCES users(userid)
);

-- Create userfollows table
CREATE TABLE IF NOT EXISTS userfollows (
    followerid INTEGER NOT NULL,
    followedid INTEGER NOT NULL,
    PRIMARY KEY (followerid, followedid),
    FOREIGN KEY (followerid) REFERENCES users(userid),
    FOREIGN KEY (followedid) REFERENCES users(userid)
);
