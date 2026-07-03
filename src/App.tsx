import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
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
  InfoGrid,
  LeaderboardTable,
  PageContainer,
  Podium,
  PromptCard,
  CopyPromptButton,
  PromptDetail,
  ResultsCount,
  SafetyChecklist,
  SearchInput,
  SectionHeading,
  SelectFilter,
  StatCard,
  SubmissionCard,
  SubmissionDetail,
  DetailSection,
  Timeline,
  Toast,
  ToolCard,
  GuideCard,
  WeekTabs,
  useCopyToast,
} from './components';
import {
  aiNewsItems,
  aiTools,
  badges,
  challengeWeeks,
  challenges,
  contactTopics,
  departmentScores,
  findAINewsItem,
  findChallenge,
  findPrompt,
  findSubmission,
  heroImage,
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

async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const requestInit: RequestInit = {
    ...init,
    credentials: init.credentials ?? 'include',
  };

  try {
    return await fetch(input, requestInit);
  } catch (error) {
    if (!shouldRetryApiFetch(input, init, error)) {
      throw error;
    }

    await warmApiOrigin();
    return fetch(input, requestInit);
  }
}

function shouldRetryApiFetch(input: RequestInfo | URL, init: RequestInit, error: unknown) {
  const method = String(init.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
  return method === 'GET' && isApiRequest(input) && error instanceof TypeError;
}

function isApiRequest(input: RequestInfo | URL) {
  if (typeof input === 'string') return input.includes('/api/');
  if (input instanceof URL) return input.pathname.startsWith('/api/');
  if (input instanceof Request) {
    try {
      return new URL(input.url, window.location.origin).pathname.startsWith('/api/');
    } catch {
      return input.url.includes('/api/');
    }
  }
  return false;
}

async function warmApiOrigin() {
  try {
    await fetch('/api/submissions/health', {
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    await fetch('/', {
      credentials: 'include',
      cache: 'reload',
    }).catch(() => undefined);
  }
}

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

  const isAdminRoute = pathname === '/admin';
  if (isAdminRoute) {
    return (
      <>
        {renderRoute(pathname, navigate, copy)}
        <Toast message={message} />
      </>
    );
  }

  return (
    <>
      <Header pathname={pathname} navigate={navigate} />
      {renderRoute(pathname, navigate, copy)}
      <Footer navigate={navigate} />
      <AssistantBot navigate={navigate} />
      <Toast message={message} />
    </>
  );
}

function renderRoute(pathname: string, navigate: (href: string) => void, copy: (text: string) => void) {
  const challengeMatch = pathname.match(/^\/challenges\/([^/]+)$/);
  if (challengeMatch) return <ChallengeDetailPage id={challengeMatch[1]} navigate={navigate} />;

  const promptMatch = pathname.match(/^\/prompts\/([^/]+)$/);
  if (promptMatch) return <PromptDetailPage id={promptMatch[1]} navigate={navigate} onCopy={copy} />;

  const aiNewsMatch = pathname.match(/^\/ai-news\/([^/]+)$/);
  if (aiNewsMatch) return <AiNewsDetailPage id={aiNewsMatch[1]} navigate={navigate} />;

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
    case '/ai-news':
      return <AiNewsPage navigate={navigate} />;
    case '/forum':
      return <ForumPage navigate={navigate} />;
    case '/contact':
      return <ContactPage />;
    case '/admin':
      return <AdminPage />;
    case '/search':
      return <SearchPage navigate={navigate} />;
    default:
      return <NotFoundPage navigate={navigate} />;
  }
}

type AssistantAction = {
  label: string;
  href: string;
};

type AssistantMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  actions?: AssistantAction[];
  relatedQuestions?: string[];
};

type AssistantAnswer = {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  actions?: AssistantAction[];
  relatedQuestions?: string[];
};

const assistantQuickQuestions = [
  'Cách nộp bài dự thi',
  'Diễn đàn AI dùng thế nào?',
];

const assistantAnswers: AssistantAnswer[] = [
  {
    id: 'deadline',
    title: 'Hạn nộp bài tuần 1',
    keywords: ['han nop', 'deadline', 'thoi han', 'tuan 1', 'nop bai khi nao'],
    answer: 'Hạn nộp bài tuần 1 là 15:00 ngày 06/07/2026. Anh/chị nên gửi sớm để có thời gian kiểm tra file bài dự thi và file minh chứng.',
    actions: [{ label: 'Nộp bài', href: '/submit' }, { label: 'Xem thể lệ', href: '/rules' }],
    relatedQuestions: ['Cách nộp bài dự thi', 'Cần chuẩn bị file gì?', 'Tiêu chí chấm điểm thế nào?'],
  },
  {
    id: 'submit',
    title: 'Cách nộp bài dự thi',
    keywords: ['cach nop', 'nop bai', 'gui bai', 'form', 'upload', 'tai len', 'file', 'can chuan bi file'],
    answer: 'Anh/chị vào form nộp bài, điền thông tin cá nhân, chọn nhóm dự thi, nhập nhật ký tác nghiệp, upload file bài dự thi và file minh chứng. Sau khi gửi, hệ thống trả mã tiếp nhận để Ban tổ chức đối chiếu.',
    actions: [{ label: 'Mở form nộp bài', href: '/submit' }],
    relatedQuestions: ['Nhóm dự thi gồm những nhóm nào?', 'Ảnh đại diện bài dự thi có bắt buộc không?', 'Hạn nộp bài tuần 1'],
  },
  {
    id: 'group',
    title: 'Nhóm dự thi',
    keywords: ['nhom', 'phong vien', 'bien tap', 'tong hop', 'kinh doanh', 'chon nhom'],
    answer: 'Tuần 1 có 3 nhóm dự thi: Nhóm Phóng viên, Biên tập viên; Nhóm Tổng hợp; Nhóm Kinh doanh. Anh/chị chọn đúng nhóm tương ứng với đề bài của mình trong form nộp bài.',
    actions: [{ label: 'Xem đề bài', href: '/challenges' }, { label: 'Nộp bài', href: '/submit' }],
    relatedQuestions: ['Cách nộp bài dự thi', 'Tiêu chí chấm điểm thế nào?', 'Diễn đàn AI dùng thế nào?'],
  },
  {
    id: 'cover',
    title: 'Ảnh đại diện bài dự thi',
    keywords: ['anh dai dien', 'cover', 'thumbnail', 'hinh dai dien', 'tu tao anh'],
    answer: 'Ảnh đại diện bài dự thi là không bắt buộc. Nếu anh/chị không upload ảnh JPG, PNG hoặc WEBP, hệ thống sẽ tự tạo ảnh đại diện từ file bài dự thi đầu tiên.',
    actions: [{ label: 'Nộp bài', href: '/submit' }],
    relatedQuestions: ['Cần chuẩn bị file gì?', 'Cách nộp bài dự thi', 'Bình chọn cộng đồng hoạt động thế nào?'],
  },
  {
    id: 'vote',
    title: 'Bình chọn cộng đồng',
    keywords: ['binh chon', 'cong dong', 'danh gia', 'vote', 'nguoi xem', 'bai tieu bieu'],
    answer: 'Người xem có thể bình chọn cho các bài đã được Ban tổ chức duyệt hiển thị. Mỗi thiết bị chỉ được bình chọn một lần cho mỗi bài dự thi để hạn chế spam.',
    actions: [{ label: 'Xem bài tiêu biểu', href: '/featured' }],
    relatedQuestions: ['Bài tiêu biểu hiển thị khi nào?', 'Tiêu chí chấm điểm thế nào?', 'Diễn đàn AI dùng thế nào?'],
  },
  {
    id: 'rules',
    title: 'Thể lệ và chấm điểm',
    keywords: ['the le', 'cham diem', 'tieu chi', '100 diem', 'giai thuong'],
    answer: 'Bài dự thi được đánh giá theo thang 100 điểm, gồm mức độ phù hợp đề bài, hiệu quả ứng dụng AI, tính sáng tạo, chất lượng sản phẩm và tinh thần chia sẻ kinh nghiệm.',
    actions: [{ label: 'Xem thể lệ', href: '/rules' }],
    relatedQuestions: ['Hạn nộp bài tuần 1', 'Nhóm dự thi gồm những nhóm nào?', 'Bình chọn cộng đồng hoạt động thế nào?'],
  },
  {
    id: 'contact',
    title: 'Liên hệ Ban tổ chức',
    keywords: ['lien he', 'ho tro', 'ban to chuc', 'vu mai anh', 'gap loi'],
    answer: 'Nếu cần hỗ trợ thêm, anh/chị gửi yêu cầu qua trang Liên hệ. Ban tổ chức sẽ kiểm tra nội dung và phản hồi theo thông tin anh/chị để lại.',
    actions: [{ label: 'Gửi liên hệ', href: '/contact' }],
    relatedQuestions: ['Cách nộp bài dự thi', 'Diễn đàn AI dùng thế nào?', 'Hạn nộp bài tuần 1'],
  },
  {
    id: 'forum',
    title: 'Diễn đàn AI',
    keywords: ['dien dan', 'forum', 'trao doi', 'chia se kinh nghiem', 'chia se prompt', 'hoi dap ai'],
    answer: 'Diễn đàn AI là nơi mọi người đăng chủ đề, hỏi đáp công cụ, chia sẻ prompt và kinh nghiệm sử dụng AI trong công việc. Anh/chị có thể mở chủ đề mới hoặc phản hồi trực tiếp dưới từng thảo luận.',
    actions: [{ label: 'Mở Diễn đàn AI', href: '/forum' }, { label: 'Xem Kho Prompt', href: '/prompts' }],
    relatedQuestions: ['Chia sẻ prompt ở đâu?', 'Cách nộp bài dự thi', 'Bình chọn cộng đồng hoạt động thế nào?'],
  },
];

const assistantOutOfScopeFallback: AssistantMessage = {
  id: 'fallback',
  role: 'bot',
  text: 'Mình xin phép không trả lời nội dung ngoài phạm vi cuộc thi Thử thách AI. Anh/chị có thể quay lại các nội dung của cuộc thi như thể lệ, hạn nộp, cách nộp bài, nhóm dự thi, bình chọn cộng đồng, Kho Prompt hoặc Diễn đàn AI.',
  actions: [{ label: 'Xem thể lệ', href: '/rules' }, { label: 'Nộp bài', href: '/submit' }, { label: 'Diễn đàn AI', href: '/forum' }],
  relatedQuestions: ['Cách nộp bài dự thi', 'Hạn nộp bài tuần 1', 'Diễn đàn AI dùng thế nào?'],
};

function AssistantBot({ navigate }: { navigate: (href: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [typingMessageId, setTypingMessageId] = useState('');
  const typingTimer = useRef<number | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([{
    id: 'welcome',
    role: 'bot',
    text: 'Chào anh/chị, mình là Trợ lý Thử thách AI. Anh/chị cần hỏi nhanh về thể lệ, nộp bài hay bình chọn?',
  }]);

  useEffect(() => () => {
    if (typingTimer.current) window.clearInterval(typingTimer.current);
  }, []);

  function askAssistant(question: string) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    if (typingTimer.current) window.clearInterval(typingTimer.current);
    const matched = matchAssistantAnswer(cleanQuestion);
    const response = matched
      ? { id: `bot-${Date.now()}`, role: 'bot' as const, text: matched.answer, actions: matched.actions, relatedQuestions: matched.relatedQuestions }
      : { ...assistantOutOfScopeFallback, id: `bot-${Date.now()}` };
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text: cleanQuestion },
      response,
    ]);
    setTypingMessageId(response.id);
    let typingProgress = 0;
    typingTimer.current = window.setInterval(() => {
      typingProgress += 2;
      if (typingProgress >= response.text.length) {
        if (typingTimer.current) window.clearInterval(typingTimer.current);
        typingTimer.current = null;
        setTypingMessageId('');
      }
    }, 18);
    setDraft('');
    setOpen(true);
  }

  return (
    <aside className={`assistantBot${open ? ' isOpen' : ''}`} aria-label="Trợ lý Thử thách AI">
      {open ? (
        <section className="assistantBotPanel">
          <div className="assistantBotHeader">
            <div className="assistantBotIdentity">
              <span className="assistantBotAvatar" aria-hidden="true">AI</span>
              <div>
                <span>Trợ lý Thử thách AI</span>
                <strong>Hỏi đáp nhanh</strong>
                <small><i className="assistantPresenceDot" /> Đang trực</small>
              </div>
            </div>
            <button type="button" className="iconButton" aria-label="Đóng trợ lý" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          <div className="assistantMessages" aria-live="polite">
            {messages.map((message) => {
              const isTyping = message.id === typingMessageId;
              return (
              <article key={message.id} className={`assistantMessage ${message.role}${isTyping ? ' assistantTypingBubble' : ''}`}>
                <span className="assistantMessageAuthor">{message.role === 'bot' ? 'Trợ lý' : 'Bạn'}</span>
                <p>
                  {isTyping ? (
                    <span className="assistantTypingStatus">
                      <span>Đang trả lời</span>
                      <span className="assistantTypingDots" aria-hidden="true">
                        <span className="assistantTypingDot" />
                        <span className="assistantTypingDot" />
                        <span className="assistantTypingDot" />
                      </span>
                    </span>
                  ) : message.text}
                </p>
                {message.actions?.length && !isTyping ? (
                  <div className="assistantActions">
                    {message.actions.map((action) => (
                      <button key={`${message.id}-${action.href}`} type="button" onClick={() => {
                        navigate(action.href);
                        setOpen(false);
                      }}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {message.relatedQuestions?.length && !isTyping ? (
                  <div className="assistantRelatedQuestions" aria-label="Câu hỏi liên quan">
                    <span>Câu hỏi liên quan</span>
                    {message.relatedQuestions.map((question) => (
                      <button key={`${message.id}-${question}`} type="button" onClick={() => askAssistant(question)}>
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
              );
            })}
          </div>
          <div className="assistantQuickQuestions" aria-label="Câu hỏi nhanh">
            {assistantQuickQuestions.map((question) => (
              <button key={question} type="button" onClick={() => askAssistant(question)}>
                {question}
              </button>
            ))}
          </div>
          <form className="assistantInput" onSubmit={(event) => {
            event.preventDefault();
            askAssistant(draft);
          }}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhập câu hỏi..." />
            <button type="submit" aria-label="Gửi câu hỏi">
              <Icon name="send" />
            </button>
          </form>
        </section>
      ) : null}
      <button type="button" className="assistantBotToggle" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <Icon name={open ? 'close' : 'support_agent'} />
        <span>{open ? 'Đóng' : 'Hỏi đáp'}</span>
      </button>
    </aside>
  );
}

function matchAssistantAnswer(question: string) {
  const normalizedQuestion = normalizeAssistantText(question);
  let bestMatch: { answer: AssistantAnswer; score: number } | null = null;

  for (const answer of assistantAnswers) {
    const searchable = [answer.title, ...answer.keywords].map(normalizeAssistantText);
    const score = searchable.reduce((total, item) => total + (normalizedQuestion.includes(item) || item.includes(normalizedQuestion) ? 1 : 0), 0);
    if (score > (bestMatch?.score || 0)) {
      bestMatch = { answer, score };
    }
  }

  return bestMatch?.score ? bestMatch.answer : null;
}

function normalizeAssistantText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function HomePage({ navigate }: { navigate: (href: string) => void }) {
  const openChallenges = challenges.filter((challenge) => challenge.status === 'Đang mở');
  const showImpactMetrics = false;
  return (
    <PageContainer className="homePage">
      <section className="homeHero">
        <div className="heroCopy">
          <Badge tone="red">Trí tuệ nhân tạo trong tòa soạn</Badge>
          <h1>
            Mỗi tuần một <span>Thử thách AI</span>
          </h1>
          <p>Biến AI thành trợ lý công việc hằng ngày tại Tạp chí Thời đại.</p>
          <p className="heroSubcopy">Thử thách nhỏ mỗi tuần - Quy trình hay mỗi ngày - Tài nguyên chung cho toàn cơ quan.</p>
          <div className="heroActions">
            <AppLink href="/challenges" navigate={navigate} className="primaryButton">Xem thử thách tuần này</AppLink>
            <AppLink href="/submit" navigate={navigate} className="darkButton">Nộp bài dự thi</AppLink>
            <AppLink href="/prompts" navigate={navigate} className="ghostButton">Khám phá kho Prompt</AppLink>
            <AppLink href="/rules" navigate={navigate} className="ghostButton">Thể lệ cuộc thi</AppLink>
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
        <StatCard value="0" label="Prompt đã duyệt" accent />
      </section>

      <section className="band">
        <SectionHeading
          eyebrow="Thử thách đang mở"
          title="Tuần 01: Ba nhiệm vụ ứng dụng AI theo nhóm chuyên môn"
          description="Phóng viên - biên tập viên nghiên cứu thể loại báo chí hiện đại; Tổng hợp xây dựng lưu trữ thông minh; Kinh doanh phát triển sản phẩm truyền thông thương mại hóa."
          action={<AppLink href="/challenges" navigate={navigate} className="ghostButton">Xem tất cả</AppLink>}
        />
        <CountdownBanner targetDate="2026-07-06T15:00:00+07:00" />
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

      {showImpactMetrics ? (
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
      ) : null}

      <section className="previewGrid">
        <div className="leaderMini card">
          <h2>Bảng vàng AI</h2>
          <HomeLeaderboardPreview navigate={navigate} />
          <AppLink href="/leaderboard" navigate={navigate} className="ghostButton">Xem bảng xếp hạng</AppLink>
        </div>
      </section>
    </PageContainer>
  );
}

function ChallengesPage({ navigate }: { navigate: (href: string) => void }) {
  const [week, setWeek] = useState('Tất cả');
  const filtered = week === 'Tất cả' ? challenges : challenges.filter((challenge) => String(challenge.week) === week);
  const isSpecialWeek = week === '5';
  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thử thách' }]} />
      <SectionHeading
        eyebrow="Trung tâm thử thách AI"
        title="Danh sách tuần 1 đến tuần 5"
        description="Theo dõi nhiệm vụ, deadline, yêu cầu đầu ra và trạng thái từng tuần."
      />
      <WeekTabs activeWeek={week} onChange={setWeek} weeks={[1, 2, 3, 4, 5]} />
      {filtered.length ? (
        <div className="cardGrid three">
          {filtered.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} navigate={navigate} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={isSpecialWeek ? 'Tuần đặc biệt sẽ công bố một đề chung' : 'Nội dung tuần này đang chờ công bố'}
          description={isSpecialWeek ? 'Tuần 5 dành cho toàn cơ quan, không chia nhóm nhiệm vụ.' : 'Ban Tổ chức sẽ cập nhật đề bài chính thức trước khi mở nhận bài.'}
        />
      )}
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

type PublicLeaderboardItem = {
  rank: number;
  id: string;
  name: string;
  department: string;
  submissionTitle: string;
  week: string;
  score: number;
  award: string;
  status: string;
};

type PublicDepartmentScore = {
  department: string;
  submissionCount: number;
  averageScore: number;
  featuredSubmission: string;
};

type PublicPromptItem = {
  id: string;
  title: string;
  contributor: string;
  department: string;
  tool: string;
  purpose: string;
  fullPrompt: string;
  week: string;
  updatedAt: string;
};

type PublicFeaturedSubmission = {
  id: string;
  title: string;
  image: string;
  coverImage?: {
    url: string;
    originalName: string;
    generated?: boolean;
  } | null;
  participantName: string;
  department: string;
  week: string;
  group: string;
  aiTools: string;
  problem: string;
  processSummary: string;
  finalResult: string;
  score: number;
  communityVoteCount: number;
  communityReactions: CommunityReactions;
  viewerHasVoted: boolean;
  fileCount: number;
  createdAt: string;
};

type CommunityVoteReaction = 'favorite' | 'useful' | 'creative' | 'applicable' | 'inspiring';
type CommunityReactions = Record<CommunityVoteReaction, number>;

type ForumReply = {
  id: string;
  threadId: string;
  createdAt: string;
  authorName: string;
  department: string;
  content: string;
  status: string;
};

type ForumThread = {
  id: string;
  createdAt: string;
  authorName: string;
  department: string;
  category: string;
  title: string;
  content: string;
  aiTools: string;
  status: string;
  replyCount: number;
  replies: ForumReply[];
};

type ForumThreadForm = {
  authorName: string;
  department: string;
  category: string;
  title: string;
  content: string;
  aiTools: string;
};

type ForumReplyForm = {
  authorName: string;
  department: string;
  content: string;
};

const communityDeviceStorageKey = 'aiChallengeCommunityDeviceId';
const communityVoteOptions: Array<{ id: CommunityVoteReaction; label: string; icon: string }> = [
  { id: 'favorite', label: 'Yêu thích', icon: 'favorite' },
  { id: 'useful', label: 'Hữu ích', icon: 'thumb_up' },
  { id: 'creative', label: 'Sáng tạo', icon: 'auto_awesome' },
  { id: 'applicable', label: 'Dễ áp dụng', icon: 'task_alt' },
  { id: 'inspiring', label: 'Truyền cảm hứng', icon: 'emoji_objects' },
];

const forumCategories = ['AI trong công việc', 'Chia sẻ prompt', 'Hỏi đáp công cụ', 'Kinh nghiệm triển khai'];
const forumFilterOptions = ['Tất cả', ...forumCategories];
const initialForumThreadForm: ForumThreadForm = {
  authorName: '',
  department: '',
  category: forumCategories[0],
  title: '',
  content: '',
  aiTools: '',
};
const initialForumReplyForm: ForumReplyForm = {
  authorName: '',
  department: '',
  content: '',
};

function getCommunityDeviceId() {
  try {
    const existing = window.localStorage.getItem(communityDeviceStorageKey);
    if (existing) return existing;
    const generated = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(communityDeviceStorageKey, generated);
    return generated;
  } catch {
    return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

type AdminSubmission = PublicFeaturedSubmission & {
  contact: string;
  email: string;
  challengeGroup: string;
  lessons: string;
  recommendations: string;
  publicPrompt: boolean;
  reviewStatus: string;
  promptStatus: string;
  featuredStatus: string;
  judgeNote: string;
  submissionFiles: AdminFile[];
  evidenceFiles: AdminFile[];
};

type AdminFile = {
  originalName: string;
  downloadUrl: string;
  size: number;
};

type ContactMessage = {
  id: string;
  createdAt: string;
  name: string;
  department: string;
  email: string;
  message: string;
  attachment: string;
  status: string;
};

type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
};

type AdminAuditLog = {
  id: string;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    role: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
};

type AdminView = 'overview' | 'submissions' | 'scoring' | 'users' | 'audit' | 'support';
type AdminRole = 'admin' | 'judge' | 'viewer' | '';

const adminViewAnchors: Record<AdminView, string> = {
  overview: '#admin-overview',
  submissions: '#admin-submissions',
  scoring: '#admin-scoring',
  users: '#admin-users',
  audit: '#admin-audit',
  support: '#admin-support',
};

function adminViewFromHash(hash: string): AdminView {
  const normalized = hash.replace(/^#/, '');
  if (normalized === 'admin-submissions') return 'submissions';
  if (normalized === 'admin-scoring') return 'scoring';
  if (normalized === 'admin-users') return 'users';
  if (normalized === 'admin-audit') return 'audit';
  if (normalized === 'admin-support') return 'support';
  return 'overview';
}

function normalizeAdminRole(value: unknown): AdminRole {
  return value === 'admin' || value === 'judge' || value === 'viewer' ? value : '';
}

function CountdownBanner({ targetDate }: { targetDate: string }) {
  const remaining = useCountdown(targetDate);
  const deadlineLabel = '15:00 - 06/07/2026';
  const countdownUnits = [
    { label: 'ngày', value: remaining.days },
    { label: 'giờ', value: remaining.hours },
    { label: 'phút', value: remaining.minutes },
    { label: 'giây', value: remaining.seconds },
  ];

  return (
    <section className="countdownBanner" aria-live="polite">
      <div className="countdownCopy">
        <div className="countdownHeader">
          <div>
            <span className="countdownBadge"><Icon name="timer" /> Hạn nộp tuần 1</span>
            <h3>Đếm ngược nhận bài dự thi</h3>
          </div>
          <span className="countdownDeadline"><Icon name="event" /> {deadlineLabel}</span>
        </div>
        {remaining.expired ? (
          <strong className="countdownExpired">Đã hết hạn nộp bài</strong>
        ) : (
          <div className="countdownGrid" aria-label="Thời gian còn lại đến hạn nộp bài">
            {countdownUnits.map((unit) => (
              <div className="countdownUnit" key={unit.label}>
                <strong className="countdownValue">{unit.value}</strong>
                <span className="countdownLabel">{unit.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="countdownAction">
        <span className="countdownActionLabel">Cổng nộp bài trực tuyến</span>
        <p>Hoàn thiện bài dự thi và file minh chứng trước thời hạn để Ban tổ chức tiếp nhận kịp thời.</p>
        <AppLink href="/submit" navigate={(href) => {
          window.history.pushState({}, '', href);
          window.dispatchEvent(new PopStateEvent('popstate'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} className="countdownCta"><Icon name="upload_file" /> Nộp bài tuần 1</AppLink>
      </div>
    </section>
  );
}

function HomeLeaderboardPreview({ navigate }: { navigate: (href: string) => void }) {
  const [items, setItems] = useState<PublicLeaderboardItem[]>([]);

  useEffect(() => {
    let active = true;
    apiFetch('/api/public/leaderboard')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Cannot load leaderboard')))
      .then((data: { items?: PublicLeaderboardItem[] }) => {
        if (active) setItems(data.items ?? []);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!items.length) {
    return (
      <div className="leaderMiniEmpty">
        <Icon name="leaderboard" />
        <span>Chờ Ban giám khảo chấm điểm bài dự thi đầu tiên.</span>
      </div>
    );
  }

  return (
    <>
      {items.slice(0, 3).map((item) => (
        <AppLink key={item.id} href="/leaderboard" navigate={navigate}>
          <span>#{item.rank}</span>
          <strong>{item.name}</strong>
          <em>{item.score} pts</em>
        </AppLink>
      ))}
    </>
  );
}

function useCountdown(targetDate: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const total = Math.max(0, new Date(targetDate).getTime() - now);
  const totalSeconds = Math.floor(total / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired: total <= 0, days, hours, minutes, seconds };
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

type WorkflowStep = {
  content: string;
  tools: string;
  prompt: string;
  response: string;
};

type SubmitStatus =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success'; receiptId: string; message: string }
  | { state: 'error'; message: string };

const maxEvidenceFiles = 5;
const maxSubmissionFiles = 3;
const maxCoverImages = 1;
const maxEvidenceFileSizeMb = 25;
const maxEvidenceFileSizeBytes = maxEvidenceFileSizeMb * 1024 * 1024;
const coverImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const initialWorkflowStep: WorkflowStep = { content: '', tools: '', prompt: '', response: '' };

const initialSubmissionForm: SubmissionFormState = {
  participantName: '',
  department: '',
  contact: '',
  email: '',
  week: '1',
  challengeGroup: '',
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
  'Nhóm Phóng viên, Biên tập viên',
  'Nhóm Tổng hợp',
  'Nhóm Kinh doanh',
];

const requiredSubmissionFields: Array<[keyof SubmissionFormState, string]> = [
  ['participantName', 'Vui lòng nhập họ tên.'],
  ['department', 'Vui lòng chọn đơn vị.'],
  ['contact', 'Vui lòng nhập email hoặc số điện thoại.'],
  ['challengeGroup', 'Vui lòng chọn nhóm dự thi.'],
  ['title', 'Vui lòng nhập tên bài dự thi.'],
  ['problem', 'Vui lòng nhập nội dung bài dự thi.'],
  ['aiTools', 'Vui lòng nhập các công cụ AI đã dùng.'],
];

function SubmitPage({ navigate }: { navigate: (href: string) => void }) {
  const [form, setForm] = useState<SubmissionFormState>(initialSubmissionForm);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([initialWorkflowStep]);
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });
  const [submissionFileInputKey, setSubmissionFileInputKey] = useState(0);
  const [evidenceFileInputKey, setEvidenceFileInputKey] = useState(0);
  const [coverImageInputKey, setCoverImageInputKey] = useState(0);

  function updateField<Key extends keyof SubmissionFormState>(field: Key, value: SubmissionFormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateWorkflowStep(index: number, field: keyof WorkflowStep, value: string) {
    setWorkflowSteps((current) => current.map((step, stepIndex) => (stepIndex === index ? { ...step, [field]: value } : step)));
  }

  function addWorkflowStep() {
    setWorkflowSteps((current) => [...current, { ...initialWorkflowStep }]);
  }

  function removeWorkflowStep(index: number) {
    setWorkflowSteps((current) => (current.length === 1 ? current : current.filter((_, stepIndex) => stepIndex !== index)));
  }

  function handleSubmissionFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const errors = validateUploadedFiles(selectedFiles, maxSubmissionFiles, 'file bài dự thi');
    setSubmissionFiles(selectedFiles.slice(0, maxSubmissionFiles));
    setStatus(errors.length ? { state: 'error', message: errors.join(' ') } : { state: 'idle' });
  }

  function handleEvidenceFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const errors = validateUploadedFiles(selectedFiles, maxEvidenceFiles, 'file minh chứng');
    setEvidenceFiles(selectedFiles.slice(0, maxEvidenceFiles));
    setStatus(errors.length ? { state: 'error', message: errors.join(' ') } : { state: 'idle' });
  }

  function handleCoverImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const errors = validateCoverImageFiles(selectedFiles);
    setCoverImageFile(selectedFiles[0] || null);
    setStatus(errors.length ? { state: 'error', message: errors.join(' ') } : { state: 'idle' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateSubmissionForm(form, workflowSteps, submissionFiles, evidenceFiles);
    if (validationErrors.length) {
      setStatus({ state: 'error', message: validationErrors.join(' ') });
      return;
    }

    setStatus({ state: 'submitting' });

    const payload = new FormData();
    const workflowSummary = formatWorkflowSteps(workflowSteps);
    const firstPrompt = workflowSteps.map((step) => step.prompt.trim()).find(Boolean) || workflowSummary;
    const payloadForm = {
      ...form,
      processSummary: workflowSummary,
      mainPrompt: firstPrompt,
      finalResult: workflowSummary,
      workflowSteps: JSON.stringify(workflowSteps.map((step) => ({
        content: step.content.trim(),
        tools: step.tools.trim(),
        prompt: step.prompt.trim(),
        response: step.response.trim(),
      }))),
    };

    for (const [field, value] of Object.entries(payloadForm)) {
      payload.append(field, typeof value === 'boolean' ? String(value) : value);
    }
    for (const file of submissionFiles) {
      payload.append('submissionFiles', file);
    }
    for (const file of evidenceFiles) {
      payload.append('evidenceFiles', file);
    }
    if (coverImageFile) {
      payload.append('coverImage', coverImageFile);
    }

    try {
      const response = await apiFetch('/api/submissions', {
        method: 'POST',
        body: payload,
      });
      const result = await response.json().catch(() => ({} as { id?: string; message?: string; errors?: string[] }));

      if (!response.ok || !result.id) {
        throw new Error(result.errors?.join(' ') || 'Không thể gửi bài dự thi. Vui lòng thử lại.');
      }

      setForm(initialSubmissionForm);
      setWorkflowSteps([{ ...initialWorkflowStep }]);
      setSubmissionFiles([]);
      setEvidenceFiles([]);
      setCoverImageFile(null);
      setSubmissionFileInputKey((current) => current + 1);
      setEvidenceFileInputKey((current) => current + 1);
      setCoverImageInputKey((current) => current + 1);
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
          <p>Gửi nội dung bài dự thi, nhật ký tác nghiệp và file minh chứng trực tiếp về hệ thống của Tạp chí Thời đại.</p>
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
              <input name="participantName" autoComplete="name" value={form.participantName} onChange={(event) => updateField('participantName', event.target.value)} />
            </label>
            <label className="formField">
              <span>Đơn vị <b>*</b></span>
              <select name="department" value={form.department} onChange={(event) => updateField('department', event.target.value)}>
                <option value="">Chọn đơn vị</option>
                {departmentOptions.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </label>
            <label className="formField">
              <span>Email hoặc số điện thoại <b>*</b></span>
              <input name="contact" autoComplete="email" value={form.contact} onChange={(event) => updateField('contact', event.target.value)} />
            </label>
            <label className="formField">
              <span>Email nhận phản hồi</span>
              <input name="email" type="email" autoComplete="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
            </label>
            <label className="formField">
              <span>Tuần thử thách <b>*</b></span>
              <select name="week" value={form.week} onChange={(event) => updateField('week', event.target.value)}>
                {challengeWeeks.map((week) => (
                  <option key={week.week} value={String(week.week)}>Tuần {week.week}: {week.title}</option>
                ))}
              </select>
            </label>
            <label className="formField">
              <span>Nhóm dự thi <b>*</b></span>
              <select name="challengeGroup" value={form.challengeGroup} onChange={(event) => updateField('challengeGroup', event.target.value)}>
                <option value="">Chọn nhóm dự thi</option>
                {challengeGroupOptions.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
              <small>Chọn đúng nhóm tương ứng với đề bài tuần 1.</small>
            </label>
            <label className="formField full">
              <span>Tên bài dự thi <b>*</b></span>
              <input name="title" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
            </label>
            <label className="formField full">
              <span>Nội dung bài dự thi <b>*</b></span>
              <textarea name="problem" rows={6} value={form.problem} onChange={(event) => updateField('problem', event.target.value)} />
              <small>Tóm tắt nội dung chính của bài dự thi hoặc sản phẩm nộp kèm.</small>
            </label>
            <label className="formField full">
              <span>File bài dự thi <b>*</b></span>
              <input
                key={submissionFileInputKey}
                name="submissionFiles"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.zip,.rar"
                onChange={handleSubmissionFileChange}
              />
              <small>Tối đa {maxSubmissionFiles} file bài dự thi, mỗi file không quá {maxEvidenceFileSizeMb}MB.</small>
            </label>
            <label className="formField full coverImageInput">
              <span>Ảnh đại diện bài dự thi</span>
              <input
                key={coverImageInputKey}
                name="coverImage"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleCoverImageChange}
              />
              <small>Không bắt buộc. Tự tạo ảnh đại diện từ file bài dự thi nếu không upload ảnh.</small>
            </label>
            <label className="formField full">
              <span>Các công cụ AI sử dụng <b>*</b></span>
              <input name="aiTools" value={form.aiTools} onChange={(event) => updateField('aiTools', event.target.value)} placeholder="Ví dụ: ChatGPT, Gemini, Claude, Canva..." />
            </label>
            <div className="formField full">
              <span>Nhật ký tác nghiệp <b>*</b></span>
              <div className="workflowSteps">
                {workflowSteps.map((step, index) => (
                  <article key={index} className="workflowStep">
                    <div className="workflowStepHeader">
                      <strong>Bước {index + 1}</strong>
                      {workflowSteps.length > 1 ? (
                        <button type="button" className="iconButton" aria-label={`Xóa bước ${index + 1}`} onClick={() => removeWorkflowStep(index)}>
                          <Icon name="delete" />
                        </button>
                      ) : null}
                    </div>
                    <label>
                      <span>Nội dung thực hiện</span>
                      <textarea name={`workflowStep${index + 1}Content`} rows={3} value={step.content} onChange={(event) => updateWorkflowStep(index, 'content', event.target.value)} />
                    </label>
                    <label>
                      <span>Công cụ AI sử dụng</span>
                      <input name={`workflowStep${index + 1}Tools`} value={step.tools} onChange={(event) => updateWorkflowStep(index, 'tools', event.target.value)} />
                    </label>
                    <label>
                      <span>Prompt sử dụng</span>
                      <textarea name={`workflowStep${index + 1}Prompt`} rows={4} value={step.prompt} onChange={(event) => updateWorkflowStep(index, 'prompt', event.target.value)} />
                    </label>
                    <label>
                      <span>Mô tả đáp án AI đưa ra, quá trình tương tác, chọn lọc, nêu lý do lựa chọn kết quả</span>
                      <textarea name={`workflowStep${index + 1}Response`} rows={4} value={step.response} onChange={(event) => updateWorkflowStep(index, 'response', event.target.value)} />
                      <small>Không copy nguyên văn toàn bộ phần trả lời của AI.</small>
                    </label>
                  </article>
                ))}
              </div>
              <button type="button" className="softButton addStepButton" onClick={addWorkflowStep}>
                <Icon name="add" /> Thêm bước
              </button>
            </div>
            <label className="formField">
              <span>Bài học kinh nghiệm</span>
              <textarea name="lessons" rows={4} value={form.lessons} onChange={(event) => updateField('lessons', event.target.value)} />
            </label>
            <label className="formField">
              <span>Kiến nghị, đề xuất hoặc phương pháp tương tác với AI</span>
              <textarea name="recommendations" rows={4} value={form.recommendations} onChange={(event) => updateField('recommendations', event.target.value)} />
            </label>
            <label className="formField full">
              <span>File minh chứng <b>*</b></span>
              <input
                key={evidenceFileInputKey}
                name="evidenceFiles"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.zip,.rar"
                onChange={handleEvidenceFileChange}
              />
              <small>Tối đa {maxEvidenceFiles} file, mỗi file không quá {maxEvidenceFileSizeMb}MB.</small>
            </label>
          </div>

          {submissionFiles.length ? (
            <FileList title="File bài dự thi đã chọn" files={submissionFiles} />
          ) : null}

          {coverImageFile ? (
            <FileList title="Ảnh đại diện đã chọn" files={[coverImageFile]} />
          ) : null}

          {evidenceFiles.length ? (
            <FileList title="File minh chứng đã chọn" files={evidenceFiles} />
          ) : null}

          <label className="checkboxField">
            <input name="publicPrompt" type="checkbox" checked={form.publicPrompt} onChange={(event) => updateField('publicPrompt', event.target.checked)} />
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

function FileList({ title, files }: { title: string; files: File[] }) {
  return (
    <div className="fileListGroup">
      <strong>{title}</strong>
      <ul className="selectedFiles">
        {files.map((file) => (
          <li key={`${file.name}-${file.size}`}>
            <Icon name="draft" />
            <span>{file.name}</span>
            <em>{formatFileSize(file.size)}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function validateSubmissionForm(form: SubmissionFormState, workflowSteps: WorkflowStep[], submissionFiles: File[], evidenceFiles: File[]) {
  const errors: string[] = [];
  for (const [field, message] of requiredSubmissionFields) {
    if (!String(form[field]).trim()) {
      errors.push(message);
    }
  }
  if (!hasCompleteWorkflowStep(workflowSteps)) {
    errors.push('Vui lòng nhập ít nhất một bước nhật ký tác nghiệp có nội dung, công cụ, prompt và mô tả kết quả.');
  }
  if (!submissionFiles.length) {
    errors.push('Vui lòng tải lên ít nhất một file bài dự thi.');
  }
  if (!evidenceFiles.length) {
    errors.push('Vui lòng tải lên ít nhất một file minh chứng.');
  }
  errors.push(...validateUploadedFiles(submissionFiles, maxSubmissionFiles, 'file bài dự thi'));
  errors.push(...validateUploadedFiles(evidenceFiles, maxEvidenceFiles, 'file minh chứng'));
  return errors;
}

function validateUploadedFiles(files: File[], limit: number, label: string) {
  const errors: string[] = [];
  if (files.length > limit) {
    errors.push(`Mỗi lần gửi tối đa ${limit} ${label}.`);
  }
  if (files.some((file) => file.size > maxEvidenceFileSizeBytes)) {
    errors.push(`Mỗi file không được vượt quá ${maxEvidenceFileSizeMb}MB.`);
  }
  return errors;
}

function validateCoverImageFiles(files: File[]) {
  const errors = validateUploadedFiles(files, maxCoverImages, 'ảnh đại diện bài dự thi');
  if (files.some((file) => {
    const lowerName = file.name.toLowerCase();
    return !coverImageExtensions.some((extension) => lowerName.endsWith(extension));
  })) {
    errors.push('Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WEBP.');
  }
  return errors;
}

function hasCompleteWorkflowStep(steps: WorkflowStep[]) {
  return steps.some((step) => step.content.trim() && step.tools.trim() && step.prompt.trim() && step.response.trim());
}

function formatWorkflowSteps(steps: WorkflowStep[]) {
  return steps
    .filter((step) => step.content.trim() || step.tools.trim() || step.prompt.trim() || step.response.trim())
    .map((step, index) => [
      `Bước ${index + 1}`,
      `Nội dung thực hiện: ${step.content.trim()}`,
      `Công cụ AI sử dụng: ${step.tools.trim()}`,
      `Prompt sử dụng: ${step.prompt.trim()}`,
      `Mô tả đáp án/quá trình chọn lọc: ${step.response.trim()}`,
    ].filter((line) => !line.endsWith(': ')).join('\n'))
    .filter(Boolean)
    .join('\n\n');
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function splitList(value: string) {
  return String(value || '')
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(date);
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
          ['Điều 5. Yêu cầu bài dự thi', 'Bài dự thi cần có thông tin người dự thi, tên và nội dung bài dự thi, file bài dự thi, các công cụ AI đã sử dụng, nhật ký tác nghiệp theo từng bước, file minh chứng, bài học kinh nghiệm, kiến nghị và phương pháp tương tác với AI.'],
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
  const [publicPrompts, setPublicPrompts] = useState<PublicPromptItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch('/api/public/prompts')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Cannot load prompts')))
      .then((data: { prompts?: PublicPromptItem[] }) => {
        if (active) setPublicPrompts(data.prompts ?? []);
      })
      .catch(() => {
        if (active) setPublicPrompts([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => ['Tất cả', ...Array.from(new Set(publicPrompts.map((prompt) => prompt.department).filter(Boolean)))], [publicPrompts]);
  const tools = useMemo(() => ['Tất cả', ...Array.from(new Set(publicPrompts.flatMap((prompt) => splitList(prompt.tool))))], [publicPrompts]);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return publicPrompts.filter((prompt) => {
      const text = `${prompt.title} ${prompt.purpose} ${prompt.department} ${prompt.contributor} ${prompt.tool}`.toLowerCase();
      return (
        (!keyword || text.includes(keyword)) &&
        (category === 'Tất cả' || prompt.department === category) &&
        (tool === 'Tất cả' || splitList(prompt.tool).includes(tool))
      );
    });
  }, [publicPrompts, query, category, tool]);

  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Kho Prompt' }]} />
      <SectionHeading
        eyebrow="Kho Prompt Thời đại"
        title="Tài nguyên dùng chung cho toàn cơ quan"
        description="Chỉ hiển thị prompt đã được Ban tổ chức duyệt từ các bài dự thi gửi lên hệ thống."
        action={<ResultsCount count={filtered.length} label="prompt" />}
      />
      <FilterPanel>
        <SearchInput value={query} onChange={setQuery} placeholder="Tìm prompt, tag, người chia sẻ..." />
        <SelectFilter label="Phòng/ban" value={category} options={categories.length > 1 ? categories : promptCategories.slice(0, 1)} onChange={setCategory} />
        <SelectFilter label="Công cụ" value={tool} options={tools.length > 1 ? tools : promptTools.slice(0, 1)} onChange={setTool} />
      </FilterPanel>
      {filtered.length ? (
        <div className="cardGrid two">
          {filtered.map((prompt) => (
            <article key={prompt.id} className="card promptCard">
              <div className="cardMeta">
                <Badge tone="red">Đã duyệt</Badge>
                <Badge tone="cyan">{prompt.tool || 'AI'}</Badge>
              </div>
              <h3>{prompt.title}</h3>
              <p>{prompt.purpose}</p>
              <div className="infoGrid">
                <div><dt>Người chia sẻ</dt><dd>{prompt.contributor}</dd></div>
                <div><dt>Phòng/ban</dt><dd>{prompt.department}</dd></div>
                <div><dt>Tuần</dt><dd>Tuần {prompt.week}</dd></div>
                <div><dt>Cập nhật</dt><dd>{formatDateTime(prompt.updatedAt)}</dd></div>
              </div>
              <pre className="promptBlock">{prompt.fullPrompt}</pre>
              <CopyPromptButton text={prompt.fullPrompt} onCopy={onCopy} />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={loaded ? 'Chưa có prompt được duyệt' : 'Đang tải kho prompt'}
          description={loaded ? 'Prompt từ bài dự thi sẽ xuất hiện tại đây sau khi Ban tổ chức duyệt chất lượng.' : 'Hệ thống đang kiểm tra dữ liệu đã duyệt.'}
        />
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
  const [department, setDepartment] = useState('Tất cả');
  const [publicSubmissions, setPublicSubmissions] = useState<PublicFeaturedSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [votingId, setVotingId] = useState('');
  const [voteNotice, setVoteNotice] = useState('');

  useEffect(() => {
    let active = true;
    const deviceId = getCommunityDeviceId();
    apiFetch(`/api/public/featured?deviceId=${encodeURIComponent(deviceId)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Cannot load featured submissions')))
      .then((data: { submissions?: PublicFeaturedSubmission[] }) => {
        if (active) setPublicSubmissions(data.submissions ?? []);
      })
      .catch(() => {
        if (active) setPublicSubmissions([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const departments = useMemo(() => ['Tất cả', ...Array.from(new Set(publicSubmissions.map((item) => item.department).filter(Boolean)))], [publicSubmissions]);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return publicSubmissions.filter((submission) => {
      const text = `${submission.title} ${submission.participantName} ${submission.department} ${submission.problem}`.toLowerCase();
      return (
        (!keyword || text.includes(keyword)) &&
        (week === 'Tất cả' || String(submission.week) === week) &&
        (department === 'Tất cả' || submission.department === department)
      );
    });
  }, [publicSubmissions, query, week, department]);

  async function voteForSubmission(id: string, reaction: CommunityVoteReaction) {
    const deviceId = getCommunityDeviceId();
    setVotingId(id);
    setVoteNotice('');
    try {
      const response = await apiFetch(`/api/public/submissions/${encodeURIComponent(id)}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deviceId, reaction }),
      });
      const data = await response.json().catch(() => ({} as {
        communityVoteCount?: number;
        communityReactions?: CommunityReactions;
        viewerHasVoted?: boolean;
        errors?: string[];
      }));
      if (!response.ok && response.status !== 409) {
        throw new Error(data.errors?.join(' ') || 'Không thể ghi nhận bình chọn.');
      }
      setPublicSubmissions((current) => current.map((submission) => (
        submission.id === id
          ? {
            ...submission,
            communityVoteCount: data.communityVoteCount ?? submission.communityVoteCount,
            communityReactions: data.communityReactions ?? submission.communityReactions,
            viewerHasVoted: data.viewerHasVoted ?? true,
          }
          : submission
      )));
      setVoteNotice(response.status === 409 ? 'Thiết bị này đã bình chọn bài dự thi này.' : 'Đã ghi nhận bình chọn cộng đồng.');
    } catch (error) {
      setVoteNotice(error instanceof Error ? error.message : 'Không thể ghi nhận bình chọn.');
    } finally {
      setVotingId('');
    }
  }

  return (
    <PageContainer>
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Bài tiêu biểu' }]} />
      <SectionHeading
        eyebrow="Bài dự thi tiêu biểu"
        title="Những quy trình AI có thể học hỏi"
        description="Chỉ hiển thị bài đã được Ban tổ chức duyệt thủ công để chia sẻ cho toàn cơ quan."
        action={<ResultsCount count={filtered.length} label="bài" />}
      />
      <FilterPanel>
        <SearchInput value={query} onChange={setQuery} placeholder="Tìm bài, người thực hiện, tag..." />
        <SelectFilter label="Tuần thi" value={week} options={['Tất cả', '1', '2', '3', '4', '5']} onChange={setWeek} />
        <SelectFilter label="Phòng/ban" value={department} options={departments} onChange={setDepartment} />
      </FilterPanel>
      {voteNotice ? <p className="communityVoteNotice" role="status">{voteNotice}</p> : null}
      {filtered.length ? (
        <div className="cardGrid two">
          {filtered.map((submission) => (
            <article key={submission.id} className="card submissionCard approvedSubmissionCard">
              <img className="approvedSubmissionImage" src={submission.image || '/assets/thoi-dai-logo.png'} alt={`Ảnh đại diện bài dự thi ${submission.title}`} loading="lazy" />
              <div className="cardBody">
                <div className="cardMeta">
                  <Badge tone="red">Đã duyệt</Badge>
                  <span>Điểm BGK: {submission.score}</span>
                </div>
                <h3>{submission.title}</h3>
                <p>{submission.problem}</p>
                <InfoGrid
                  items={[
                    ['Người thực hiện', submission.participantName],
                    ['Phòng/ban', submission.department],
                    ['Tuần thi', `Tuần ${submission.week}`],
                    ['Nhóm', submission.group],
                  ]}
                />
                <DetailSection title="Nhật ký tác nghiệp tóm tắt" items={[submission.processSummary]} />
                <DetailSection title="Kết quả chia sẻ" items={[submission.finalResult || 'Đã có file bài dự thi đính kèm trong hệ thống.']} />
                <CommunityVoteBox
                  submission={submission}
                  voting={votingId === submission.id}
                  onVote={voteForSubmission}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={loaded ? 'Chưa có bài tiêu biểu được duyệt' : 'Đang tải bài tiêu biểu'}
          description={loaded ? 'Bài dự thi sẽ xuất hiện tại đây sau khi Ban tổ chức chọn và duyệt thủ công.' : 'Hệ thống đang kiểm tra dữ liệu đã duyệt.'}
        />
      )}
    </PageContainer>
  );
}

function CommunityVoteBox({
  submission,
  voting,
  onVote,
}: {
  submission: PublicFeaturedSubmission;
  voting: boolean;
  onVote: (id: string, reaction: CommunityVoteReaction) => void;
}) {
  return (
    <div className="communityVoteBox">
      <div className="communityScoreRow">
        <span><Icon name="verified" /> Điểm BGK <strong>{submission.score}</strong></span>
        <span><Icon name="how_to_vote" /> Cộng đồng <strong>{submission.communityVoteCount || 0}</strong></span>
      </div>
      <div className="communityVoteActions" aria-label={`Bình chọn cộng đồng cho ${submission.title}`}>
        {communityVoteOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`communityVoteButton${submission.viewerHasVoted ? ' isVoted' : ''}`}
            disabled={submission.viewerHasVoted || voting}
            onClick={() => onVote(submission.id, option.id)}
          >
            <Icon name={option.icon} />
            <span>{option.label}</span>
            <strong>{submission.communityReactions?.[option.id] || 0}</strong>
          </button>
        ))}
      </div>
      {submission.viewerHasVoted ? (
        <span className="communityVotedBadge"><Icon name="check_circle" /> Đã bình chọn</span>
      ) : null}
    </div>
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
  const [items, setItems] = useState<PublicLeaderboardItem[]>([]);
  const [departments, setDepartments] = useState<PublicDepartmentScore[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    apiFetch('/api/public/leaderboard')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Cannot load leaderboard')))
      .then((data: { items?: PublicLeaderboardItem[]; departments?: PublicDepartmentScore[] }) => {
        if (!active) return;
        setItems(data.items ?? []);
        setDepartments(data.departments ?? []);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setDepartments([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const visibleItems = tab === 'Tổng kết' ? items : items.filter((item) => String(item.week) === tab);
  const visibleLeaderboardItems = visibleItems.map((item) => ({
    ...item,
    week: Number(item.week) || 0,
    badge: 'Người khởi đầu AI',
  }));
  const stats = [
    ['Bài đã chấm điểm', String(items.length)],
    ['Phòng/ban có điểm', String(departments.length)],
    ['Điểm cao nhất', String(items[0]?.score ?? 0)],
    ['Bài đang dẫn đầu', items[0]?.submissionTitle || 'Chờ cập nhật'],
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
      {visibleLeaderboardItems.length ? (
        <>
          <Podium items={visibleLeaderboardItems} />
          <SectionHeading title="Bảng xếp hạng cá nhân/nhóm" />
          <LeaderboardTable items={visibleLeaderboardItems} />
        </>
      ) : (
        <EmptyState
          title={loaded ? 'Chưa có điểm để xếp hạng' : 'Đang tải bảng vàng'}
          description={loaded ? 'Bảng vàng sẽ tự động sắp xếp khi Ban giám khảo nhập điểm trong dashboard.' : 'Hệ thống đang kiểm tra dữ liệu điểm.'}
        />
      )}
      <SectionHeading title="Bảng xếp hạng phòng/ban" />
      {departments.length ? <DepartmentLeaderboard items={departments.map((item) => ({
        department: item.department,
        submissionCount: item.submissionCount,
        promptCount: 0,
        averageScore: item.averageScore,
        featuredSubmission: item.featuredSubmission,
      }))} /> : <EmptyState title="Chưa có điểm phòng/ban" description="Số liệu sẽ tự tổng hợp sau khi có bài được chấm." />}
      <SectionHeading title="Huy hiệu" />
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
    </PageContainer>
  );
}

function AiNewsPage({ navigate }: { navigate: (href: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const featured = aiNewsItems[0];
  const categories = useMemo(() => ['Tất cả', ...Array.from(new Set(aiNewsItems.map((item) => item.category)))], []);
  const visibleNews = useMemo(() => {
    if (activeCategory === 'Tất cả') {
      return aiNewsItems.filter((item) => item.id !== featured.id);
    }
    return aiNewsItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, featured.id]);

  const resourceLinks = [
    { icon: 'upload_file', title: 'Nộp bài dự thi', description: 'Gửi bài, nhật ký prompt và file minh chứng trực tiếp lên VPS.', href: '/submit' },
    { icon: 'science', title: 'AI Lab', description: 'Xem công cụ và hướng dẫn dùng AI an toàn trong công việc.', href: '/ai-lab' },
    { icon: 'terminal', title: 'Kho Prompt', description: 'Tái sử dụng các prompt đã được kiểm chứng trong cuộc thi.', href: '/prompts' },
  ];

  return (
    <PageContainer className="aiNewsPage">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức AI' }]} navigate={navigate} />

      <section className="aiNewsHero">
        <div>
          <SectionHeading
            eyebrow="Tin tức AI"
            title="Cập nhật AI cho tòa soạn và cuộc thi"
            description="Theo dõi cách dùng AI trong nghiệp vụ báo chí, cập nhật công cụ mới và các gợi ý giúp bài dự thi rõ quy trình, rõ tác động."
          />
          <div className="aiNewsTopics" aria-label="Lọc tin tức AI theo chủ đề">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === activeCategory ? 'active' : ''}
                aria-pressed={category === activeCategory}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <aside className="aiNewsHeroStats">
          <span>{aiNewsItems.length}</span>
          <strong>bản tin</strong>
          <p>Ưu tiên nội dung có thể áp dụng ngay cho bài dự thi và công việc hằng ngày.</p>
        </aside>
      </section>

      <section className="aiNewsFeatured">
        <img src={featured.image} alt={featured.title} />
        <div className="aiNewsFeaturedBody">
          <Badge tone="red">{featured.category}</Badge>
          <h2>{featured.title}</h2>
          <p>{featured.summary}</p>
          <div className="aiNewsMeta">
            <span><Icon name="calendar_month" /> {featured.date}</span>
            <span><Icon name="schedule" /> {featured.readTime}</span>
          </div>
          <ul>
            {featured.content.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="aiNewsActions">
            <AppLink href={`/ai-news/${featured.id}`} navigate={navigate} className="primaryButton">Đọc bài chi tiết</AppLink>
            <AppLink href="/submit" navigate={navigate} className="ghostButton">Nộp bài ứng dụng AI</AppLink>
            <AppLink href="/ai-lab" navigate={navigate} className="ghostButton">Xem AI Lab</AppLink>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          title={activeCategory === 'Tất cả' ? 'Bản tin mới nhất' : activeCategory}
          description="Các ghi chú ngắn, dễ áp dụng cho từng nhóm dự thi và các phòng/ban."
          action={<ResultsCount count={visibleNews.length} label="tin" />}
        />
        <div className="aiNewsGrid">
          {visibleNews.map((item) => (
            <article key={item.id} className="card aiNewsCard">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <Badge tone="soft">{item.category}</Badge>
                <h3>
                  <AppLink href={`/ai-news/${item.id}`} navigate={navigate} className="aiNewsTitleLink">
                    {item.title}
                  </AppLink>
                </h3>
                <p>{item.summary}</p>
                <div className="aiNewsMeta">
                  <span><Icon name="calendar_month" /> {item.date}</span>
                  <span><Icon name="schedule" /> {item.readTime}</span>
                </div>
                <div className="tagList">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <AppLink href={`/ai-news/${item.id}`} navigate={navigate} className="aiNewsReadMore">
                  Đọc tiếp <Icon name="arrow_forward" />
                </AppLink>
              </div>
            </article>
          ))}
          {!visibleNews.length ? <EmptyState title="Chưa có tin trong chủ đề này" description="Hãy chọn chủ đề khác để xem thêm bản tin AI." /> : null}
        </div>
      </section>

      <section className="aiNewsResourcePanel">
        <SectionHeading title="Lối tắt cho người dự thi" description="Từ bản tin, chuyển nhanh sang các khu vực cần dùng nhiều nhất trong cuộc thi." />
        <div className="cardGrid three">
          {resourceLinks.map((item) => (
            <AppLink key={item.href} href={item.href} navigate={navigate} className="aiNewsResourceLink">
              <Icon name={item.icon} />
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </AppLink>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

function AiNewsDetailPage({ id, navigate }: { id: string; navigate: (href: string) => void }) {
  const article = findAINewsItem(id);
  if (!article) return <NotFoundPage navigate={navigate} />;

  const relatedArticles = aiNewsItems
    .filter((item) => item.id !== article.id)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, 3);

  return (
    <PageContainer className="aiNewsDetailPage">
      <Breadcrumb navigate={navigate} items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức AI', href: '/ai-news' }, { label: article.title }]} />

      <section className="aiNewsDetailHero">
        <div>
          <Badge tone="red">{article.category}</Badge>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <div className="aiNewsMeta">
            <span><Icon name="calendar_month" /> {article.date}</span>
            <span><Icon name="schedule" /> {article.readTime}</span>
          </div>
          <div className="tagList">
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="aiNewsActions">
            <AppLink href="/ai-news" navigate={navigate} className="ghostButton"><Icon name="arrow_back" /> Quay lại bản tin</AppLink>
            <AppLink href="/submit" navigate={navigate} className="primaryButton"><Icon name="upload_file" /> Nộp bài ứng dụng AI</AppLink>
          </div>
        </div>
        <img src={article.image} alt={article.title} />
      </section>

      <section className="aiNewsDetailLayout">
        <article className="card aiNewsArticleBody">
          {article.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="aiNewsArticleNote">
            <Icon name="tips_and_updates" />
            <span>Gợi ý áp dụng: lưu lại prompt, đầu vào, đầu ra và phần biên tập thủ công để bài dự thi thể hiện rõ quy trình làm việc với AI.</span>
          </div>
        </article>
        <aside className="aiNewsDetailAside">
          <section className="card">
            <h2>Ứng dụng vào bài dự thi</h2>
            <ul>
              <li>Chọn một vấn đề thật trong phòng/ban.</li>
              <li>Mô tả prompt và công cụ AI đã dùng.</li>
              <li>So sánh kết quả trước và sau khi dùng AI.</li>
              <li>Nêu điều kiện để người khác áp dụng lại.</li>
            </ul>
          </section>
          <section className="card">
            <h2>Lối tắt hữu ích</h2>
            <div className="aiNewsSideLinks">
              <AppLink href="/prompts" navigate={navigate}>Kho Prompt</AppLink>
              <AppLink href="/ai-lab" navigate={navigate}>AI Lab</AppLink>
              <AppLink href="/forum" navigate={navigate}>Diễn đàn AI</AppLink>
            </div>
          </section>
        </aside>
      </section>

      <section>
        <SectionHeading title="Bài viết liên quan" description="Đọc tiếp các ghi chú AI có thể áp dụng ngay cho công việc và bài dự thi." />
        <div className="aiNewsRelatedGrid">
          {relatedArticles.map((item) => (
            <AppLink key={item.id} href={`/ai-news/${item.id}`} navigate={navigate} className="card aiNewsRelatedCard">
              <img src={item.image} alt={item.title} loading="lazy" />
              <span>{item.category}</span>
              <strong>{item.title}</strong>
              <small>{item.date} · {item.readTime}</small>
            </AppLink>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

function ForumPage({ navigate }: { navigate: (href: string) => void }) {
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [threadForm, setThreadForm] = useState<ForumThreadForm>(initialForumThreadForm);
  const [replyForms, setReplyForms] = useState<Record<string, ForumReplyForm>>({});
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch('/api/forum/threads')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Cannot load forum threads')))
      .then((data: { threads?: ForumThread[] }) => {
        if (active) setForumThreads(data.threads ?? []);
      })
      .catch(() => {
        if (active) setStatus({ state: 'error', message: 'Chưa tải được Diễn đàn AI. Vui lòng thử lại sau.' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleThreads = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return forumThreads.filter((thread) => {
      const matchesCategory = activeCategory === 'Tất cả' || thread.category === activeCategory;
      const matchesKeyword = !keyword || `${thread.title} ${thread.content} ${thread.authorName} ${thread.department} ${thread.aiTools} ${thread.category}`.toLowerCase().includes(keyword);
      return matchesCategory && matchesKeyword;
    });
  }, [activeCategory, forumThreads, query]);

  const replyTotal = forumThreads.reduce((total, thread) => total + thread.replyCount, 0);

  function updateThreadField(field: keyof ForumThreadForm, value: string) {
    setThreadForm((current) => ({ ...current, [field]: value }));
  }

  function updateReplyField(threadId: string, field: keyof ForumReplyForm, value: string) {
    setReplyForms((current) => ({
      ...current,
      [threadId]: { ...(current[threadId] || initialForumReplyForm), [field]: value },
    }));
  }

  async function submitForumThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: 'submitting' });
    try {
      const response = await apiFetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(threadForm),
      });
      const data = await response.json().catch(() => ({} as { thread?: ForumThread; errors?: string[]; message?: string }));
      if (!response.ok || !data.thread) throw new Error(data.errors?.join(' ') || 'Không thể đăng chủ đề diễn đàn.');

      setForumThreads((current) => [data.thread as ForumThread, ...current.filter((thread) => thread.id !== data.thread?.id)]);
      setThreadForm(initialForumThreadForm);
      setStatus({ state: 'success', receiptId: data.thread.id, message: data.message || 'Chủ đề đã được đăng.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể đăng chủ đề diễn đàn.' });
    }
  }

  async function submitForumReply(threadId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = replyForms[threadId] || initialForumReplyForm;
    setStatus({ state: 'submitting' });
    try {
      const response = await apiFetch(`/api/forum/threads/${encodeURIComponent(threadId)}/replies`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({} as { thread?: ForumThread; errors?: string[]; message?: string }));
      if (!response.ok || !data.thread) throw new Error(data.errors?.join(' ') || 'Không thể gửi phản hồi.');

      setForumThreads((current) => current.map((thread) => thread.id === threadId ? data.thread as ForumThread : thread));
      setReplyForms((current) => ({
        ...current,
        [threadId]: { authorName: form.authorName, department: form.department, content: '' },
      }));
      setStatus({ state: 'success', receiptId: threadId, message: data.message || 'Phản hồi đã được gửi.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể gửi phản hồi.' });
    }
  }

  return (
    <PageContainer className="forumPage">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Diễn đàn AI' }]} navigate={navigate} />
      <section className="forumHero">
        <div>
          <SectionHeading
            eyebrow="Diễn đàn AI"
            title="Trao đổi kinh nghiệm sử dụng AI"
            description="Không gian để mọi người đặt câu hỏi, chia sẻ prompt, kể lại cách dùng công cụ AI trong công việc và học nhanh từ kinh nghiệm của đồng nghiệp."
          />
          <div className="forumHeroActions">
            <AppLink href="/prompts" navigate={navigate} className="ghostButton"><Icon name="terminal" /> Kho Prompt</AppLink>
            <AppLink href="/ai-news" navigate={navigate} className="ghostButton"><Icon name="newspaper" /> Tin tức AI</AppLink>
          </div>
        </div>
        <aside className="forumStats">
          <div><strong>{forumThreads.length}</strong><span>chủ đề</span></div>
          <div><strong>{replyTotal}</strong><span>phản hồi</span></div>
        </aside>
      </section>

      {status.state === 'success' ? <p className="forumNotice success" role="status">{status.message}</p> : null}
      {status.state === 'error' ? <p className="forumNotice error" role="alert">{status.message}</p> : null}

      <section className="forumLayout">
        <div className="forumMain">
          <FilterPanel>
            <SearchInput value={query} onChange={setQuery} placeholder="Tìm theo chủ đề, công cụ, người chia sẻ..." />
            <SelectFilter label="Chủ đề" value={activeCategory} options={forumFilterOptions} onChange={setActiveCategory} />
          </FilterPanel>
          <SectionHeading title="Thảo luận mới nhất" action={<ResultsCount count={visibleThreads.length} label="chủ đề" />} />
          <div className="forumThreads">
            {loading ? <EmptyState title="Đang tải diễn đàn" description="Danh sách thảo luận sẽ hiển thị trong giây lát." /> : null}
            {!loading && visibleThreads.length ? visibleThreads.map((thread) => {
              const replyForm = replyForms[thread.id] || initialForumReplyForm;
              return (
                <article className="card forumThreadCard" key={thread.id}>
                  <div className="forumThreadHeader">
                    <Badge tone="red">{thread.category}</Badge>
                    <span><Icon name="forum" /> {thread.replyCount} phản hồi</span>
                  </div>
                  <h3>{thread.title}</h3>
                  <p>{thread.content}</p>
                  <div className="forumThreadMeta">
                    <span><Icon name="person" /> {thread.authorName}</span>
                    <span><Icon name="apartment" /> {thread.department || 'Chưa ghi phòng/ban'}</span>
                    <span><Icon name="schedule" /> {formatDateTime(thread.createdAt)}</span>
                    {thread.aiTools ? <span><Icon name="psychology" /> {thread.aiTools}</span> : null}
                  </div>
                  {thread.replies.length ? (
                    <div className="forumReplyList">
                      {thread.replies.map((reply) => (
                        <article className="forumReplyItem" key={reply.id}>
                          <div>
                            <strong>{reply.authorName}</strong>
                            <span>{reply.department || 'Chưa ghi phòng/ban'} · {formatDateTime(reply.createdAt)}</span>
                          </div>
                          <p>{reply.content}</p>
                        </article>
                      ))}
                    </div>
                  ) : null}
                  <form className="forumReplyForm" onSubmit={(event) => submitForumReply(thread.id, event)}>
                    <input value={replyForm.authorName} onChange={(event) => updateReplyField(thread.id, 'authorName', event.target.value)} placeholder="Họ tên" />
                    <input value={replyForm.department} onChange={(event) => updateReplyField(thread.id, 'department', event.target.value)} placeholder="Phòng/ban" />
                    <textarea value={replyForm.content} onChange={(event) => updateReplyField(thread.id, 'content', event.target.value)} placeholder="Chia sẻ thêm kinh nghiệm hoặc câu trả lời..." rows={3} />
                    <button type="submit" className="softButton" disabled={status.state === 'submitting'}><Icon name="reply" /> Gửi phản hồi</button>
                  </form>
                </article>
              );
            }) : null}
            {!loading && !visibleThreads.length ? <EmptyState title="Chưa có thảo luận phù hợp" description="Hãy thử đổi bộ lọc hoặc mở chủ đề đầu tiên cho mọi người cùng trao đổi." /> : null}
          </div>
        </div>

        <aside className="forumSide">
          <form className="card forumThreadForm" onSubmit={submitForumThread}>
            <Icon name="forum" />
            <h2>Mở chủ đề mới</h2>
            <label>Họ tên<input value={threadForm.authorName} onChange={(event) => updateThreadField('authorName', event.target.value)} placeholder="Nguyễn Văn A" /></label>
            <label>Phòng/ban<input value={threadForm.department} onChange={(event) => updateThreadField('department', event.target.value)} placeholder="Ban Nội dung số" /></label>
            <label>Nhóm nội dung<select value={threadForm.category} onChange={(event) => updateThreadField('category', event.target.value)}>
              {forumCategories.map((category) => <option key={category}>{category}</option>)}
            </select></label>
            <label>Tiêu đề<input value={threadForm.title} onChange={(event) => updateThreadField('title', event.target.value)} placeholder="Ví dụ: Prompt tóm tắt tài liệu dài" /></label>
            <label>Công cụ AI đã dùng<input value={threadForm.aiTools} onChange={(event) => updateThreadField('aiTools', event.target.value)} placeholder="ChatGPT, Gemini, Canva..." /></label>
            <label>Nội dung chia sẻ<textarea value={threadForm.content} onChange={(event) => updateThreadField('content', event.target.value)} rows={6} placeholder="Mô tả vấn đề, cách làm, prompt hoặc kinh nghiệm rút ra" /></label>
            <button type="submit" className="primaryButton" disabled={status.state === 'submitting'}><Icon name="send" /> Đăng chủ đề</button>
          </form>
        </aside>
      </section>
    </PageContainer>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: '', department: '', email: '', message: '', attachment: '' });
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });

  function updateContactField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ state: 'error', message: 'Vui lòng nhập họ tên, email và nội dung cần hỗ trợ.' });
      return;
    }

    setStatus({ state: 'submitting' });
    try {
      const response = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({} as { message?: string; errors?: string[]; id?: string }));
      if (!response.ok) {
        throw new Error(result.errors?.join(' ') || 'Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.');
      }
      setForm({ name: '', department: '', email: '', message: '', attachment: '' });
      setStatus({ state: 'success', receiptId: result.id || '', message: result.message || 'Yêu cầu hỗ trợ đã được tiếp nhận.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.' });
    }
  }

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
        <form className="card contactForm" onSubmit={handleContactSubmit}>
          <h2>Form hỗ trợ</h2>
          <label>Họ tên<input name="contactName" autoComplete="name" value={form.name} onChange={(event) => updateContactField('name', event.target.value)} placeholder="Nguyễn Văn A" /></label>
          <label>Phòng/ban<input name="contactDepartment" value={form.department} onChange={(event) => updateContactField('department', event.target.value)} placeholder="Ban Nội dung số" /></label>
          <label>Email<input name="contactEmail" type="email" autoComplete="email" value={form.email} onChange={(event) => updateContactField('email', event.target.value)} placeholder="email@thoidai.vn" /></label>
          <label>Nội dung cần hỗ trợ<textarea name="contactMessage" rows={5} value={form.message} onChange={(event) => updateContactField('message', event.target.value)} placeholder="Mô tả câu hỏi hoặc vấn đề cần hỗ trợ" /></label>
          <label>File/link đính kèm nếu có<input name="contactAttachment" value={form.attachment} onChange={(event) => updateContactField('attachment', event.target.value)} placeholder="Đường dẫn file minh chứng hoặc tài liệu liên quan" /></label>
          {status.state === 'error' ? <div className="formAlert error"><Icon name="error" /> {status.message}</div> : null}
          {status.state === 'success' ? <div className="formAlert success"><Icon name="check_circle" /> {status.message}</div> : null}
          <button className="primaryButton" type="submit" disabled={status.state === 'submitting'}>{status.state === 'submitting' ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}</button>
        </form>
      </section>
    </PageContainer>
  );
}

function AdminPage() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem('aiChallengeAdminToken') || '');
  const [adminUser, setAdminUser] = useState(() => window.sessionStorage.getItem('aiChallengeAdminUser') || '');
  const [adminRole, setAdminRole] = useState<AdminRole>(() => normalizeAdminRole(window.sessionStorage.getItem('aiChallengeAdminRole')));
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>([]);
  const [userForm, setUserForm] = useState({ username: '', displayName: '', role: 'judge', password: '' });
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });
  const [activeAdminView, setActiveAdminView] = useState<AdminView>(() => adminViewFromHash(window.location.hash));

  useEffect(() => {
    if (token) {
      void loadAdminData(token, adminRole);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActiveAdminView(adminViewFromHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function updateLoginField(field: keyof typeof loginForm, value: string) {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }

  function updateUserForm(field: keyof typeof userForm, value: string) {
    setUserForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password) {
      setStatus({ state: 'error', message: 'Vui lòng nhập tài khoản và mật khẩu quản trị.' });
      return;
    }

    setStatus({ state: 'submitting' });
    try {
      const response = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json().catch(() => ({} as { token?: string; username?: string; role?: string; errors?: string[] }));
      if (!response.ok || !data.token) {
        throw new Error(data.errors?.join(' ') || 'Không thể đăng nhập quản trị.');
      }

      const nextUser = data.username || loginForm.username.trim();
      const nextRole = normalizeAdminRole(data.role) || 'viewer';
      window.sessionStorage.setItem('aiChallengeAdminToken', data.token);
      window.sessionStorage.setItem('aiChallengeAdminUser', nextUser);
      window.sessionStorage.setItem('aiChallengeAdminRole', nextRole);
      setToken(data.token);
      setAdminUser(nextUser);
      setAdminRole(nextRole);
      setLoginForm((current) => ({ ...current, password: '' }));
      await loadAdminData(data.token, nextRole);
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể đăng nhập quản trị.' });
    }
  }

  function handleAdminLogout() {
    window.sessionStorage.removeItem('aiChallengeAdminToken');
    window.sessionStorage.removeItem('aiChallengeAdminUser');
    window.sessionStorage.removeItem('aiChallengeAdminRole');
    window.localStorage.removeItem('aiChallengeAdminToken');
    window.localStorage.removeItem('aiChallengeAdminUser');
    window.localStorage.removeItem('aiChallengeAdminRole');
    setToken('');
    setAdminUser('');
    setAdminRole('');
    setSubmissions([]);
    setMessages([]);
    setAdminUsers([]);
    setAdminAuditLogs([]);
    setStatus({ state: 'idle' });
    setLoginForm({ username: 'admin', password: '' });
  }

  async function loadAdminData(nextToken = token, nextRole = adminRole) {
    if (!nextToken.trim()) {
      setStatus({ state: 'error', message: 'Vui lòng đăng nhập quản trị.' });
      return;
    }

    setStatus({ state: 'submitting' });
    try {
      const role = normalizeAdminRole(nextRole) || 'viewer';
      const [submissionResponse, contactResponse] = await Promise.all([
        apiFetch('/api/admin/submissions', { headers: { 'x-admin-token': nextToken } }),
        apiFetch('/api/admin/contact-messages', { headers: { 'x-admin-token': nextToken } }),
      ]);
      const submissionData = await submissionResponse.json().catch(() => ({} as { submissions?: AdminSubmission[]; errors?: string[] }));
      const contactData = await contactResponse.json().catch(() => ({} as { messages?: ContactMessage[]; errors?: string[] }));
      let userData = {} as { users?: AdminUser[]; errors?: string[] };
      let auditData = {} as { logs?: AdminAuditLog[]; errors?: string[] };
      let userResponse: Pick<Response, 'ok'> = { ok: true };
      let auditResponse: Pick<Response, 'ok'> = { ok: true };
      if (role === 'admin') {
        const [nextUserResponse, nextAuditResponse] = await Promise.all([
          apiFetch('/api/admin/users', { headers: { 'x-admin-token': nextToken } }),
          apiFetch('/api/admin/audit-logs', { headers: { 'x-admin-token': nextToken } }),
        ]);
        userResponse = nextUserResponse;
        auditResponse = nextAuditResponse;
        userData = await nextUserResponse.json().catch(() => ({} as { users?: AdminUser[]; errors?: string[] }));
        auditData = await nextAuditResponse.json().catch(() => ({} as { logs?: AdminAuditLog[]; errors?: string[] }));
      }

      if (!submissionResponse.ok) throw new Error(submissionData.errors?.join(' ') || 'Không thể tải danh sách bài dự thi.');
      if (!contactResponse.ok) throw new Error(contactData.errors?.join(' ') || 'Không thể tải danh sách liên hệ.');
      if (!userResponse.ok) throw new Error(userData.errors?.join(' ') || 'Không thể tải danh sách tài khoản.');
      if (!auditResponse.ok) throw new Error(auditData.errors?.join(' ') || 'Không thể tải nhật ký quản trị.');

      window.sessionStorage.setItem('aiChallengeAdminToken', nextToken);
      window.sessionStorage.setItem('aiChallengeAdminRole', role);
      setToken(nextToken);
      setAdminRole(role);
      setSubmissions(submissionData.submissions ?? []);
      setMessages(contactData.messages ?? []);
      setAdminUsers(userData.users ?? []);
      setAdminAuditLogs(auditData.logs ?? []);
      setStatus({ state: 'success', receiptId: '', message: 'Đã tải dữ liệu quản trị.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể tải dữ liệu quản trị.' });
    }
  }

  async function updateSubmission(id: string, patch: Partial<AdminSubmission>) {
    try {
      const response = await apiFetch(`/api/admin/submissions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(patch),
      });
      const data = await response.json().catch(() => ({} as { submission?: AdminSubmission; errors?: string[] }));
      if (!response.ok || !data.submission) {
        throw new Error(data.errors?.join(' ') || 'Không thể cập nhật bài dự thi.');
      }
      setSubmissions((current) => current.map((item) => (item.id === id ? data.submission! : item)));
      setStatus({ state: 'success', receiptId: '', message: 'Đã cập nhật bài dự thi.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể cập nhật bài dự thi.' });
    }
  }

  async function createAdminUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm.username.trim() || !userForm.password.trim()) {
      setStatus({ state: 'error', message: 'Vui lòng nhập tên đăng nhập và mật khẩu tài khoản mới.' });
      return;
    }

    try {
      const response = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(userForm),
      });
      const data = await response.json().catch(() => ({} as { user?: AdminUser; errors?: string[] }));
      if (!response.ok || !data.user) {
        throw new Error(data.errors?.join(' ') || 'Không thể tạo tài khoản quản trị.');
      }
      setAdminUsers((current) => [...current, data.user!]);
      setUserForm({ username: '', displayName: '', role: 'judge', password: '' });
      setStatus({ state: 'success', receiptId: '', message: 'Đã tạo tài khoản quản trị.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể tạo tài khoản quản trị.' });
    }
  }

  async function updateAdminUser(id: string, patch: Partial<AdminUser> & { password?: string }) {
    try {
      const response = await apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(patch),
      });
      const data = await response.json().catch(() => ({} as { user?: AdminUser; errors?: string[] }));
      if (!response.ok || !data.user) {
        throw new Error(data.errors?.join(' ') || 'Không thể cập nhật tài khoản quản trị.');
      }
      setAdminUsers((current) => current.map((user) => (user.id === id ? data.user! : user)));
      setStatus({ state: 'success', receiptId: '', message: 'Đã cập nhật tài khoản quản trị.' });
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'Không thể cập nhật tài khoản quản trị.' });
    }
  }

  async function downloadAdminCsv() {
    await downloadAdminBlob('/api/submissions/export.csv', 'ai-challenge-submissions.csv');
  }

  async function downloadAdminFile(file: AdminFile) {
    await downloadAdminBlob(file.downloadUrl, file.originalName || 'ai-challenge-file');
  }

  async function downloadAdminBlob(url: string, filename: string) {
    if (!token) {
      setStatus({ state: 'error', message: 'Vui lÃ²ng Ä‘Äƒng nháº­p quáº£n trá»‹.' });
      return;
    }

    try {
      const response = await apiFetch(url, {
        headers: { 'x-admin-token': token },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({} as { errors?: string[] }));
        throw new Error(data.errors?.join(' ') || 'KhÃ´ng thá»ƒ táº£i file.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº£i file.' });
    }
  }

  const canManageUsers = adminRole === 'admin';
  const canReviewSubmissions = adminRole === 'admin' || adminRole === 'judge';
  useEffect(() => {
    if ((activeAdminView !== 'users' && activeAdminView !== 'audit') || canManageUsers) return;
    setActiveAdminView('overview');
    if (window.location.hash === adminViewAnchors.users || window.location.hash === adminViewAnchors.audit) {
      window.history.replaceState(null, '', adminViewAnchors.overview);
    }
  }, [activeAdminView, canManageUsers]);

  const pendingScoringCount = submissions.filter((submission) => submission.reviewStatus !== 'scored').length;
  const scoredCount = submissions.filter((submission) => submission.reviewStatus === 'scored').length;
  const communityVoteTotal = submissions.reduce((total, submission) => total + (submission.communityVoteCount || 0), 0);
  const adminStats: Array<{ value: string; label: string; accent?: boolean; adminOnly?: boolean }> = [
    { value: String(submissions.length), label: 'Bài dự thi' },
    { value: String(pendingScoringCount), label: 'Chờ chấm' },
    { value: String(scoredCount), label: 'Đã chấm', accent: true },
    { value: String(communityVoteTotal), label: 'Bình chọn' },
    { value: String(adminUsers.length), label: 'Tài khoản', adminOnly: true },
    { value: String(adminAuditLogs.length), label: 'Nhật ký', adminOnly: true },
    { value: String(messages.length), label: 'Hỗ trợ' },
  ];
  const adminQuickLinks: Array<{ view: AdminView; href: string; icon: string; label: string; count: string; unit: string; adminOnly?: boolean }> = [
    { view: 'submissions', href: adminViewAnchors.submissions, icon: 'folder_open', label: 'Quản lý bài dự thi', count: String(submissions.length), unit: 'bài' },
    { view: 'scoring', href: adminViewAnchors.scoring, icon: 'grading', label: 'Chấm điểm bài thi', count: String(pendingScoringCount), unit: 'chờ chấm' },
    { view: 'users', href: adminViewAnchors.users, icon: 'manage_accounts', label: 'Quản trị user', count: String(adminUsers.length), unit: 'user', adminOnly: true },
    { view: 'audit', href: adminViewAnchors.audit, icon: 'history', label: 'Nhật ký quản trị', count: String(adminAuditLogs.length), unit: 'log', adminOnly: true },
    { view: 'support', href: adminViewAnchors.support, icon: 'support_agent', label: 'Yêu cầu hỗ trợ', count: String(messages.length), unit: 'yêu cầu' },
  ];

  const visibleAdminStats = adminStats.filter((stat) => canManageUsers || !stat.adminOnly);
  const visibleAdminQuickLinks = adminQuickLinks.filter((link) => canManageUsers || !link.adminOnly);

  return (
    <main className="adminApp">
      <aside className="adminSidebar">
        <a className="adminSidebarBrand" href="/">
          <img src="/assets/thoi-dai-logo.png" alt="Tạp chí Thời đại" />
          <span>Thử thách AI</span>
          <strong>Quản trị</strong>
        </a>
        <nav className="adminSidebarNav" aria-label="Điều hướng quản trị">
          <a className={activeAdminView === 'overview' ? 'isActive' : undefined} href={adminViewAnchors.overview} onClick={() => setActiveAdminView('overview')}><Icon name="dashboard" /> Tổng quan</a>
          <a className={activeAdminView === 'submissions' ? 'isActive' : undefined} href={adminViewAnchors.submissions} onClick={() => setActiveAdminView('submissions')}><Icon name="folder_open" /> Quản lý bài dự thi</a>
          <a className={activeAdminView === 'scoring' ? 'isActive' : undefined} href={adminViewAnchors.scoring} onClick={() => setActiveAdminView('scoring')}><Icon name="grading" /> Chấm điểm bài thi</a>
          {canManageUsers ? (
            <a className={activeAdminView === 'users' ? 'isActive' : undefined} href={adminViewAnchors.users} onClick={() => setActiveAdminView('users')}><Icon name="manage_accounts" /> Quản trị user</a>
          ) : null}
          {canManageUsers ? (
            <a className={activeAdminView === 'audit' ? 'isActive' : undefined} href={adminViewAnchors.audit} onClick={() => setActiveAdminView('audit')}><Icon name="history" /> Nhật ký quản trị</a>
          ) : null}
          <a className={activeAdminView === 'support' ? 'isActive' : undefined} href={adminViewAnchors.support} onClick={() => setActiveAdminView('support')}><Icon name="support_agent" /> Yêu cầu hỗ trợ</a>
        </nav>
        <div className="adminSidebarFooter">
          <a href="/">Về trang frontend</a>
          <span>{adminUser ? `Đang đăng nhập: ${adminUser}` : 'Chưa đăng nhập'}</span>
        </div>
      </aside>
      <section className="adminMain">
        <div className="adminMainInner">
          <section className="adminPageHeader">
            <SectionHeading
              eyebrow="Quản trị"
              title="Dashboard Ban tổ chức"
              description="Xem nhanh số liệu chính và đi tới từng phần quản trị."
            />
          </section>
      {!token ? (
        <form className="adminLoginPanel card" onSubmit={handleAdminLogin}>
          <Icon name="admin_panel_settings" />
          <h2>Đăng nhập quản trị</h2>
          <p>Dùng tài khoản được cấp để vào dashboard, quản lý bài dự thi và tải dữ liệu từ VPS.</p>
          <label className="formField">
            <span>Tên đăng nhập</span>
            <input name="adminUsername" autoComplete="username" value={loginForm.username} onChange={(event) => updateLoginField('username', event.target.value)} placeholder="admin" />
          </label>
          <label className="formField">
            <span>Mật khẩu</span>
            <input name="adminPassword" type="password" autoComplete="current-password" value={loginForm.password} onChange={(event) => updateLoginField('password', event.target.value)} placeholder="Nhập mật khẩu quản trị" />
          </label>
          <button type="submit" className="primaryButton" disabled={status.state === 'submitting'}>
            <Icon name="login" />
            {status.state === 'submitting' ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      ) : (
        <section className="adminToolbar card">
          <div className="adminSession">
            <span>Đã đăng nhập</span>
            <strong>{adminUser || 'admin'}</strong>
          </div>
          <div className="adminToolbarActions">
            <button type="button" className="softButton" onClick={() => loadAdminData()} disabled={status.state === 'submitting'}>
              <Icon name="refresh" />
              {status.state === 'submitting' ? 'Đang tải...' : 'Tải lại'}
            </button>
            <button type="button" className="ghostButton" onClick={downloadAdminCsv}>
              <Icon name="download" />
              Tải CSV
            </button>
            <button type="button" className="darkButton" onClick={handleAdminLogout}>
              <Icon name="logout" />
              Đăng xuất
            </button>
          </div>
        </section>
      )}
      {status.state === 'error' ? <div className="formAlert error"><Icon name="error" /> {status.message}</div> : null}
      {status.state === 'success' ? <div className="formAlert success"><Icon name="check_circle" /> {status.message}</div> : null}

      {!token ? null : (
        <>
      {activeAdminView === 'overview' ? (
        <section className="adminOverviewPanel" id="admin-overview">
          <div className="adminOverviewGrid">
            {visibleAdminStats.map((stat) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} accent={stat.accent} />
            ))}
          </div>
          <div className="adminQuickLinks" aria-label="Đi nhanh đến các phần quản trị">
            {visibleAdminQuickLinks.map((link) => (
              <a className="adminQuickLink" href={link.href} key={link.view} onClick={() => setActiveAdminView(link.view)}>
                <Icon name={link.icon} />
                <span>{link.label}</span>
                <strong>{link.count}</strong>
                <em>{link.unit}</em>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {activeAdminView === 'submissions' ? (
      <section className="adminSection" id="admin-submissions">
        <SectionHeading title="Quản lý bài dự thi" action={<ResultsCount count={submissions.length} label="bài" />} />
        {submissions.length ? (
          <div className="adminSubmissionList">
            {submissions.map((submission) => (
              <article key={submission.id} className="card adminSubmissionCard">
                {submission.coverImage?.url ? (
                  <img className="adminSubmissionCover" src={submission.coverImage.url} alt={`Ảnh đại diện bài dự thi ${submission.title}`} loading="lazy" />
                ) : null}
                <div className="cardMeta">
                  <Badge tone="red">{submission.id}</Badge>
                  <span>{formatDateTime(submission.createdAt)}</span>
                </div>
                <h3>{submission.title}</h3>
                <InfoGrid
                  items={[
                    ['Người nộp', submission.participantName],
                    ['Đơn vị', submission.department],
                    ['Liên hệ', submission.contact],
                    ['Tuần', `Tuần ${submission.week}`],
                    ['Nhóm dự thi', submission.challengeGroup],
                    ['Công cụ AI', submission.aiTools],
                    ['Bình chọn cộng đồng', `${submission.communityVoteCount || 0} lượt`],
                  ]}
                />
                <p>{submission.problem}</p>
                <div className="adminFiles">
                  <AdminFileGroup title="File bài dự thi" files={submission.submissionFiles} onDownload={downloadAdminFile} />
                  <AdminFileGroup title="File minh chứng" files={submission.evidenceFiles} onDownload={downloadAdminFile} />
                </div>
                <div className="adminControls">
                  <label>
                    <span>Trạng thái chấm</span>
                    <select name={`reviewStatus-${submission.id}`} value={submission.reviewStatus} disabled={!canReviewSubmissions} onChange={(event) => updateSubmission(submission.id, { reviewStatus: event.target.value })}>
                      <option value="pending">Chờ chấm</option>
                      <option value="reviewing">Đang chấm</option>
                      <option value="scored">Đã chấm</option>
                    </select>
                  </label>
                  <label>
                    <span>Duyệt prompt</span>
                    <select name={`promptStatus-${submission.id}`} value={submission.promptStatus} disabled={!canReviewSubmissions} onChange={(event) => updateSubmission(submission.id, { promptStatus: event.target.value })}>
                      <option value="pending">Chờ duyệt</option>
                      <option value="approved">Duyệt lên Kho Prompt</option>
                      <option value="rejected">Không hiển thị</option>
                    </select>
                  </label>
                  <label>
                    <span>Bài tiêu biểu</span>
                    <select name={`featuredStatus-${submission.id}`} value={submission.featuredStatus} disabled={!canReviewSubmissions} onChange={(event) => updateSubmission(submission.id, { featuredStatus: event.target.value })}>
                      <option value="pending">Chờ duyệt</option>
                      <option value="approved">Hiển thị</option>
                      <option value="rejected">Không hiển thị</option>
                    </select>
                  </label>
                  <label>
                    <span>Điểm</span>
                    <input name={`score-${submission.id}`} type="number" min="0" max="100" defaultValue={submission.score} disabled={!canReviewSubmissions} onBlur={(event) => updateSubmission(submission.id, { score: Number(event.currentTarget.value) } as Partial<AdminSubmission>)} />
                  </label>
                </div>
                <label className="formField">
                  <span>Ghi chú giám khảo</span>
                  <textarea name={`judgeNote-${submission.id}`} rows={3} defaultValue={submission.judgeNote} disabled={!canReviewSubmissions} onBlur={(event) => updateSubmission(submission.id, { judgeNote: event.currentTarget.value })} />
                </label>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Chưa có bài dự thi" description="Bài nộp qua form trên website sẽ hiển thị tại đây sau khi được lưu trên VPS." />
        )}
      </section>
      ) : null}

      {activeAdminView === 'scoring' ? (
      <section className="adminSection adminScorePanel" id="admin-scoring">
        <SectionHeading title="Chấm điểm bài thi" description="Cập nhật trạng thái chấm, điểm số 0-100 và ghi chú giám khảo cho từng bài dự thi." action={<ResultsCount count={submissions.length} label="bài" />} />
        {submissions.length ? (
          <div className="tableWrap adminScoreTable">
            <table>
              <thead>
                <tr>
                  <th>Bài dự thi</th>
                  <th>Người nộp</th>
                  <th>Trạng thái</th>
                  <th>Điểm</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={`score-${submission.id}`}>
                    <td>
                      <strong>{submission.title}</strong>
                      <span>{submission.id}</span>
                    </td>
                    <td>{submission.participantName}<br /><small>{submission.department}</small></td>
                    <td>
                       <select name={`scoreReviewStatus-${submission.id}`} value={submission.reviewStatus} disabled={!canReviewSubmissions} onChange={(event) => updateSubmission(submission.id, { reviewStatus: event.target.value })}>
                        <option value="pending">Chờ chấm</option>
                        <option value="reviewing">Đang chấm</option>
                        <option value="scored">Đã chấm</option>
                      </select>
                    </td>
                    <td>
                      <input name={`scoreTable-${submission.id}`} type="number" min="0" max="100" defaultValue={submission.score} disabled={!canReviewSubmissions} onBlur={(event) => updateSubmission(submission.id, { score: Number(event.currentTarget.value) } as Partial<AdminSubmission>)} />
                    </td>
                    <td>
                      <textarea name={`scoreNote-${submission.id}`} rows={2} defaultValue={submission.judgeNote} disabled={!canReviewSubmissions} onBlur={(event) => updateSubmission(submission.id, { judgeNote: event.currentTarget.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Chưa có bài để chấm" description="Khi có bài dự thi mới, bảng chấm điểm sẽ hiển thị tại đây." />
        )}
      </section>
      ) : null}

      {activeAdminView === 'users' && canManageUsers ? (
      <section className="adminSection adminUserPanel" id="admin-users">
        <SectionHeading title="Quản trị tài khoản" description="Tạo tài khoản cho Ban tổ chức, giám khảo hoặc người chỉ xem dữ liệu." action={<ResultsCount count={adminUsers.length} label="user" />} />
        <div className="adminUserLayout">
          <form className="card adminUserForm" onSubmit={createAdminUser}>
            <h3>Tạo tài khoản mới</h3>
            <label className="formField">
              <span>Tên đăng nhập</span>
              <input name="newAdminUsername" value={userForm.username} onChange={(event) => updateUserForm('username', event.target.value)} placeholder="vd: giamkhao01" />
            </label>
            <label className="formField">
              <span>Tên hiển thị</span>
              <input name="newAdminDisplayName" value={userForm.displayName} onChange={(event) => updateUserForm('displayName', event.target.value)} placeholder="Ban giám khảo 01" />
            </label>
            <label className="formField">
              <span>Vai trò</span>
              <select name="newAdminRole" value={userForm.role} onChange={(event) => updateUserForm('role', event.target.value)}>
                <option value="admin">Quản trị</option>
                <option value="judge">Giám khảo</option>
                <option value="viewer">Chỉ xem</option>
              </select>
            </label>
            <label className="formField">
              <span>Mật khẩu</span>
              <input name="newAdminPassword" type="password" value={userForm.password} onChange={(event) => updateUserForm('password', event.target.value)} placeholder="Tối thiểu 6 ký tự" />
            </label>
            <button type="submit" className="primaryButton"><Icon name="person_add" /> Tạo user</button>
          </form>
          <div className="adminUserList">
            {adminUsers.map((user) => (
              <article className="card adminUserCard" key={user.id}>
                <div>
                  <strong>{user.displayName}</strong>
                  <span>{user.username} · {formatDateTime(user.createdAt)}</span>
                </div>
                <label>
                  <span>Vai trò</span>
                  <select name={`adminRole-${user.id}`} value={user.role} onChange={(event) => updateAdminUser(user.id, { role: event.target.value })}>
                    <option value="admin">Quản trị</option>
                    <option value="judge">Giám khảo</option>
                    <option value="viewer">Chỉ xem</option>
                  </select>
                </label>
                <label>
                  <span>Trạng thái</span>
                  <select name={`adminStatus-${user.id}`} value={user.status} onChange={(event) => updateAdminUser(user.id, { status: event.target.value })}>
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Khóa</option>
                  </select>
                </label>
                <label>
                  <span>Đặt mật khẩu mới</span>
                  <input name={`adminPassword-${user.id}`} type="password" placeholder="Để trống nếu không đổi" onBlur={(event) => {
                    const nextPassword = event.currentTarget.value.trim();
                    if (nextPassword) {
                      void updateAdminUser(user.id, { password: nextPassword });
                      event.currentTarget.value = '';
                    }
                  }} />
                </label>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {activeAdminView === 'audit' && canManageUsers ? (
      <section className="adminSection adminAuditPanel" id="admin-audit">
        <SectionHeading title="Nhật ký quản trị" description="Theo dõi các lần đăng nhập, chấm bài và thay đổi tài khoản quản trị." action={<ResultsCount count={adminAuditLogs.length} label="log" />} />
        {adminAuditLogs.length ? (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Tài khoản</th>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                  <th>Chi tiết</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {adminAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>
                    <td>{log.actor.username || 'Không rõ'}<br /><small>{log.actor.role || 'n/a'}</small></td>
                    <td>{formatAuditAction(log.action)}</td>
                    <td>{log.targetType}<br /><small>{log.targetId || 'n/a'}</small></td>
                    <td><code>{formatAuditDetails(log.details)}</code></td>
                    <td>{log.ip || 'n/a'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Chưa có nhật ký quản trị" description="Các thao tác đăng nhập, chấm bài và quản trị user sẽ được ghi lại tại đây." />
        )}
      </section>
      ) : null}

      {activeAdminView === 'support' ? (
      <section className="adminSection" id="admin-support">
        <SectionHeading title="Yêu cầu hỗ trợ" action={<ResultsCount count={messages.length} label="yêu cầu" />} />
        {messages.length ? (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Họ tên</th>
                  <th>Phòng/ban</th>
                  <th>Email</th>
                  <th>Nội dung</th>
                  <th>File/link</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>{formatDateTime(message.createdAt)}</td>
                    <td>{message.name}</td>
                    <td>{message.department || 'Chưa nhập'}</td>
                    <td><a href={`mailto:${message.email}`}>{message.email}</a></td>
                    <td>{message.message}</td>
                    <td>{message.attachment || 'Không có'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Chưa có yêu cầu hỗ trợ" description="Các phản ánh gửi từ form Liên hệ sẽ được lưu tại đây." />
        )}
      </section>
      ) : null}
        </>
      )}
        </div>
      </section>
    </main>
  );
}

function AdminFileGroup({ title, files, onDownload }: { title: string; files: AdminFile[]; onDownload: (file: AdminFile) => void }) {
  return (
    <div>
      <strong>{title}</strong>
      {files.length ? (
        <ul>
          {files.map((file) => (
            <li key={file.downloadUrl}>
              <button type="button" className="ghostButton" onClick={() => onDownload(file)}>{file.originalName}</button>
              <span>{formatFileSize(file.size)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Chưa có file.</p>
      )}
    </div>
  );
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    'admin.login.success': 'Đăng nhập thành công',
    'admin.login.failed': 'Đăng nhập thất bại',
    'submission.review.update': 'Cập nhật chấm bài',
    'admin.user.create': 'Tạo tài khoản',
    'admin.user.update': 'Cập nhật tài khoản',
  };
  return labels[action] || action;
}

function formatAuditDetails(details: Record<string, unknown>) {
  const text = JSON.stringify(details || {});
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function SearchPage({ navigate }: { navigate: (href: string) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const items = [
      ...challenges.map((challenge) => ({ title: challenge.title, type: 'Thử thách', description: challenge.description, tags: [challenge.targetGroup, `Tuần ${challenge.week}`], href: `/challenges/${challenge.id}` })),
      ...aiNewsItems.map((item) => ({ title: item.title, type: 'Tin tức AI', description: item.summary, tags: [item.category, ...item.tags], href: `/ai-news/${item.id}` })),
      { title: 'Diễn đàn AI', type: 'Cộng đồng', description: 'Trao đổi kinh nghiệm sử dụng AI, chia sẻ prompt và hỏi đáp công cụ giữa các phòng/ban.', tags: ['diễn đàn', 'AI trong công việc', 'Chia sẻ prompt'], href: '/forum' },
      { title: 'Thể lệ cuộc thi', type: 'Thể lệ', description: 'Tiêu chí chấm điểm, giải thưởng, thời gian và tổ chức thực hiện.', tags: ['100 điểm', 'giải thưởng'], href: '/rules' },
      { title: 'Thông báo mở tuần 1', type: 'Tin cập nhật', description: 'Tuần 1 nhận bài đến 15h00 ngày 06/7/2026.', tags: ['deadline', 'tuần 1'], href: '/challenges' },
      { title: 'Nộp bài dự thi', type: 'Form', description: 'Gửi nội dung bài dự thi, nhật ký tác nghiệp và upload file trực tiếp.', tags: ['nộp bài', 'upload'], href: '/submit' },
      { title: 'Dashboard Ban tổ chức', type: 'Quản trị', description: 'Tổng hợp bài dự thi, chấm điểm, duyệt prompt và xem yêu cầu hỗ trợ.', tags: ['admin', 'chấm thi'], href: '/admin' },
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
        <p>Route này chưa có trong Thử thách AI.</p>
        <AppLink href="/" navigate={navigate} className="primaryButton">Về trang chủ</AppLink>
      </section>
    </PageContainer>
  );
}

function normalizePath(value: string) {
  const path = value.split('?')[0].replace(/\/+$/, '');
  return path || '/';
}
