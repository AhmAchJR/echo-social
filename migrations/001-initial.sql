/*sysobjects: This is a system table in SQL Server that contains information about all the objects in the database
(tables, views, procedures, etc.).*/

-- 001-initial.sql

-- Create Migrations Table

-- Check if the migrations table exists, and create it if not
-- Ensure the 'migrations' table exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'migrations' AND xtype = 'u')
BEGIN
    CREATE TABLE [migrations] (
        [id] INT PRIMARY KEY IDENTITY(1,1),
        [migrationname] VARCHAR(255) NOT NULL,
        [applaiedat] DATETIME DEFAULT GETDATE()
    );
END

-- Check if the migration script has already been applied
IF NOT EXISTS (SELECT * FROM [migrations] WHERE [migrationname] = '001-initial.sql')
BEGIN
    -- Create tables
    CREATE TABLE [users] (
        [userid] INT PRIMARY KEY IDENTITY,
        [pass] NVARCHAR(255) NOT NULL,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [handle] NVARCHAR(255) NOT NULL UNIQUE,
        [bio] NVARCHAR(255),
        [username] NVARCHAR(255),
        [pic] NVARCHAR(255)
    );

    CREATE TABLE [post] (
        [postid] INT PRIMARY KEY IDENTITY(1,1),
        [userid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [content] NVARCHAR(MAX),
        [visibility] NVARCHAR(20) DEFAULT 'public',
        [createdat] DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE [comments] (
        [commentid] INT PRIMARY KEY IDENTITY(1,1),
        [userid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [postid] INT FOREIGN KEY REFERENCES [post]([postid]),
        [content] NVARCHAR(MAX),
        [createdat] DATETIME DEFAULT GETDATE(),
        [parentcommentid] INT NULL FOREIGN KEY REFERENCES [comments]([commentid])
    );

    CREATE TABLE [likes] (
        [likeid] INT PRIMARY KEY IDENTITY(1,1),
        [likename] VARCHAR(20) DEFAULT 'like',
        [userid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [postid] INT FOREIGN KEY REFERENCES [post]([postid])
    );

    CREATE TABLE [notifications] (
        [notifyid] INT PRIMARY KEY IDENTITY(1,1),
        [userid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [notifytype] VARCHAR(20),
        [isread] BIT DEFAULT 0,
        [referenceid] INT,
        [createdat] DATETIME DEFAULT GETDATE(),
        [ntype] NVARCHAR(50) NOT NULL,
        CONSTRAINT [CK_Notifications_Type] CHECK ([ntype] IN ('comment', 'like', 'message', 'follow'))
    );

    CREATE TABLE [chat] (
        [chatid] INT PRIMARY KEY IDENTITY(1,1),
        [firstuserid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [secuserid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [createdat] DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE [messages] (
        [messageid] INT PRIMARY KEY IDENTITY(1,1),
        [chatid] INT FOREIGN KEY REFERENCES [chat]([chatid]),
        [senderid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [receiverid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [isread] BIT DEFAULT 0,
        [createdat] DATETIME DEFAULT GETDATE(),
        [content] NVARCHAR(MAX) NOT NULL
    );

    CREATE TABLE [images] (
        [imageid] INT PRIMARY KEY IDENTITY(1,1),
        [postid] INT FOREIGN KEY REFERENCES [post]([postid]),
        [imgurl] NVARCHAR(255) NOT NULL
    );

    CREATE TABLE [userblocks] (
        [blockerid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [blockedid] INT FOREIGN KEY REFERENCES [users]([userid]),
        PRIMARY KEY ([blockerid], [blockedid])
    );

    CREATE TABLE [userfollows] (
        [followerid] INT FOREIGN KEY REFERENCES [users]([userid]),
        [followedid] INT FOREIGN KEY REFERENCES [users]([userid]),
        PRIMARY KEY ([followerid], [followedid])
    );

    -- Insert the applied migration record
    INSERT INTO [migrations] ([migrationname]) VALUES ('001-initial.sql');
END



/*
The error message Incorrect syntax near the keyword 'user' indicates that there is a problem with the SQL syntax in your migration script,
specifically involving the word user. In SQL Server, USER is a reserved keyword, 
so using it as an identifier (such as a table or column name) without proper escaping can cause syntax errors.

Fixing the SQL Syntax Error
To resolve this issue, you should:

Escape Reserved Keywords: Use square brackets [] to escape reserved keywords like USER. For instance, 
if you have a table or column named User, it should be written as [User] in your SQL script.
*/



/*
is [] resolve reserved word ,so that i can make objects with the same name 
ChatGPT said:
ChatGPT
Yes, using square brackets ([]) in SQL Server allows you to work with reserved words and 
other identifiers that might otherwise cause conflicts. Here's how it works:

How Square Brackets Work
Handling Reserved Words: Reserved words (e.g., user, order, select) can be used as identifiers for tables, columns,
or other objects if they are enclosed in square brackets. For example, 
[user] can be used as a table name even though USER is a reserved word.

Special Characters and Spaces: If your identifier includes special characters or spaces,
you also need to use square brackets. For instance, [employee details] is valid for a table name.

Case Sensitivity: While SQL Server is generally case-insensitive by default, 
using square brackets ensures that the identifier is treated exactly as specified. 
This is useful in environments where case sensitivity is configured.

Practical Usage
Creating Tables and Columns: When creating tables or columns with names that are reserved words, 
always use square brackets.

Referencing: Similarly, 
when referencing these objects in SQL queries or constraints, use square brackets to avoid ambiguity.
*/