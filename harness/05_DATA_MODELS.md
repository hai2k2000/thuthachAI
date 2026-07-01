# Data Models

## Challenge

- `id`
- `week`
- `title`
- `shortTitle`
- `deadline`
- `status`
- `targetGroup`
- `description`
- `requirements`
- `deliverables`
- `submissionLink`

## Prompt

- `id`
- `title`
- `category`
- `department`
- `contributor`
- `tool`
- `difficulty`
- `purpose`
- `context`
- `fullPrompt`
- `usageSteps`
- `sampleInput`
- `sampleOutput`
- `notes`
- `applicableDepartments`
- `tags`
- `week`
- `status`
- `updatedAt`

## Submission

- `id`
- `title`
- `participantName`
- `department`
- `week`
- `group`
- `aiTools`
- `problem`
- `processSummary`
- `mainPrompt`
- `finalResult`
- `beforeAI`
- `afterAI`
- `lessons`
- `recommendations`
- `score`
- `award`
- `promptIds`
- `fileLink`
- `tags`
- `isScalable`
- `isPromptPublic`

## SubmissionIntake

- `id`
- `createdAt`
- `participantName`
- `department`
- `contact`
- `email`
- `week`
- `challengeGroup`
- `title`
- `aiTools`
- `problem`
- `processSummary`
- `mainPrompt`
- `finalResult`
- `lessons`
- `recommendations`
- `publicPrompt`
- `files`

## LeaderboardItem

- `rank`
- `name`
- `department`
- `submissionTitle`
- `week`
- `score`
- `award`
- `badge`
- `status`

## DepartmentScore

- `department`
- `submissionCount`
- `promptCount`
- `averageScore`
- `featuredSubmission`

## AITool

- `name`
- `purpose`
- `suitableFor`
- `notes`

## Badge

- `name`
- `description`
- `tone`
