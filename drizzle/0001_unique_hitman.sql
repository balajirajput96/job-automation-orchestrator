CREATE TABLE `workflow_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`heartbeatTaskUid` varchar(65),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `workflow_settings_ownerOpenId_unique` UNIQUE(`ownerOpenId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','user') NOT NULL DEFAULT 'user';