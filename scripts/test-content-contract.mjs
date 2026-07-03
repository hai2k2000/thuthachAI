import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const data = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const components = fs.readFileSync(path.join(root, 'src/components.tsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server/index.mjs'), 'utf8');
const adminAudit = fs.readFileSync(path.join(root, 'server/admin-audit.mjs'), 'utf8');
const apiErrors = fs.readFileSync(path.join(root, 'server/api-errors.mjs'), 'utf8');
const sqliteErrors = fs.readFileSync(path.join(root, 'server/sqlite-errors.mjs'), 'utf8');
const requestIp = fs.readFileSync(path.join(root, 'server/request-ip.mjs'), 'utf8');
const uploadSecurity = fs.readFileSync(path.join(root, 'server/upload-security.mjs'), 'utf8');
const backupProduction = fs.readFileSync(path.join(root, 'scripts/backup-production.mjs'), 'utf8');
const nginxConfig = fs.readFileSync(path.join(root, 'deploy/ai-challenge-hub.conf'), 'utf8');
const harnessDir = path.join(root, 'harness');

const requiredRoutes = [
  '/',
  '/challenges',
  '/challenges/newsroom-next',
  '/submit',
  '/rules',
  '/prompts',
  '/featured',
  '/leaderboard',
  '/ai-lab',
  '/ai-news',
  '/ai-news/ai-newsroom-workflow',
  '/forum',
  '/contact',
  '/admin',
  '/search',
];

const requiredHarness = [
  '01_PROJECT_BRIEF.md',
  '02_CONTENT_SOURCE.md',
  '03_ROUTE_MAP.md',
  '04_UI_CONTRACT.md',
  '05_DATA_MODELS.md',
  '06_ACCEPTANCE_CRITERIA.md',
  '07_QA_CHECKLIST.md',
  '08_AGENT_WORKFLOW.md',
  '09_TEST_PLAN.md',
  '10_RELEASE_CHECKLIST.md',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const file of requiredHarness) {
  assert(fs.existsSync(path.join(harnessDir, file)), `Missing harness file: ${file}`);
}

assert(fs.existsSync(path.join(root, 'AGENTS.md')), 'Missing AGENTS.md');

for (const route of requiredRoutes) {
  assert(data.includes(`'${route}'`) || app.includes(`'${route}'`) || app.includes(`"${route}"`), `Missing route reference: ${route}`);
}

for (const phrase of [
  'Nghiên cứu và phát triển các thể loại báo chí hiện đại',
  'Xây dựng hệ thống lưu trữ văn bản và dữ liệu thông minh',
  'Chuyển hóa ý tưởng thành sản phẩm truyền thông có khả năng thương mại hóa',
  '15h ngày 06/7/2026',
  'Tiêu chí chấm điểm 100 điểm',
  'Form nộp bài trực tiếp',
  'Nhật ký tác nghiệp',
  'File bài dự thi',
  'File minh chứng',
  'Lưu trên VPS',
  'Dashboard Ban tổ chức',
  'Quyết định của Ban Giám khảo là quyết định cuối cùng',
  'Không đưa thông tin mật',
  'Nguyễn Duy Đông',
  'Bài dự thi mẫu',
  '/samples/bai-du-thi-nhom-tong-hop-nguyen-duy-dong.docx',
]) {
  assert(`${data}\n${app}`.includes(phrase), `Missing required content phrase: ${phrase}`);
}

const promptCount = (data.match(/id: '[a-z0-9-]+',\n\s+title: 'Prompt/g) || []).length;
assert(promptCount >= 8, `Expected at least 8 prompts, found ${promptCount}`);

const submissionCount = (data.match(/participantName:/g) || []).length;
assert(submissionCount >= 6, `Expected at least 6 submissions, found ${submissionCount}`);

for (const behavior of ['navigator.clipboard.writeText', 'SearchInput', 'SelectFilter', 'EmptyState', 'PromptDetail', 'SubmissionDetail', 'ChallengeDetail']) {
  assert(`${app}\n${components}`.includes(behavior), `Missing behavior/component: ${behavior}`);
}
assert(
  /href="\/prompts"[\s\S]{0,180}Khám phá kho Prompt[\s\S]{0,180}href="\/rules"[\s\S]{0,120}Thể lệ cuộc thi/.test(app),
  'Home hero must show a contest rules button next to the prompt library button',
);

for (const challengeCardHook of ['challengeGroupBadge', 'targetGroup']) {
  assert(`${app}\n${components}\n${styles}`.includes(challengeCardHook), `Missing challenge card group hook: ${challengeCardHook}`);
}

for (const submissionGroupOption of ['Nhóm Phóng viên, Biên tập viên', 'Nhóm Tổng hợp', 'Nhóm Kinh doanh', 'Nhóm dự thi']) {
  assert(app.includes(submissionGroupOption), `Missing submission group option: ${submissionGroupOption}`);
}
assert(!app.includes('Nhóm nhiệm vụ khác'), 'Submission form must only expose the three official groups');

const departmentOptionsMatch = app.match(/const departmentOptions = \[([\s\S]*?)\];/);
assert(departmentOptionsMatch, 'Submission form must define departmentOptions');
const departmentOptions = Array.from(departmentOptionsMatch[1].matchAll(/'([^']+)'/g), (match) => match[1]);
assert(
  JSON.stringify(departmentOptions) === JSON.stringify(['Ban lãnh đạo', 'Phòng Nội dung', 'Phòng Tổng hợp']),
  `Submission form must only expose the three official department options, found: ${departmentOptions.join(', ')}`,
);

for (const vietnameseBadge of ['Người khởi đầu AI', 'Người xây dựng prompt', 'Người tạo quy trình AI', 'Nhà sáng tạo AI', 'Nhà vô địch AI', 'Bậc thầy prompt', 'Đại sứ AI']) {
  assert(`${data}\n${app}`.includes(vietnameseBadge), `Missing Vietnamese badge label: ${vietnameseBadge}`);
}
for (const englishBadge of ['AI Starter', 'Prompt Builder', 'Workflow Maker', 'AI Innovator', 'AI Champion', 'Prompt Master', 'AI Ambassador', 'Badge/huy hiệu']) {
  assert(!`${data}\n${app}`.includes(englishBadge), `Badge labels must be Vietnamese, found: ${englishBadge}`);
}

for (const coverImageHook of ['coverImage', 'Ảnh đại diện bài dự thi', 'coverImageInput', '/api/submissions/covers/:storedName', 'Tự tạo ảnh đại diện từ file bài dự thi']) {
  assert(`${app}\n${server}\n${components}`.includes(coverImageHook), `Missing submission cover image hook: ${coverImageHook}`);
}

const desktopNavStyles = styles.match(/\.desktopNav a\s*{[^}]*}/)?.[0] || '';
assert(desktopNavStyles.includes('white-space: nowrap;'), 'Desktop nav links must stay on one line');
assert(desktopNavStyles.includes('font-size: 15px;'), 'Desktop nav links must use a larger readable font size');
assert(desktopNavStyles.includes('font-weight: 900;'), 'Desktop nav links must be visually bold');
const navItemsBlock = components.match(/const navItems = \[([\s\S]*?)\];/)?.[1] || '';
assert(!navItemsBlock.includes('Bài tiêu biểu'), 'Desktop nav must hide the featured submissions menu item');
assert(!navItemsBlock.includes("href: '/ai-news'"), 'Header menu must hide AI news');
assert(!navItemsBlock.includes("href: '/forum'"), 'Header menu must hide AI forum');
const mobileNavStyles = [...styles.matchAll(/\.mobileMenuPanel nav a\s*{[^}]*}/g)]
  .map((match) => match[0])
  .find((block) => block.includes('padding: 14px 12px;')) || '';
assert(mobileNavStyles.includes('font-size: 16px;'), 'Mobile nav links must use a larger readable font size');
assert(mobileNavStyles.includes('font-weight: 900;'), 'Mobile nav links must be visually bold');
for (const headerRowHook of ['headerMainRow', 'headerNavRow', 'headerActionsRow']) {
  assert(`${components}\n${styles}`.includes(headerRowHook), `Header must separate utility actions into their own row: ${headerRowHook}`);
}
assert(styles.includes('.headerActionsRow .smallButton'), 'Header utility actions must stay compact in their own row');

for (const countdownLayout of ['countdownGrid', 'countdownUnit', 'countdownValue', 'countdownLabel']) {
  assert(app.includes(countdownLayout), `Missing countdown layout hook: ${countdownLayout}`);
  assert(styles.includes(`.${countdownLayout}`), `Missing countdown style hook: ${countdownLayout}`);
}

for (const countdownUpgrade of ['countdownHeader', 'countdownBadge', 'countdownDeadline', 'countdownAction', 'countdownCta']) {
  assert(app.includes(countdownUpgrade), `Missing professional countdown hook: ${countdownUpgrade}`);
  assert(styles.includes(`.${countdownUpgrade}`), `Missing professional countdown style: ${countdownUpgrade}`);
}
assert(styles.includes('margin: 0 auto 24px;'), 'Countdown banner must keep horizontal auto margins inside full-width bands');
const countdownBannerStyles = styles.match(/\.countdownBanner\s*{[^}]*}/)?.[0] || '';
const countdownValueStyles = styles.match(/\.countdownValue,[^}]*\.countdownExpired\s*{[^}]*}/)?.[0] || '';
assert(countdownBannerStyles.includes('background: #fff;') && countdownBannerStyles.includes('border-color: var(--primary-soft);'), 'Countdown banner must use a red-white brand container');
assert(countdownValueStyles.includes('color: var(--primary);'), 'Countdown values must use the red brand color');

for (const adminLoginHook of ['loginButton', 'adminLoginPanel', 'adminToolbar', '/api/admin/login', 'aiChallengeAdminUser']) {
  assert(`${app}\n${components}`.includes(adminLoginHook), `Missing admin login hook: ${adminLoginHook}`);
}
assert(app.includes("window.sessionStorage.getItem('aiChallengeAdminToken')"), 'Admin token must be restored from sessionStorage only');
assert(!app.includes("window.localStorage.getItem('aiChallengeAdminToken')"), 'Admin token must not be restored from persistent localStorage');
assert(!app.includes("window.localStorage.setItem('aiChallengeAdminToken'"), 'Admin token must not be persisted in localStorage');

for (const adminDashboardHook of ['adminOverviewGrid', 'adminSidebarNav', 'adminScorePanel', 'adminUserPanel', 'adminUserForm', '/api/admin/users']) {
  assert(`${app}\n${styles}\n${server}`.includes(adminDashboardHook), `Missing admin dashboard hook: ${adminDashboardHook}`);
}
for (const adminSecurityHook of ['createAdminSessionToken', 'verifyAdminSessionToken', 'requireAdminRole', "requireAdminRole(['admin'])", "requireAdminRole(['admin', 'judge'])"]) {
  assert(server.includes(adminSecurityHook) || app.includes(adminSecurityHook), `Missing admin RBAC/session hook: ${adminSecurityHook}`);
}
for (const adminRevocationHook of ['resolveAdminSessionUser', 'findAdminUserById.get(session.user.id)', "currentUser.status !== 'active'", 'request.adminUser = currentUser', 'validateLastActiveAdminChange']) {
  assert(server.includes(adminRevocationHook), `Admin RBAC must re-check current user state before authorizing: ${adminRevocationHook}`);
}
assert(!server.includes('request.query.token'), 'Admin token must not be accepted in query strings');
assert(!app.includes('export.csv?token='), 'CSV export must not put admin token in the URL');
assert(!`${app}\n${server}`.includes('?token=${'), 'Admin file/download URLs must not contain query-string tokens');
for (const adminDownloadHook of ['downloadAdminCsv', 'downloadAdminFile', 'URL.createObjectURL', "'x-admin-token': token"]) {
  assert(app.includes(adminDownloadHook), `Admin downloads must use authenticated fetch headers: ${adminDownloadHook}`);
}
assert(/canManageUsers\s*\?\s*\(\s*<a className=\{activeAdminView === 'users'/s.test(app), 'User management sidebar link must only render for admin role');
assert(app.includes("activeAdminView === 'users' && canManageUsers"), 'User management panel must only render for admin role');
for (const apiHardeningHook of ['normalizeApiError(error', "error?.type === 'entity.parse.failed'", 'validateUploadedImageSignatures(uploadedFiles)', 'normalizeSubmissionReviewPatch(request.body, current)']) {
  assert(`${server}\n${apiErrors}\n${uploadSecurity}`.includes(apiHardeningHook), `Missing API hardening hook: ${apiHardeningHook}`);
}
for (const uploadSignatureHook of ['detectImageSignature', "'RIFF'", "'WEBP'", 'File anh']) {
  assert(uploadSecurity.includes(uploadSignatureHook), `Missing upload signature validation hook: ${uploadSignatureHook}`);
}
for (const adminAuditHook of ['admin_audit_logs', 'insertAdminAuditLog', 'listAdminAuditLogs', '/api/admin/audit-logs', 'logAdminAudit(request', 'toPublicAdminAuditLog']) {
  assert(`${server}\n${adminAudit}`.includes(adminAuditHook), `Missing admin audit log hook: ${adminAuditHook}`);
}
for (const adminAuditAction of ['admin.login.success', 'admin.login.failed', 'submission.review.update', 'admin.user.create', 'admin.user.update']) {
  assert(server.includes(adminAuditAction), `Missing admin audit action: ${adminAuditAction}`);
}
for (const adminAuditUiHook of ['adminAuditPanel', 'adminAuditLogs', '/api/admin/audit-logs', '#admin-audit']) {
  assert(app.includes(adminAuditUiHook), `Missing admin audit UI hook: ${adminAuditUiHook}`);
}
for (const sqliteRaceHook of ['isSqliteUniqueConstraintError', 'sendDuplicateCommunityVote(response', 'Tai khoan quan tri da ton tai.']) {
  assert(`${server}\n${sqliteErrors}`.includes(sqliteRaceHook), `Missing sqlite race handling hook: ${sqliteRaceHook}`);
}
for (const requestIpHook of ["request.get?.('x-real-ip')", "request.get?.('x-forwarded-for')", 'forwardedFor.at(-1)']) {
  assert(requestIp.includes(requestIpHook), `Missing spoof-resistant request IP hook: ${requestIpHook}`);
}

for (const adminLayoutHook of ['isAdminRoute', 'adminApp', 'adminSidebar', 'adminMain', 'adminOverviewPanel']) {
  assert(`${app}\n${styles}`.includes(adminLayoutHook), `Missing standalone admin layout hook: ${adminLayoutHook}`);
}
assert(!app.includes('className="adminModuleNav"'), 'Admin content must not duplicate sidebar navigation');
for (const adminOverviewLink of ['adminQuickLinks', '#admin-submissions', '#admin-scoring', '#admin-users', '#admin-support']) {
  assert(`${app}\n${styles}`.includes(adminOverviewLink), `Admin overview must summarize numbers and link to module: ${adminOverviewLink}`);
}
assert(!app.includes('className="adminOverviewIntro"'), 'Admin overview must stay compact and avoid repeating module descriptions');
for (const adminPanelRoutingHook of ['activeAdminView', 'adminViewFromHash', "activeAdminView === 'overview'"]) {
  assert(app.includes(adminPanelRoutingHook), `Admin dashboard must render one module view at a time: ${adminPanelRoutingHook}`);
}

for (const communityVoteHook of ['communityVoteBox', 'communityVoteButton', 'aiChallengeCommunityDeviceId', '/api/public/submissions/:id/vote', 'community_votes']) {
  assert(`${app}\n${styles}\n${server}`.includes(communityVoteHook), `Missing community vote hook: ${communityVoteHook}`);
}

for (const contactValidationHook of ['normalizeContactMessageInput', "import { normalizeContactMessageInput } from './contact-utils.mjs';"]) {
  assert(server.includes(contactValidationHook), `Contact API must use centralized validation: ${contactValidationHook}`);
}

for (const assistantBotHook of ['assistantBot', 'assistantBotPanel', 'Trợ lý Thử thách AI', 'assistantQuickQuestions', 'matchAssistantAnswer']) {
  assert(`${app}\n${styles}`.includes(assistantBotHook), `Missing assistant bot hook: ${assistantBotHook}`);
}
const assistantQuickQuestionsBlock = app.match(/const assistantQuickQuestions = \[([\s\S]*?)\];/)?.[1] || '';
const assistantQuickQuestionCount = (assistantQuickQuestionsBlock.match(/'/g) || []).length / 2;
assert(assistantQuickQuestionCount === 2, `Assistant bot must expose exactly 2 suggested questions, found ${assistantQuickQuestionCount}`);
for (const assistantTypingHook of ['typingMessageId', 'assistantTypingBubble', 'assistantTypingDots', 'assistantTypingDot']) {
  assert(`${app}\n${styles}`.includes(assistantTypingHook), `Missing assistant typing effect hook: ${assistantTypingHook}`);
}
assert(styles.includes('width: min(520px'), 'Assistant chat panel must be wider for more comfortable chat space');
const assistantQuickButtonStyles = styles.match(/\.assistantQuickQuestions button\s*{[^}]*}/)?.[0] || '';
assert(assistantQuickButtonStyles.includes('min-height: 24px') && assistantQuickButtonStyles.includes('font-size: 11px'), 'Assistant quick suggestion buttons must be compact');
for (const assistantHumanHook of ['assistantBotIdentity', 'assistantBotAvatar', 'assistantPresenceDot', 'assistantMessageAuthor']) {
  assert(`${app}\n${styles}`.includes(assistantHumanHook), `Assistant chat must feel more natural and human-like: ${assistantHumanHook}`);
}
for (const assistantRelatedHook of ['relatedQuestions', 'assistantRelatedQuestions', 'Câu hỏi liên quan']) {
  assert(`${app}\n${styles}`.includes(assistantRelatedHook), `Missing assistant related question hook: ${assistantRelatedHook}`);
}
for (const assistantScopeHook of ['assistantOutOfScopeFallback', 'không trả lời nội dung ngoài phạm vi cuộc thi Thử thách AI', 'quay lại các nội dung của cuộc thi']) {
  assert(app.includes(assistantScopeHook), `Assistant bot must refuse out-of-scope questions and guide users back to the contest: ${assistantScopeHook}`);
}
for (const assistantAnswer of ['Hạn nộp bài tuần 1', 'Cách nộp bài dự thi', 'Nhóm dự thi', 'Ảnh đại diện bài dự thi', 'Bình chọn cộng đồng', 'Liên hệ Ban tổ chức']) {
  assert(app.includes(assistantAnswer), `Assistant bot must answer common question: ${assistantAnswer}`);
}

for (const aiNewsHook of ['aiNewsItems', 'Tin tức AI', 'AI trong tòa soạn', 'Cập nhật công cụ AI', 'Góc ứng dụng cuộc thi', 'aiNewsHero', 'aiNewsGrid']) {
  assert(`${data}\n${app}\n${components}\n${styles}`.includes(aiNewsHook), `Missing AI news hook/content: ${aiNewsHook}`);
}
const aiNewsItemsBlock = data.match(/export const aiNewsItems: AINewsItem\[] = \[([\s\S]*?)\];/)?.[1] || '';
const aiNewsCount = (aiNewsItemsBlock.match(/\n\s+id: '/g) || []).length;
assert(aiNewsCount >= 6, `Expected at least 6 AI news items, found ${aiNewsCount}`);
for (const aiNewsDetailHook of ['findAINewsItem', 'AiNewsDetailPage', 'aiNewsDetailHero', 'aiNewsArticleBody', 'aiNewsRelatedGrid', '/ai-news/${item.id}']) {
  assert(`${data}\n${app}\n${styles}`.includes(aiNewsDetailHook), `Missing AI news detail hook: ${aiNewsDetailHook}`);
}

for (const forumHook of ['Diễn đàn AI', 'forumThreads', 'forumThreadForm', 'forumReplyForm', '/api/forum/threads', '/api/forum/threads/:id/replies', 'AI trong công việc', 'Chia sẻ prompt', 'Trao đổi kinh nghiệm sử dụng AI']) {
  assert(`${data}\n${app}\n${components}\n${styles}\n${server}`.includes(forumHook), `Missing AI forum hook/content: ${forumHook}`);
}

for (const goLiveFile of [
  'server/rate-limit.mjs',
  'server/backup-utils.mjs',
  'scripts/backup-production.mjs',
  'deploy/ai-challenge-backup.service',
  'deploy/ai-challenge-backup.timer',
  'docs/GO_LIVE_CHECKLIST.md',
]) {
  assert(fs.existsSync(path.join(root, goLiveFile)), `Missing go-live file: ${goLiveFile}`);
}
for (const goLiveHook of [
  'createRateLimitMiddleware',
  'RATE_LIMIT_SUBMISSIONS_MAX',
  'RATE_LIMIT_ADMIN_LOGIN_MAX',
  'RATE_LIMIT_CONTACT_MAX',
  'RATE_LIMIT_COMMUNITY_VOTE_MAX',
  'RATE_LIMIT_FORUM_MAX',
]) {
  assert(server.includes(goLiveHook), `Missing API go-live hardening hook: ${goLiveHook}`);
}
assert(backupProduction.includes('backupSqliteDatabase(config.dbPath'), 'Production backup must use SQLite snapshot backup instead of copying a live DB file');
assert(!backupProduction.includes('copyFileSync(config.dbPath'), 'Production backup must not raw-copy the live SQLite database');
for (const sqliteRuntimePragma of ['PRAGMA journal_mode = WAL', 'PRAGMA busy_timeout = 5000']) {
  assert(server.includes(sqliteRuntimePragma), `SQLite runtime must set production pragma: ${sqliteRuntimePragma}`);
}
assert(app.includes('function apiFetch'), 'Frontend API calls must go through apiFetch');
assert(app.includes("credentials: init.credentials ?? 'include'"), 'apiFetch must include same-origin proxy cookies');
for (const apiFetchHook of ['async function apiFetch', 'shouldRetryApiFetch', 'warmApiOrigin', 'await warmApiOrigin()', "method === 'GET'", "error instanceof TypeError", "'/api/submissions/health'"]) {
  assert(app.includes(apiFetchHook), `apiFetch must retry transient admin API network failures: ${apiFetchHook}`);
}
const allowedFetchCalls = [
  'return await fetch(input, requestInit);',
  'return fetch(input, requestInit);',
  "await fetch('/api/submissions/health', {",
  "await fetch('/', {",
];
const fetchCallLines = app
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.includes('fetch('));
assert(fetchCallLines.length === allowedFetchCalls.length, 'Frontend must keep fetch calls confined to apiFetch retry helpers');
for (const allowedFetchCall of allowedFetchCalls) {
  assert(fetchCallLines.includes(allowedFetchCall), `Unexpected frontend fetch call contract: ${allowedFetchCall}`);
}

const spaShellCacheControlCount = (nginxConfig.match(/add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate" always;/g) || []).length;
assert(spaShellCacheControlCount >= 2, 'Nginx must prevent cached SPA shells on HTTPS and 8088 servers');
assert(nginxConfig.includes('location = /index.html'), 'Nginx must set explicit no-cache headers for index.html');
assert(nginxConfig.includes('try_files $uri $uri/ /index.html;'), 'Nginx must keep SPA fallback routing');
for (const securityHeader of [
  'add_header X-Content-Type-Options "nosniff" always;',
  'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
  'add_header X-Frame-Options "DENY" always;',
  'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
]) {
  const count = (nginxConfig.match(new RegExp(securityHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  assert(count >= 6, `Nginx static/proxy locations must set security header: ${securityHeader}`);
}

console.log('Content contract passed');
