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

const desktopNavStyles = styles.match(/\.desktopNav a\s*{[^}]*}/)?.[0] || '';
assert(desktopNavStyles.includes('white-space: nowrap;'), 'Desktop nav links must stay on one line');
assert(styles.includes('.headerActions .ghostButton'), 'Header must compact secondary actions on medium screens');

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

console.log('Content contract passed');
