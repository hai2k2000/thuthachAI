import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const data = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const components = fs.readFileSync(path.join(root, 'src/components.tsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server/index.mjs'), 'utf8');
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

for (const challengeCardHook of ['challengeGroupBadge', 'targetGroup']) {
  assert(`${app}\n${components}\n${styles}`.includes(challengeCardHook), `Missing challenge card group hook: ${challengeCardHook}`);
}

for (const submissionGroupOption of ['Nhóm Phóng viên, Biên tập viên', 'Nhóm Tổng hợp', 'Nhóm Kinh doanh', 'Nhóm dự thi']) {
  assert(app.includes(submissionGroupOption), `Missing submission group option: ${submissionGroupOption}`);
}
assert(!app.includes('Nhóm nhiệm vụ khác'), 'Submission form must only expose the three official groups');

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
const navItemsBlock = components.match(/const navItems = \[([\s\S]*?)\];/)?.[1] || '';
assert(!navItemsBlock.includes('Bài tiêu biểu'), 'Desktop nav must hide the featured submissions menu item');
assert(!navItemsBlock.includes("href: '/ai-news'"), 'Header menu must hide AI news');
assert(!navItemsBlock.includes("href: '/forum'"), 'Header menu must hide AI forum');
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

for (const adminDashboardHook of ['adminOverviewGrid', 'adminSidebarNav', 'adminScorePanel', 'adminUserPanel', 'adminUserForm', '/api/admin/users']) {
  assert(`${app}\n${styles}\n${server}`.includes(adminDashboardHook), `Missing admin dashboard hook: ${adminDashboardHook}`);
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
assert(app.includes('function apiFetch'), 'Frontend API calls must go through apiFetch');
assert(app.includes("credentials: init.credentials ?? 'include'"), 'apiFetch must include same-origin proxy cookies');
assert(!app.includes('await fetch('), 'Frontend must not call fetch directly inside awaited API requests');
assert(!app.includes('\n    fetch('), 'Frontend must not call fetch directly inside effect API requests');

console.log('Content contract passed');
