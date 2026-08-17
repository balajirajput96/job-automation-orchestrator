CREATE TABLE `workflow_control_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`action` varchar(64) NOT NULL,
	`outcome` varchar(64) NOT NULL,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_control_events_id` PRIMARY KEY(`id`)
);
