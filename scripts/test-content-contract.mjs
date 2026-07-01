import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const data = fs.readFileSync(path.join(root, 'src/data.ts'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const components = fs.readFileSync(path.join(root, 'src/components.tsx'), 'utf8');
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

console.log('Content contract passed');
