import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AppLink,
  Badge,
  BadgeGrid,
  Breadcrumb,
  CTABox,
  ChallengeCard,
  ChallengeDetail,
  DepartmentLeaderboard,
  EmptyState,
  FilterPanel,
  Footer,
  Header,
  Icon,
  LeaderboardTable,
  PageContainer,
  Podium,
  PromptCard,
  PromptDetail,
  ResultsCount,
  SafetyChecklist,
  SearchInput,
  SectionHeading,
  SelectFilter,
  StatCard,
  SubmissionCard,
  SubmissionDetail,
  Timeline,
  Toast,
  ToolCard,
  GuideCard,
  WeekTabs,
  useCopyToast,
} from './components';
import {
  aiTools,
  badges,
  challengeWeeks,
  challenges,
  contactTopics,
  departmentScores,
  findChallenge,
  findPrompt,
  findSubmission,
  heroImage,
  leaderboardItems,
  mediaImage,
  promptCategories,
  promptDifficulties,
  promptStatuses,
  promptTools,
  prompts,
  routeMap,
  scoringCriteria,
  submissionChecklist,
  submissions,
} from './data';

export default function App() {
  const [pathname, setPathname] = useState(normalizePath(window.location.pathname));
  const { message, copy } = useCopyToast();

  useEffect(() => {
    const handlePop = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function navigate(href: string) {
    const next = normalizePath(href);
    window.history.pushState({}, '', next);
    setPathname(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Header pathname={pathname} navigate={navigate} />
      {renderRoute(pathname, navigate, copy)}
      <Footer navigate={navigate} />
      <Toast message={message} />
    </>
  );
}

function renderRoute(pathname: string, navigate: (href: string) => void, copy: (text: string) => void) {
  const challengeMatch = pathname.match(/^\/challenges\/([^/]+)$/);
  if (challengeMatch) return <ChallengeDetailPage id={challengeMatch[1]} navigate={navigate} />;

  const promptMatch = pathname.match(/^\/prompts\/([^/]+)$/);
  if (promptMatch) return <PromptDetailPage id={promptMatch[1]} navigate={navigate} onCopy={copy} />;

  const featuredMatch = pathname.match(/^\/featured\/([^/]+)$/);
  if (featuredMatch) return <FeaturedDetailPage id={featuredMatch[1]} navigate={navigate} />;

  switch (pathname) {
    case '/':
      return <HomePage navigate={navigate} />;
    case '/challenges':
      return <ChallengesPage navigate={navigate} />;
    case '/submit':
      return <SubmitPage navigate={navigate} />;
    case '/rules':
      return <RulesPage navigate={navigate} />;
    case '/prompts':
      return <PromptsPage navigate={navigate} onCopy={copy} />;
    case '/featured':
      return <FeaturedPage navigate={navigate} />;
    case '/leaderboard':
      return <LeaderboardPage />;
    case '/ai-lab':
      return <AiLabPage />;
    case '/contact':
      return <ContactPage />;
    case '/search':
      return <SearchPage navigate={navigate} />;
    default:
      return <NotFoundPage navigate={navigate} />;
  }
}

function HomePage({ navigate }: { navigate: (href: string) => void }) {
  const openChallenges = challenges.filter((challenge) => challenge.status === 'Đang mở');
  return (
    <PageContainer className="homePage">
      <section className="homeHero">
        <div className="heroCopy">
          <Badge tone="red">Trí tuệ nhân tạo trong tòa soạn</Badge>
          <h1>
            MỖI TUẦN MỘT <span>THỬ THÁCH AI</span>
          </h1>
          <p>Biến AI thành trợ lý công việc hằng ngày tại Tạp chí Thời đại.</p>
          <p className="heroSubcopy">Thử thách nhỏ mỗi tuần - Quy trình hay mỗi ngày - Tài nguyên chung cho toàn cơ quan.</p>
          <div className="heroActions">
            <AppLink href="/challenges" navigate={navigate} className="primaryButton">Xem thử thách tuần này</AppLink>
            <AppLink href="/submit" navigate={navigate} className="darkButton">Nộp bài dự thi</AppLink>
            <AppLink href="/prompts" navigate={navigate} className="ghostButton">Khám phá kho Prompt</AppLink>
          </div>
        </div>
        <div className="heroVisual">
          <img src={heroImage} alt="Tòa soạn ứng dụng AI" />
          <div className="floatingCard">
            <Icon name="auto_awesome" />
            <strong>Thử thách AI tuần 1</strong>
            <span>03 nhóm nhiệm vụ chính thức</span>
          </div>
        </div>
      </section>

      <section className="statStrip">
        <StatCard value="05" label="Tuần thử thách" />
        <StatCard value="03" label="Nhóm nhiệm vụ" />
        <StatCard value="100" label="Điểm đánh giá" />
        <StatCard value="500+" label="Kho prompt chung" accent />
      </section>

      <section className="band">
        <SectionHeading
          eyebrow="Thử thách đang mở"
          title="Tuần 01: Ba nhiệm vụ ứng dụng AI theo nhóm chuyên môn"
          description="Phóng viên - biên tập viên nghiên cứu thể loại báo chí hiện đại; Tổng hợp xây dựng lưu trữ thông minh; Kinh doanh phát triển sản phẩm truyền thông thương mại hóa."
          action={<AppLink href="/challenges" navigate={navigate} className="ghostButton">Xem tất cả</AppLink>}
        />
        <div className="cardGrid three">
          {openChallenges.slice(0, 3).map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} navigate={navigate} />
          ))}
        </div>
      </section>

      <section className="homeSection">
        <SectionHeading
          eyebrow="Timeline"
          title="Hành trình 05 tuần mở khóa AI"
          description="Từ người mới bắt đầu đến quy trình AI có thể áp dụng trong toàn cơ quan."
        />
        <Timeline items={challengeWeeks} />
      </section>

      <section className="insightBand">
        <div>
          <SectionHeading
            eyebrow="Sức mạnh của Trợ lý AI"
            title="Đo hiệu quả trước và sau ứng dụng"
            description="Minh chứng thực tế về hiệu quả qua làm việc tại tòa soạn trước và sau khi ứng dụng các giải pháp trí tuệ nhân tạo."
          />
          <div className="comparisonLines">
            <span>Tóm tắt 10 văn bản: <b>120 phút</b></span>
            <span>Tóm tắt 10 văn bản với AI: <b>02 phút</b></span>
          </div>
        </div>
        <div className="impactGrid">
          <StatCard value="85%" label="Tiết kiệm thời gian" />
          <StatCard value="2X" label="Số lượng nội dung" accent />
          <StatCard value="100%" label="Chính xác dữ liệu" />
          <StatCard value="40%" label="Giảm tải công việc" />
        </div>
      </section>

      <section className="previewGrid">
        <div className="leaderMini card">
          <h2>Bảng vàng AI</h2>
          {leaderboardItems.slice(0, 3).map((item) => (
            <AppLink key={item.rank} href="/leaderboard" navigate={navigate}>
              <span>#{item.rank}</span>
              <strong>{item.name}</strong>
              <em>{item.score} pts</em>
            </AppLink>
          ))}
          <AppLink href="/leaderboard" navigate={navigate} className="ghostButton">Xem bảng xếp hạng</AppLink>
        </div>
        <div className="featuredQuote">
          <Badge tone="red">Prompt hay nhất tuần</Badge>
          <h2>"Trợ lý tóm tắt & phân loại phản hồi độc giả"</h2>
          <p>Hãy đóng vai một biên tập viên dữ liệu có kinh nghiệm 10 năm. Dựa trên danh sách bình luận đính kèm...</p>
          <span>Tác giả: Mai Anh - Ban Phóng viên</span>
        </div>
        <div className="wideFeature card">
          <img src={mediaImage} alt="Bài dự thi tiêu biểu" />
          <div>
            <Badge tone="soft">Bài dự thi tiêu biểu</Badge>
            <h2>Tự động hóa bản tin sáng</h2>
            <p>Hệ thống dùng GPT-4o để quét 50 nguồn tin quốc tế, dịch thuật, tóm tắt và đóng gói vào nhóm Slack tòa soạn lúc 6h30 mỗi ngày.</p>
            <div className="cardActions">
              <AppLink href="/featured" navigate={navigate} className="primaryButton">Xem chi tiết</AppLink>
              <AppLink href="/prompts" navigate={navigate} className="ghostButton">Sử dụng template này</AppLink>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

function ChallengesPage({ navigate }: { navigate: (href: string) => void }) {
  const [week, setWeek] = useState('Tất cả');
  const filtered = week === 'Tất cả' ? challenges : challenges.filter((challenge) => String(challenge.week) === week);
  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thử thách' }]} />
      <SectionHeading
        eyebrow="Trung tâm thử thách AI"
        title="Danh sách tuần 1 đến tuần 5"
        description="Theo dõi nhiệm vụ, deadline, yêu cầu đầu ra và trạng thái từng tuần."
      />
      <WeekTabs activeWeek={week} onChange={setWeek} weeks={[1, 2, 3, 4, 5]} />
      <div className="cardGrid three">
        {filtered.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} navigate={navigate} />
        ))}
      </div>
      <CTABox navigate={navigate} />
    </PageContainer>
  );
}

function ChallengeDetailPage({ id, navigate }: { id: string; navigate: (href: string) => void }) {
  const challenge = findChallenge(id);
  if (!challenge) return <NotFoundPage navigate={navigate} />;
  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thử thách', href: '/challenges' }, { label: challenge.title }]} />
      <ChallengeDetail challenge={challenge} navigate={navigate} />
    </PageContainer>
  );
}

type SubmissionFormState = {
  participantName: string;
  department: string;
  contact: string;
  email: string;
  week: string;
  challengeGroup: string;
  title: string;
  aiTools: string;
  problem: string;
  processSummary: string;
  mainPrompt: string;
  finalResult: string;
  lessons: string;
  recommendations: string;
  publicPrompt: boolean;
};

type SubmitStatus =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success'; receiptId: string; message: string }
  | { state: 'error'; message: string };

const maxEvidenceFiles = 5;
const maxEvidenceFileSizeMb = 25;
const maxEvidenceFileSizeBytes = maxEvidenceFileSizeMb * 1024 * 1024;

const initialSubmissionForm: SubmissionFormState = {
  participantName: '',
  department: '',
  contact: '',
  email: '',
  week: '1',
  challengeGroup: 'Nhóm Phóng viên, biên tập viên',
  title: '',
  aiTools: '',
  problem: '',
  processSummary: '',
  mainPrompt: '',
  finalResult: '',
  lessons: '',
  recommendations: '',
  publicPrompt: true,
};

const departmentOptions = [
  'Ban Biên tập',
  'Ban Phóng viên',
  'Ban Đối ngoại',
  'Ban Kinh tế - Xã hội',
  'Ban Trị sự',
  'Hành chính - Văn thư',
  'Bộ phận khác',
];

const challengeGroupOptions = [
  'Nhóm Phóng viên, biên tập viên',
  'Nhóm Tổng hợp',
  'Nhóm Kinh doanh',
  'Nhóm nhiệm vụ khác',
];

const requiredSubmissionFields: Array<[keyof SubmissionFormState, string]> = [
  ['participantName', 'Vui lòng nhập họ tên.'],
  ['department', 'Vui lòng chọn đơn vị.'],
  ['contact', 'Vui lòng nhập email hoặc số điện thoại.'],
  ['title', 'Vui lòng nhập tên bài dự thi.'],
  ['aiTools', 'Vui lòng nhập công cụ AI đã dùng.'],
  ['processSummary', 'Vui lòng tóm tắt nhật ký tương tác với AI.'],
  ['mainPrompt', 'Vui lòng nhập bộ prompt hoặc hệ thống câu hỏi chính.'],
  ['finalResult', 'Vui lòng nhập kết quả cuối cùng và lý do lựa chọn.'],
];

function SubmitPage({ navigate }: { navigate: (href: string) => void }) {
  const [form, setForm] = useState<SubmissionFormState>(initialSubmissionForm);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });
  const [fileInputKey, setFileInputKey] = useState(0);

  function updateField<Key extends keyof SubmissionFormState>(field: Key, value: SubmissionFormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const errors = validateEvidenceFiles(selectedFiles);
    setFiles(selectedFiles.slice(0, maxEvidenceFiles));
    setStatus(errors.length ? { state: 'error', message: errors.join(' ') } : { state: 'idle' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateSubmissionForm(form, files);
    if (validationErrors.length) {
      setStatus({ state: 'error', message: validationErrors.join(' ') });
      return;
    }

    setStatus({ state: 'submitting' });

    const payload = new FormData();
    for (const [field, value] of Object.entries(form)) {
      payload.append(field, typeof value === 'boolean' ? String(value) : value);
    }
    for (const file of files) {
      payload.append('evidenceFiles', file);
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: payload,
      });
      const result = await response.json().catch(() => ({} as { id?: string; message?: string; errors?: string[] }));

      if (!response.ok || !result.id) {
        throw new Error(result.errors?.join(' ') || 'Không thể gửi bài dự thi. Vui lòng thử lại.');
      }

      setForm(initialSubmissionForm);
      setFiles([]);
      setFileInputKey((current) => current + 1);
      setStatus({
        state: 'success',
        receiptId: result.id,
        message: result.message || 'Bài dự thi đã được tiếp nhận.',
      });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể gửi bài dự thi. Vui lòng thử lại.' });
    }
  }

  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Nộp bài' }]} />
      <section className="submitHero">
        <div>
          <Badge tone="red">Form nộp bài trực tiếp</Badge>
          <h1>Nộp bài dự thi</h1>
          <p>Gửi bài, prompt chính, kết quả cuối cùng và file minh chứng trực tiếp về hệ thống của Tạp chí Thời đại.</p>
        </div>
        <div className="submitHeroPanel">
          <Icon name="cloud_upload" />
          <strong>Lưu trên VPS của cuộc thi</strong>
          <span>Mỗi lượt gửi có mã tiếp nhận riêng để Ban tổ chức đối chiếu và tổng hợp.</span>
        </div>
      </section>
      <section className="submitFormSection">
        <form className="submissionForm" onSubmit={handleSubmit}>
          <div className="formIntro">
            <div>
              <Badge tone="soft">Bài dự thi tuần</Badge>
              <h2>Thông tin bài nộp</h2>
            </div>
            {status.state === 'success' ? (
              <div className="receiptPill">
                <Icon name="verified" />
                <span>Mã tiếp nhận: <b>{status.receiptId}</b></span>
              </div>
            ) : null}
          </div>

          <div className="formGrid">
            <label className="formField">
              <span>Họ và tên <b>*</b></span>
              <input value={form.participantName} onChange={(event) => updateField('participantName', event.target.value)} />
            </label>
            <label className="formField">
              <span>Đơn vị <b>*</b></span>
              <select value={form.department} onChange={(event) => updateField('department', event.target.value)}>
                <option value="">Chọn đơn vị</option>
                {departmentOptions.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </label>
            <label className="formField">
              <span>Email hoặc số điện thoại <b>*</b></span>
              <input value={form.contact} onChange={(event) => updateField('contact', event.target.value)} />
            </label>
            <label className="formField">
              <span>Email nhận phản hồi</span>
              <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
            </label>
            <label className="formField">
              <span>Tuần thử thách <b>*</b></span>
              <select value={form.week} onChange={(event) => updateField('week', event.target.value)}>
                {challengeWeeks.map((week) => (
                  <option key={week.week} value={String(week.week)}>Tuần {week.week}: {week.title}</option>
                ))}
              </select>
            </label>
            <label className="formField">
              <span>Nhóm nhiệm vụ</span>
              <select value={form.challengeGroup} onChange={(event) => updateField('challengeGroup', event.target.value)}>
                {challengeGroupOptions.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
            </label>
            <label className="formField full">
              <span>Tên bài dự thi <b>*</b></span>
              <input value={form.title} onChange={(event) => updateField('title', event.target.value)} />
            </label>
            <label className="formField">
              <span>Công cụ AI sử dụng <b>*</b></span>
              <input value={form.aiTools} onChange={(event) => updateField('aiTools', event.target.value)} placeholder="Tên nền tảng, phiên bản hoặc gói dịch vụ nếu có" />
            </label>
            <label className="formField">
              <span>Chủ đề hoặc nhiệm vụ thực hiện</span>
              <input value={form.problem} onChange={(event) => updateField('problem', event.target.value)} />
            </label>
            <label className="formField full">
              <span>Bộ prompt hoặc hệ thống câu hỏi chính <b>*</b></span>
              <textarea rows={6} value={form.mainPrompt} onChange={(event) => updateField('mainPrompt', event.target.value)} />
            </label>
            <label className="formField full">
              <span>Tóm tắt nhật ký tương tác với AI <b>*</b></span>
              <textarea rows={5} value={form.processSummary} onChange={(event) => updateField('processSummary', event.target.value)} />
              <small>Nêu mục tiêu từng bước, nội dung trao đổi, kết quả AI trả về và quá trình đánh giá, lựa chọn, điều chỉnh; không sao chép toàn bộ đoạn chat.</small>
            </label>
            <label className="formField full">
              <span>Kết quả cuối cùng và lý do lựa chọn phương án <b>*</b></span>
              <textarea rows={5} value={form.finalResult} onChange={(event) => updateField('finalResult', event.target.value)} />
            </label>
            <label className="formField">
              <span>Bài học kinh nghiệm</span>
              <textarea rows={4} value={form.lessons} onChange={(event) => updateField('lessons', event.target.value)} />
            </label>
            <label className="formField">
              <span>Kiến nghị, đề xuất hoặc phương pháp tương tác với AI</span>
              <textarea rows={4} value={form.recommendations} onChange={(event) => updateField('recommendations', event.target.value)} />
            </label>
            <label className="formField full">
              <span>File minh chứng <b>*</b></span>
              <input
                key={fileInputKey}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.zip,.rar"
                onChange={handleFileChange}
              />
              <small>Tối đa {maxEvidenceFiles} file, mỗi file không quá {maxEvidenceFileSizeMb}MB.</small>
            </label>
          </div>

          {files.length ? (
            <ul className="selectedFiles">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`}>
                  <Icon name="draft" />
                  <span>{file.name}</span>
                  <em>{formatFileSize(file.size)}</em>
                </li>
              ))}
            </ul>
          ) : null}

          <label className="checkboxField">
            <input type="checkbox" checked={form.publicPrompt} onChange={(event) => updateField('publicPrompt', event.target.checked)} />
            <span>Đồng ý để Ban tổ chức biên tập prompt tốt vào Kho Prompt nội bộ.</span>
          </label>

          {status.state === 'error' ? <div className="formAlert error"><Icon name="error" /> {status.message}</div> : null}
          {status.state === 'success' ? <div className="formAlert success"><Icon name="check_circle" /> {status.message}</div> : null}

          <div className="formActions">
            <button type="submit" className="primaryButton" disabled={status.state === 'submitting'}>
              {status.state === 'submitting' ? 'Đang gửi...' : 'Gửi bài dự thi'}
            </button>
            <AppLink href="/rules" navigate={navigate} className="ghostButton">Xem lại thể lệ</AppLink>
          </div>
        </form>
      </section>
      <section className="twoColumnLayout">
        <div className="card">
          <h2>Checklist thông tin cần nộp</h2>
          <ul className="checkGrid">
            {submissionChecklist.map((item) => (
              <li key={item}><Icon name="check_circle" /> {item}</li>
            ))}
          </ul>
        </div>
        <aside className="warningBox">
          <Icon name="warning" />
          <h2>Lưu ý bảo mật</h2>
          <p>Không đưa thông tin mật, tài liệu nội bộ chưa được phép công khai vào công cụ AI.</p>
          <p>Chỉ gửi link file đã đặt quyền truy cập phù hợp cho Ban tổ chức.</p>
        </aside>
      </section>
      <CTABox navigate={navigate} title="Cần xem lại thể lệ trước khi nộp?" description="Kiểm tra tiêu chí 100 điểm và cơ cấu giải thưởng trước khi gửi bài." />
    </PageContainer>
  );
}

function validateSubmissionForm(form: SubmissionFormState, files: File[]) {
  const errors: string[] = [];
  for (const [field, message] of requiredSubmissionFields) {
    if (!String(form[field]).trim()) {
      errors.push(message);
    }
  }
  errors.push(...validateEvidenceFiles(files));
  return errors;
}

function validateEvidenceFiles(files: File[]) {
  const errors: string[] = [];
  if (!files.length) {
    errors.push('Vui lòng tải lên ít nhất một file minh chứng.');
  }
  if (files.length > maxEvidenceFiles) {
    errors.push(`Mỗi lần gửi tối đa ${maxEvidenceFiles} file.`);
  }
  if (files.some((file) => file.size > maxEvidenceFileSizeBytes)) {
    errors.push(`Mỗi file không được vượt quá ${maxEvidenceFileSizeMb}MB.`);
  }
  return errors;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function RulesPage({ navigate }: { navigate: (href: string) => void }) {
  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thể lệ' }]} />
      <section className="rulesHero">
        <div>
          <h1>Thể lệ cuộc thi</h1>
          <p>Cuộc thi "Mỗi tuần một thử thách AI" do Ban Tổ chức Tạp chí Thời đại ban hành tại Hà Nội, ngày 15 tháng 6 năm 2026; thời gian tổ chức từ 01/7/2026 đến hết 03/8/2026.</p>
        </div>
        <AppLink href="/submit" navigate={navigate} className="primaryButton">Nộp bài dự thi</AppLink>
      </section>
      <section className="rulesGrid">
        {[
          ['Điều 1. Mục đích', 'Khuyến khích cán bộ, phóng viên, biên tập viên và người lao động chủ động ứng dụng AI vào công việc chuyên môn; tạo môi trường học hỏi, lan tỏa mô hình hiệu quả; hình thành thói quen ứng dụng AI và xây dựng nguồn tài nguyên dùng chung gồm prompt, quy trình, kinh nghiệm.'],
          ['Điều 2. Đối tượng tham gia', 'Toàn thể cán bộ, nhân viên, phóng viên, biên tập viên Tạp chí Thời đại; khuyến khích cán bộ lãnh đạo tham gia. Đây là yếu tố đánh giá tinh thần triển khai chuyển đổi số và thi đua cuối kỳ, cuối năm.'],
          ['Điều 3. Thời gian tổ chức', 'Cuộc thi diễn ra từ ngày 01/7/2026 đến hết ngày 03/8/2026, gồm 05 tuần. Ban Tổ chức công bố chủ đề vào Thứ Tư, nhận bài dự thi vào Thứ Hai hằng tuần và trao giải tuần vào Thứ Tư hằng tuần.'],
          ['Điều 4. Nội dung cuộc thi', 'Hằng tuần, Ban Tổ chức công bố một chủ đề hoặc đầu việc thực tế gắn với hoạt động chuyên môn của cơ quan. Người tham gia sử dụng các công cụ AI để thực hiện thử thách theo chủ đề được giao.'],
          ['Điều 5. Yêu cầu bài dự thi', 'Bài dự thi cần có thông tin người dự thi, chủ đề hoặc nhiệm vụ, công cụ AI, bộ prompt hoặc hệ thống câu hỏi chính, tóm tắt nhật ký tương tác, kết quả cuối cùng và lý do lựa chọn, bài học kinh nghiệm, kiến nghị và phương pháp tương tác với AI.'],
          ['Điều 8. Tổ chức thực hiện', 'Lãnh đạo Tạp chí chỉ đạo chung; Ban Biên tập đánh giá bài dự thi theo tiêu chí đã ban hành và đề xuất trao giải. Đầu mối tiếp nhận, tổng hợp và hỗ trợ kỹ thuật: Đồng chí Vũ Mai Anh, 0948.898.496, vumaianh001024@gmail.com.'],
        ].map(([title, text]) => (
          <article key={title} className="card">
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="scoreSection card">
        <SectionHeading title="Tiêu chí chấm điểm 100 điểm" description="Thang điểm giúp bài dự thi tập trung vào hiệu quả thực tế và khả năng nhân rộng." />
        <div className="scoreList">
          {scoringCriteria.map((criterion) => (
            <article key={criterion.label}>
              <span>{criterion.points}</span>
              <p>{criterion.label}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="prizeGrid">
        <article className="card">
          <h2>Giải thưởng tuần 1 đến tuần 4</h2>
          <ul className="detailList">
            <li>01 Giải Nhất dành cho bài dự thi có chất lượng tổng thể nổi bật nhất trong tuần, trị giá 500.000 đồng.</li>
            <li>01 Giải Ứng dụng hiệu quả dành cho bài dự thi thể hiện rõ hiệu quả của AI trong nâng cao năng suất, chất lượng công việc, trị giá 300.000 đồng.</li>
            <li>01 Giải Ứng dụng sáng tạo dành cho bài dự thi có ý tưởng hoặc phương thức khai thác AI sáng tạo, có giá trị thực tiễn, trị giá 300.000 đồng.</li>
          </ul>
        </article>
        <article className="card prizeCard">
          <h2>Giải thưởng tuần 5</h2>
          <ul className="detailList">
            <li>01 Giải Nhất dành cho bài dự thi có chất lượng tổng thể nổi bật nhất trong tuần, trị giá 1.000.000 đồng.</li>
            <li>01 Giải Tiên phong AI: 01 tháng sử dụng nền tảng AI trả phí, trị giá khoảng 22 USD.</li>
            <li>01 Giải Sáng tạo AI: 01 tháng sử dụng nền tảng AI trả phí, trị giá khoảng 22 USD.</li>
            <li>01 Giải Lan tỏa AI: 01 tháng sử dụng nền tảng AI trả phí, trị giá khoảng 22 USD.</li>
          </ul>
        </article>
      </section>
      <div className="placeholderLine"><Icon name="gavel" /> Quyết định của Ban Giám khảo là quyết định cuối cùng. Các sản phẩm tiêu biểu, prompt hiệu quả và kinh nghiệm hay sẽ được tổng hợp, chia sẻ để phục vụ công tác chuyên môn trong toàn cơ quan.</div>
    </PageContainer>
  );
}

function PromptsPage({ navigate, onCopy }: { navigate: (href: string) => void; onCopy: (text: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [tool, setTool] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const text = `${prompt.title} ${prompt.purpose} ${prompt.tags.join(' ')} ${prompt.department} ${prompt.contributor}`.toLowerCase();
      return (
        (!keyword || text.includes(keyword)) &&
        (category === 'Tất cả' || prompt.category === category) &&
        (tool === 'Tất cả' || prompt.tool === tool) &&
        (difficulty === 'Tất cả' || prompt.difficulty === difficulty) &&
        (status === 'Tất cả' || prompt.status === status)
      );
    });
  }, [query, category, tool, difficulty, status]);

  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Kho Prompt' }]} />
      <SectionHeading
        eyebrow="Kho Prompt Thời đại"
        title="Tài nguyên dùng chung cho toàn cơ quan"
        description="Tìm kiếm, lọc và sao chép prompt đã kiểm chứng hoặc đang thử nghiệm."
        action={<ResultsCount count={filtered.length} label="prompt" />}
      />
      <FilterPanel>
        <SearchInput value={query} onChange={setQuery} placeholder="Tìm prompt, tag, người chia sẻ..." />
        <SelectFilter label="Nhóm chuyên môn" value={category} options={promptCategories} onChange={setCategory} />
        <SelectFilter label="Công cụ" value={tool} options={promptTools} onChange={setTool} />
        <SelectFilter label="Mức độ" value={difficulty} options={promptDifficulties} onChange={setDifficulty} />
        <SelectFilter label="Trạng thái" value={status} options={promptStatuses} onChange={setStatus} />
      </FilterPanel>
      {filtered.length ? (
        <div className="cardGrid two">
          {filtered.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} navigate={navigate} onCopy={onCopy} />
          ))}
        </div>
      ) : (
        <EmptyState title="Không tìm thấy prompt phù hợp" description="Thử đổi từ khóa hoặc bỏ bớt bộ lọc." />
      )}
    </PageContainer>
  );
}

function PromptDetailPage({ id, navigate, onCopy }: { id: string; navigate: (href: string) => void; onCopy: (text: string) => void }) {
  const prompt = findPrompt(id);
  if (!prompt) return <NotFoundPage navigate={navigate} />;
  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Kho Prompt', href: '/prompts' }, { label: prompt.title }]} />
      <PromptDetail prompt={prompt} onCopy={onCopy} />
    </PageContainer>
  );
}

function FeaturedPage({ navigate }: { navigate: (href: string) => void }) {
  const [query, setQuery] = useState('');
  const [week, setWeek] = useState('Tất cả');
  const [group, setGroup] = useState('Tất cả');
  const [department, setDepartment] = useState('Tất cả');
  const [award, setAward] = useState('Tất cả');
  const [scalable, setScalable] = useState('Tất cả');
  const [promptPublic, setPromptPublic] = useState('Tất cả');
  const groups = ['Tất cả', ...Array.from(new Set(submissions.map((item) => item.group)))];
  const departments = ['Tất cả', ...Array.from(new Set(submissions.map((item) => item.department)))];
  const awards = ['Tất cả', ...Array.from(new Set(submissions.map((item) => item.award)))];
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      const text = `${submission.title} ${submission.participantName} ${submission.department} ${submission.tags.join(' ')} ${submission.problem}`.toLowerCase();
      return (
        (!keyword || text.includes(keyword)) &&
        (week === 'Tất cả' || String(submission.week) === week) &&
        (group === 'Tất cả' || submission.group === group) &&
        (department === 'Tất cả' || submission.department === department) &&
        (award === 'Tất cả' || submission.award === award) &&
        (scalable === 'Tất cả' || (scalable === 'Có thể nhân rộng' ? submission.isScalable : !submission.isScalable)) &&
        (promptPublic === 'Tất cả' || (promptPublic === 'Có prompt công khai' ? submission.isPromptPublic : !submission.isPromptPublic))
      );
    });
  }, [query, week, group, department, award, scalable, promptPublic]);

  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Bài tiêu biểu' }]} />
      <SectionHeading
        eyebrow="Bài dự thi tiêu biểu"
        title="Những quy trình AI có thể học hỏi"
        description="Lọc theo tuần thi, nhóm nhiệm vụ, phòng ban, danh hiệu, khả năng nhân rộng và prompt công khai."
        action={<ResultsCount count={filtered.length} label="bài" />}
      />
      <FilterPanel>
        <SearchInput value={query} onChange={setQuery} placeholder="Tìm bài, người thực hiện, tag..." />
        <SelectFilter label="Tuần thi" value={week} options={['Tất cả', '1', '2', '3', '4', '5']} onChange={setWeek} />
        <SelectFilter label="Nhóm nhiệm vụ" value={group} options={groups} onChange={setGroup} />
        <SelectFilter label="Phòng/ban" value={department} options={departments} onChange={setDepartment} />
        <SelectFilter label="Danh hiệu" value={award} options={awards} onChange={setAward} />
        <SelectFilter label="Nhân rộng" value={scalable} options={['Tất cả', 'Có thể nhân rộng', 'Chưa nhân rộng']} onChange={setScalable} />
        <SelectFilter label="Prompt" value={promptPublic} options={['Tất cả', 'Có prompt công khai', 'Chưa công khai prompt']} onChange={setPromptPublic} />
      </FilterPanel>
      {filtered.length ? (
        <div className="cardGrid two">
          {filtered.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} navigate={navigate} />
          ))}
        </div>
      ) : (
        <EmptyState title="Không tìm thấy bài tiêu biểu" description="Thử thay đổi bộ lọc hoặc từ khóa." />
      )}
    </PageContainer>
  );
}

function FeaturedDetailPage({ id, navigate }: { id: string; navigate: (href: string) => void }) {
  const submission = findSubmission(id);
  if (!submission) return <NotFoundPage navigate={navigate} />;
  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Bài tiêu biểu', href: '/featured' }, { label: submission.title }]} />
      <SubmissionDetail submission={submission} navigate={navigate} />
    </PageContainer>
  );
}

function LeaderboardPage() {
  const [tab, setTab] = useState('1');
  const visibleItems = tab === 'Tổng kết' ? leaderboardItems : leaderboardItems.filter((item) => String(item.week) === tab);
  const stats = [
    ['Tổng số bài dự thi', String(submissions.length)],
    ['Prompt đã chia sẻ', String(prompts.length)],
    ['Phòng/ban tham gia', String(departmentScores.length)],
    ['Bài có khả năng nhân rộng', String(submissions.filter((item) => item.isScalable).length)],
  ];
  return (
    <PageContainer>
      <SectionHeading eyebrow="Bảng vàng AI" title="Vinh danh cá nhân, nhóm và phòng/ban" description="Theo dõi điểm số, danh hiệu, badge và đóng góp prompt trong từng tuần." />
      <section className="statStrip compact">
        {stats.map(([label, value]) => (
          <StatCard key={label} value={value} label={label} />
        ))}
      </section>
      <div className="tabs">
        {['1', '2', '3', '4', '5', 'Tổng kết'].map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
            {item === 'Tổng kết' ? item : `Tuần ${item}`}
          </button>
        ))}
      </div>
      <Podium items={visibleItems.length ? visibleItems : leaderboardItems} />
      <SectionHeading title="Bảng xếp hạng cá nhân/nhóm" />
      <LeaderboardTable items={visibleItems.length ? visibleItems : leaderboardItems} />
      <SectionHeading title="Bảng xếp hạng phòng/ban" />
      <DepartmentLeaderboard items={departmentScores} />
      <section className="honorGrid">
        {['Giải Nhất tuần', 'Giải Ứng dụng hiệu quả', 'Giải Ứng dụng sáng tạo', 'Prompt hay nhất tuần', 'Quy trình có khả năng nhân rộng', 'Cá nhân lan tỏa AI'].map((item) => (
          <article key={item} className="card">
            <Icon name="emoji_events" />
            <strong>{item}</strong>
            <span>{leaderboardItems.find((entry) => entry.award === item)?.name || 'Đang cập nhật'}</span>
          </article>
        ))}
      </section>
      <SectionHeading title="Badge/huy hiệu" />
      <BadgeGrid items={badges} />
    </PageContainer>
  );
}

function AiLabPage() {
  const guides = [
    ['edit_note', 'Cách viết prompt rõ yêu cầu', 'Nêu vai trò, ngữ cảnh, đầu ra mong muốn và tiêu chí đánh giá.'],
    ['campaign', 'Đúng văn phong hành chính', 'Yêu cầu AI giữ giọng chuyên nghiệp, ngắn gọn, không thêm thông tin mới.'],
    ['fact_check', 'Kiểm chứng thông tin AI', 'Tách dữ kiện, nguồn và suy luận; kiểm tra lại bằng nguồn chính thức.'],
    ['summarize', 'Tóm tắt tài liệu bằng AI', 'Yêu cầu tách ý chính, deadline, người phụ trách và việc cần làm.'],
    ['account_tree', 'Tạo workflow xử lý văn bản', 'Biến các bước lặp thành checklist có người duyệt cuối.'],
    ['calendar_month', 'Lập kế hoạch truyền thông', 'Từ mục tiêu, nhóm độc giả và kênh phân phối, tạo lịch nội dung.'],
  ] as const;
  return (
    <PageContainer>
      <section className="redHero">
        <div>
          <h1>AI Lab</h1>
          <p>Nơi thử nghiệm công cụ, chia sẻ cách làm và hướng dẫn sử dụng AI an toàn cho đội ngũ Tạp chí Thời đại.</p>
          <div className="heroChips">
            <Badge tone="light">Bảo mật dữ liệu</Badge>
            <Badge tone="light">Hiệu suất cao</Badge>
          </div>
        </div>
        <div className="labHeroCard">
          <Icon name="science" />
          <strong>Thử nghiệm mới</strong>
          <span>Cập nhật 4 công cụ AI mới nhất trong tuần này.</span>
        </div>
      </section>
      <SectionHeading title="Công cụ AI gợi ý" description="Hệ sinh thái AI đã được kiểm chứng cho công tác biên tập." />
      <div className="cardGrid four">
        {aiTools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
      <section className="labBento">
        <div className="guidePanel">
          <SectionHeading title="Hướng dẫn nhanh" />
          <div className="guideGrid">
            {guides.map(([icon, title, description]) => (
              <GuideCard key={title} icon={icon} title={title} description={description} />
            ))}
          </div>
        </div>
        <SafetyChecklist />
      </section>
      <SectionHeading title="Mẫu prompt cơ bản" description="Sao chép và tùy chỉnh để bắt đầu công việc ngay lập tức." />
      <div className="basicPrompts">
        {prompts.slice(0, 3).map((prompt) => (
          <article key={prompt.id}>
            <Badge tone="soft">{prompt.category}</Badge>
            <h3>{prompt.title.replace('Prompt ', '')}</h3>
            <p>"{prompt.fullPrompt.slice(0, 220)}..."</p>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}

function ContactPage() {
  return (
    <PageContainer>
      <SectionHeading eyebrow="Liên hệ" title="Đầu mối tiếp nhận và hỗ trợ" description="Gửi câu hỏi về thể lệ, cách nộp bài, kỹ thuật hoặc đề xuất đăng prompt lên kho chung." />
      <section className="contactGrid">
        <div className="card contactCard">
          <Icon name="support_agent" />
          <h2>Đồng chí Vũ Mai Anh</h2>
          <p>Điện thoại: <a href="tel:0948898496">0948.898.496</a></p>
          <p>Email: <a href="mailto:vumaianh001024@gmail.com">vumaianh001024@gmail.com</a></p>
          <div className="tagList">
            {contactTopics.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </div>
        <form className="card contactForm" onSubmit={(event) => event.preventDefault()}>
          <h2>Form hỗ trợ</h2>
          <label>Họ tên<input placeholder="Nguyễn Văn A" /></label>
          <label>Phòng/ban<input placeholder="Ban Nội dung số" /></label>
          <label>Email<input type="email" placeholder="email@thoidai.vn" /></label>
          <label>Nội dung cần hỗ trợ<textarea rows={5} placeholder="Mô tả câu hỏi hoặc vấn đề cần hỗ trợ" /></label>
          <label>File/link đính kèm nếu có<input placeholder="Đường dẫn file minh chứng hoặc tài liệu liên quan" /></label>
          <button className="primaryButton" type="submit">Gửi yêu cầu hỗ trợ</button>
        </form>
      </section>
    </PageContainer>
  );
}

function SearchPage({ navigate }: { navigate: (href: string) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const items = [
      ...prompts.map((prompt) => ({ title: prompt.title, type: 'Prompt', description: prompt.purpose, tags: prompt.tags, href: `/prompts/${prompt.id}` })),
      ...submissions.map((submission) => ({ title: submission.title, type: 'Bài tiêu biểu', description: submission.problem, tags: submission.tags, href: `/featured/${submission.id}` })),
      ...challenges.map((challenge) => ({ title: challenge.title, type: 'Thử thách', description: challenge.description, tags: [challenge.targetGroup, `Tuần ${challenge.week}`], href: `/challenges/${challenge.id}` })),
      { title: 'Thể lệ cuộc thi', type: 'Thể lệ', description: 'Tiêu chí chấm điểm, giải thưởng, thời gian và tổ chức thực hiện.', tags: ['100 điểm', 'giải thưởng'], href: '/rules' },
      { title: 'Thông báo mở tuần 1', type: 'Tin cập nhật', description: 'Tuần 1 nhận bài đến 15h00 ngày 06/7/2026.', tags: ['deadline', 'tuần 1'], href: '/challenges' },
    ];
    if (!keyword) return items;
    return items.filter((item) => `${item.title} ${item.type} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(keyword));
  }, [query]);

  return (
    <PageContainer>
      <SectionHeading eyebrow="Tìm kiếm" title="Tìm kiếm toàn website" description="Kết quả gồm Prompt, Bài tiêu biểu, Thử thách, Thể lệ và Tin cập nhật." action={<ResultsCount count={results.length} label="kết quả" />} />
      <FilterPanel>
        <SearchInput value={query} onChange={setQuery} placeholder="Nhập từ khóa cần tìm..." />
      </FilterPanel>
      <div className="searchResultsPage">
        {results.map((item) => (
          <AppLink key={`${item.type}-${item.title}`} href={item.href} navigate={navigate} className="card searchResultItem">
            <Badge tone="soft">{item.type}</Badge>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>{item.tags.join(' · ')}</span>
          </AppLink>
        ))}
        {!results.length ? <EmptyState title="Không tìm thấy kết quả" description="Thử tìm bằng từ khóa khác." /> : null}
      </div>
    </PageContainer>
  );
}

function NotFoundPage({ navigate }: { navigate: (href: string) => void }) {
  return (
    <PageContainer>
      <section className="notFound card">
        <Icon name="travel_explore" />
        <h1>Không tìm thấy trang</h1>
        <p>Route này chưa có trong AI Challenge Hub.</p>
        <AppLink href="/" navigate={navigate} className="primaryButton">Về trang chủ</AppLink>
      </section>
    </PageContainer>
  );
}

function normalizePath(value: string) {
  const path = value.split('?')[0].replace(/\/+$/, '');
  return path || '/';
}
