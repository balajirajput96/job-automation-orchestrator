CREATE TABLE `engineering_maintenance_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`heartbeatTaskUid` varchar(65) NOT NULL,
	`scheduledHour` varchar(32) NOT NULL,
	`executionNumber` int NOT NULL,
	`action` varchar(80) NOT NULL,
	`result` varchar(32) NOT NULL,
	`validationStatus` varchar(32) NOT NULL,
	`failureCategory` varchar(64),
	`recoveryAttempt` int NOT NULL DEFAULT 0,
	`detail` text NOT NULL,
	`remainingBlocker` text,
	`nextRecommendedAction` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engineering_maintenance_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `engineering_maintenance_hour_unique` UNIQUE(`heartbeatTaskUid`,`scheduledHour`)
);
--> statement-breakpoint
CREATE INDEX `engineering_maintenance_task_created_idx` ON `engineering_maintenance_runs` (`heartbeatTaskUid`,`createdAt`);