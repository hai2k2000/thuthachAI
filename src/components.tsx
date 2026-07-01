import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  AITool,
  Badge as BadgeModel,
  Challenge,
  DepartmentScore,
  LeaderboardItem,
  Prompt,
  Submission,
  badges,
  prompts,
} from './data';

export type Navigate = (href: string) => void;

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export function AppLink({
  href,
  navigate,
  children,
  className = '',
  onClick,
}: {
  href: string;
  navigate: Navigate;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

const navItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Thử thách', href: '/challenges' },
  { label: 'Kho Prompt', href: '/prompts' },
  { label: 'Bài tiêu biểu', href: '/featured' },
  { label: 'Bảng vàng AI', href: '/leaderboard' },
  { label: 'AI Lab', href: '/ai-lab' },
];

export function Header({ pathname, navigate }: { pathname: string; navigate: Navigate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="siteHeader">
      <div className="headerInner">
        <AppLink href="/" navigate={navigate} className="brand">
          <span className="brandLogo">
            <img src="/assets/thoi-dai-logo.png" alt="Tạp chí Thời Đại - Vietnam Times" />
          </span>
          <span className="brandDivider" />
          <b>Thử thách AI</b>
        </AppLink>
        <nav className="desktopNav" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <AppLink
              key={item.href}
              href={item.href}
              navigate={navigate}
              className={isActivePath(pathname, item.href) ? 'active' : ''}
            >
              {item.label}
            </AppLink>
          ))}
        </nav>
        <div className="headerActions">
          <AppLink href="/contact" navigate={navigate} className="ghostButton smallButton">
            Liên hệ
          </AppLink>
          <AppLink href="/submit" navigate={navigate} className="primaryButton smallButton">
            Nộp bài dự thi
          </AppLink>
          <button type="button" className="iconButton mobileOnly" aria-label="Mở menu" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>
      {open ? <MobileMenu pathname={pathname} navigate={navigate} onClose={() => setOpen(false)} /> : null}
    </header>
  );
}

function MobileMenu({ pathname, navigate, onClose }: { pathname: string; navigate: Navigate; onClose: () => void }) {
  return (
    <div className="mobileMenuOverlay" onMouseDown={onClose}>
      <aside className="mobileMenuPanel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mobileMenuHeader">
          <strong>Thử thách AI</strong>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Đóng menu">
            <Icon name="close" />
          </button>
        </div>
        <nav>
          {[...navItems, { label: 'Thể lệ', href: '/rules' }, { label: 'Liên hệ', href: '/contact' }, { label: 'Tìm kiếm', href: '/search' }].map((item) => (
            <AppLink
              key={item.href}
              href={item.href}
              navigate={navigate}
              className={isActivePath(pathname, item.href) ? 'active' : ''}
              onClick={onClose}
            >
              {item.label}
            </AppLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export function Footer({ navigate }: { navigate: Navigate }) {
  return (
    <footer className="siteFooter">
      <div>
        <strong>Thử thách AI</strong>
        <span>© Tạp chí Thời đại. Liên hệ: Vũ Mai Anh</span>
      </div>
      <nav>
        <AppLink href="/rules" navigate={navigate}>Thể lệ</AppLink>
        <AppLink href="/challenges" navigate={navigate}>Thử thách hiện tại</AppLink>
        <AppLink href="/submit" navigate={navigate}>Nộp bài</AppLink>
        <AppLink href="/prompts" navigate={navigate}>Kho Prompt</AppLink>
      </nav>
    </footer>
  );
}

export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`pageContainer ${className}`}>{children}</main>;
}

export function Button({
  children,
  onClick,
  className = '',
  tone = 'primary',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  tone?: 'primary' | 'ghost' | 'dark' | 'soft';
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={`${tone}Button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`card ${className}`}>{children}</article>;
}

export function Badge({ children, tone = 'soft' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatCard({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`statCard ${accent ? 'accent' : ''}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="searchInput">
      <Icon name="search" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function FilterPanel({ children }: { children: ReactNode }) {
  return <section className="filterPanel">{children}</section>;
}

export function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="selectFilter">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="emptyState">
      <Icon name="search_off" />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function Breadcrumb({ items, navigate }: { items: Array<{ label: string; href?: string }>; navigate: Navigate }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.href ? <AppLink href={item.href} navigate={navigate}>{item.label}</AppLink> : <b>{item.label}</b>}
        </span>
      ))}
    </nav>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="sectionHeading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="sectionAction">{action}</div> : null}
    </div>
  );
}

export function CTABox({ navigate, title = 'Sẵn sàng nộp bài dự thi?', description = 'Gửi bài, prompt chính và nhật ký tương tác AI để cùng xây kho tài nguyên chung.' }: { navigate: Navigate; title?: string; description?: string }) {
  return (
    <section className="ctaBox">
      <div>
        <span className="eyebrow">CTA</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <AppLink href="/submit" navigate={navigate} className="primaryButton">Nộp bài dự thi</AppLink>
    </section>
  );
}

export function ChallengeCard({ challenge, navigate }: { challenge: Challenge; navigate: Navigate }) {
  return (
    <Card className="challengeCard">
      <img src={challenge.image} alt={challenge.title} loading="lazy" />
      <div className="cardBody">
        <div className="cardMeta">
          <Badge tone={challenge.status === 'Đang mở' ? 'red' : 'soft'}>{challenge.status}</Badge>
          <span>+{challenge.score} pts</span>
        </div>
        <h3>{challenge.title}</h3>
        <p>{challenge.description}</p>
        <ul>
          {challenge.requirements.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="deadlineLine">
          <Icon name="schedule" />
          <span>{challenge.deadline}</span>
        </div>
        <div className="cardActions">
          <AppLink href={`/challenges/${challenge.id}`} navigate={navigate} className="darkButton">Xem chi tiết</AppLink>
          <AppLink href="/submit" navigate={navigate} className="ghostButton">Nộp bài</AppLink>
        </div>
      </div>
    </Card>
  );
}

export function ChallengeDetail({ challenge, navigate }: { challenge: Challenge; navigate: Navigate }) {
  return (
    <div className="detailGrid">
      <section className="detailMain card">
        <Badge tone="red">Tuần {challenge.week}</Badge>
        <h1>{challenge.title}</h1>
        <p className="lead">{challenge.description}</p>
        <InfoGrid
          items={[
            ['Nhóm đối tượng', challenge.targetGroup],
            ['Hạn nộp', challenge.deadline],
            ['Trạng thái', challenge.status],
            ['Thang điểm', `${challenge.score} điểm`],
          ]}
        />
        <DetailSection title="Yêu cầu đầu ra" items={challenge.deliverables} />
        <DetailSection title="Checklist yêu cầu" items={challenge.requirements} />
        <section>
          <h2>Gợi ý cấu trúc bài dự thi</h2>
          <ol className="stepList">
            <li>Mục tiêu và vấn đề công việc ban đầu.</li>
            <li>Prompt chính, công cụ AI và nhật ký tương tác.</li>
            <li>Kết quả cuối cùng, minh chứng trước - sau AI.</li>
            <li>Bài học kinh nghiệm và đề xuất áp dụng trong cơ quan.</li>
          </ol>
        </section>
        <section>
          <h2>Tiêu chí chấm điểm liên quan</h2>
          <p>Tập trung vào hiệu quả ứng dụng AI, tính phù hợp với nhiệm vụ tuần và khả năng nhân rộng quy trình.</p>
        </section>
      </section>
      <aside className="detailSide">
        <Card>
          <h3>Mẫu bài dự thi</h3>
          <p>Chuẩn bị file minh chứng, nhật ký prompt và sản phẩm trước - sau AI trước khi nộp.</p>
          {challenge.sampleFile ? (
            <a className="softButton" href={challenge.sampleFile} download>
              <Icon name="download" /> Tải mẫu bài dự thi
            </a>
          ) : (
            <AppLink href="/submit" navigate={navigate} className="softButton">
              <Icon name="upload_file" /> Mở form nộp bài
            </AppLink>
          )}
        </Card>
        <CTABox navigate={navigate} title="Nộp bài cho thử thách này" description="Gửi thông tin và upload file minh chứng trực tiếp trên hệ thống cuộc thi." />
      </aside>
    </div>
  );
}

export function WeekTabs({ activeWeek, onChange, weeks }: { activeWeek: string; onChange: (week: string) => void; weeks: number[] }) {
  return (
    <div className="tabs">
      <button className={activeWeek === 'Tất cả' ? 'active' : ''} onClick={() => onChange('Tất cả')}>Tất cả</button>
      {weeks.map((week) => (
        <button key={week} className={activeWeek === String(week) ? 'active' : ''} onClick={() => onChange(String(week))}>
          Tuần {week}
        </button>
      ))}
    </div>
  );
}

export function Timeline({ items }: { items: Array<{ week: number; title: string; description: string; status: string }> }) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <article key={item.week} className={item.status === 'Đang mở' ? 'active' : ''}>
          <span>{String(item.week).padStart(2, '0')}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export function PromptCard({ prompt, navigate, onCopy }: { prompt: Prompt; navigate: Navigate; onCopy: (text: string) => void }) {
  return (
    <Card className="promptCard">
      <div className="cardMeta">
        <Badge tone={prompt.status === 'Đã kiểm chứng' ? 'red' : 'soft'}>{prompt.status}</Badge>
        <Badge tone="cyan">{prompt.tool}</Badge>
      </div>
      <h3>{prompt.title}</h3>
      <p>{prompt.purpose}</p>
      <InfoGrid
        items={[
          ['Nhóm', prompt.category],
          ['Người chia sẻ', prompt.contributor],
          ['Phòng/ban', prompt.department],
          ['Mức độ', prompt.difficulty],
        ]}
      />
      <TagList tags={prompt.tags} />
      <div className="cardActions">
        <AppLink href={`/prompts/${prompt.id}`} navigate={navigate} className="darkButton">Xem chi tiết</AppLink>
        <CopyPromptButton text={prompt.fullPrompt} onCopy={onCopy} />
      </div>
    </Card>
  );
}

export function PromptDetail({ prompt, onCopy }: { prompt: Prompt; onCopy: (text: string) => void }) {
  return (
    <div className="detailGrid">
      <section className="detailMain card">
        <div className="cardMeta">
          <Badge tone="red">{prompt.category}</Badge>
          <Badge tone="cyan">{prompt.tool}</Badge>
          <Badge tone="soft">{prompt.difficulty}</Badge>
        </div>
        <h1>{prompt.title}</h1>
        <p className="lead">{prompt.purpose}</p>
        <InfoGrid
          items={[
            ['Người chia sẻ', prompt.contributor],
            ['Phòng/ban', prompt.department],
            ['Trạng thái', prompt.status],
            ['Cập nhật', prompt.updatedAt],
          ]}
        />
        <section>
          <h2>Bối cảnh công việc</h2>
          <p>{prompt.context}</p>
        </section>
        <section>
          <h2>Nội dung prompt đầy đủ</h2>
          <pre className="promptBlock">{prompt.fullPrompt}</pre>
          <CopyPromptButton text={prompt.fullPrompt} onCopy={onCopy} />
        </section>
        <DetailSection title="Cách dùng từng bước" items={prompt.usageSteps} ordered />
        <section className="twoColumn">
          <div>
            <h2>Ví dụ đầu vào</h2>
            <p>{prompt.sampleInput}</p>
          </div>
          <div>
            <h2>Ví dụ đầu ra</h2>
            <p>{prompt.sampleOutput}</p>
          </div>
        </section>
        <DetailSection title="Lưu ý khi sử dụng" items={prompt.notes} />
        <section>
          <h2>Áp dụng cho phòng/ban khác</h2>
          <TagList tags={prompt.applicableDepartments} />
        </section>
      </section>
      <aside className="detailSide">
        <Card>
          <h3>Thao tác</h3>
          <Button tone="soft">
            <Icon name="download" /> Tải mẫu quy trình
          </Button>
          <Button tone="ghost">
            <Icon name="rate_review" /> Gửi góp ý
          </Button>
        </Card>
      </aside>
    </div>
  );
}

export function CopyPromptButton({ text, onCopy }: { text: string; onCopy: (text: string) => void }) {
  return (
    <button type="button" className="ghostButton copyButton" onClick={() => onCopy(text)}>
      <Icon name="content_copy" /> Sao chép prompt
    </button>
  );
}

export function SubmissionCard({ submission, navigate }: { submission: Submission; navigate: Navigate }) {
  return (
    <Card className="submissionCard">
      <img src={submission.image} alt={submission.title} loading="lazy" />
      <div className="cardBody">
        <div className="cardMeta">
          <Badge tone="red">{submission.award}</Badge>
          <span>{submission.score} pts</span>
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
        <TagList tags={submission.tags} />
        <div className="cardActions">
          <AppLink href={`/featured/${submission.id}`} navigate={navigate} className="darkButton">Xem chi tiết</AppLink>
          {submission.promptIds[0] ? (
            <AppLink href={`/prompts/${submission.promptIds[0]}`} navigate={navigate} className="ghostButton">Xem prompt liên quan</AppLink>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function SubmissionDetail({ submission, navigate }: { submission: Submission; navigate: Navigate }) {
  const related = prompts.filter((prompt) => submission.promptIds.includes(prompt.id));
  return (
    <div className="detailGrid">
      <section className="detailMain card">
        <img className="detailHeroImage" src={submission.image} alt={submission.title} />
        <div className="cardMeta">
          <Badge tone="red">{submission.award}</Badge>
          <Badge tone="dark">{submission.score} điểm</Badge>
        </div>
        <h1>{submission.title}</h1>
        <InfoGrid
          items={[
            ['Người thực hiện', submission.participantName],
            ['Phòng/ban', submission.department],
            ['Tuần thi', `Tuần ${submission.week}`],
            ['Nhóm nhiệm vụ', submission.group],
            ['Công cụ AI', submission.aiTools.join(', ')],
          ]}
        />
        <section>
          <h2>Vấn đề ban đầu</h2>
          <p>{submission.problem}</p>
        </section>
        <section>
          <h2>Cách AI được sử dụng</h2>
          <p>{submission.processSummary}</p>
        </section>
        <section>
          <h2>Prompt chính</h2>
          <pre className="promptBlock">{submission.mainPrompt}</pre>
        </section>
        <section>
          <h2>Sản phẩm cuối cùng</h2>
          <p>{submission.finalResult}</p>
          <p className="placeholderLine"><Icon name="drive_folder_upload" /> Link file minh chứng: {submission.fileLink}</p>
        </section>
        <BeforeAfterAI before={submission.beforeAI} after={submission.afterAI} />
        <DetailSection title="Bài học kinh nghiệm" items={submission.lessons} />
        <DetailSection title="Đề xuất áp dụng trong cơ quan" items={submission.recommendations} />
      </section>
      <aside className="detailSide">
        <RelatedPrompts prompts={related} navigate={navigate} />
        <Button tone="soft">
          <Icon name="bookmark" /> Lưu vào kho tham khảo
        </Button>
      </aside>
    </div>
  );
}

export function BeforeAfterAI({ before, after }: { before: string; after: string }) {
  return (
    <section>
      <h2>Trước AI → Sau AI</h2>
      <div className="beforeAfter">
        <article>
          <span>Trước AI</span>
          <p>{before}</p>
        </article>
        <article>
          <span>Sau AI</span>
          <p>{after}</p>
        </article>
      </div>
    </section>
  );
}

export function RelatedPrompts({ prompts: relatedPrompts, navigate }: { prompts: Prompt[]; navigate: Navigate }) {
  return (
    <Card>
      <h3>Prompt liên quan</h3>
      <div className="relatedList">
        {relatedPrompts.map((prompt) => (
          <AppLink key={prompt.id} href={`/prompts/${prompt.id}`} navigate={navigate}>
            <strong>{prompt.title}</strong>
            <span>{prompt.tool} · {prompt.category}</span>
          </AppLink>
        ))}
        {!relatedPrompts.length ? <p>Chưa có prompt công khai.</p> : null}
      </div>
    </Card>
  );
}

export function Podium({ items }: { items: LeaderboardItem[] }) {
  const top = items.slice(0, 3);
  return (
    <section className="podium">
      {top.map((item, index) => (
        <article key={item.rank} className={`podiumCard place${index + 1}`}>
          <span>#{item.rank}</span>
          <h3>{item.name}</h3>
          <p>{item.department}</p>
          <strong>{item.score} pts</strong>
          <Badge tone={index === 0 ? 'orange' : 'soft'}>{item.award}</Badge>
        </article>
      ))}
    </section>
  );
}

export function LeaderboardTable({ items }: { items: LeaderboardItem[] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Họ tên/Nhóm</th>
            <th>Phòng/ban</th>
            <th>Tên bài dự thi</th>
            <th>Điểm</th>
            <th>Danh hiệu</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.week}-${item.rank}-${item.name}`}>
              <td>#{item.rank}</td>
              <td>{item.name}</td>
              <td>{item.department}</td>
              <td>{item.submissionTitle}</td>
              <td>{item.score}</td>
              <td>{item.award}</td>
              <td><Badge tone="soft">{item.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DepartmentLeaderboard({ items }: { items: DepartmentScore[] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Phòng/ban</th>
            <th>Số bài dự thi</th>
            <th>Số prompt chia sẻ</th>
            <th>Điểm trung bình</th>
            <th>Bài tiêu biểu</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.department}>
              <td>{item.department}</td>
              <td>{item.submissionCount}</td>
              <td>{item.promptCount}</td>
              <td>{item.averageScore}</td>
              <td>{item.featuredSubmission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BadgeGrid({ items = badges }: { items?: BadgeModel[] }) {
  return (
    <div className="badgeGrid">
      {items.map((badge) => (
        <article key={badge.name} className={`badgeTile badgeTile-${badge.tone}`}>
          <Icon name="workspace_premium" />
          <h3>{badge.name}</h3>
          <p>{badge.description}</p>
        </article>
      ))}
    </div>
  );
}

export function ToolCard({ tool }: { tool: AITool }) {
  return (
    <Card className="toolCard">
      <div className={`toolIcon tool-${tool.accent}`}>
        <Icon name={tool.icon} />
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.purpose}</p>
      <InfoGrid
        items={[
          ['Phù hợp', tool.suitableFor],
          ['Lưu ý', tool.notes],
        ]}
      />
    </Card>
  );
}

export function GuideCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <article className="guideCard">
      <Icon name={icon} />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export function SafetyChecklist() {
  const items = [
    'Không đưa thông tin mật, tài liệu nội bộ chưa được phép công khai vào AI.',
    'Luôn kiểm chứng thông tin do AI tạo ra.',
    'Không sao chép nguyên văn nếu chưa rà soát.',
    'Ghi rõ công cụ, prompt và quy trình sử dụng.',
    'AI là công cụ hỗ trợ, người thực hiện chịu trách nhiệm chuyên môn.',
  ];
  return (
    <section className="safetyBox">
      <h2>Sử dụng AI an toàn</h2>
      <p>Bộ quy tắc ứng xử và bảo vệ dữ liệu nội bộ.</p>
      <div>
        {items.map((item) => (
          <label key={item}>
            <input type="checkbox" readOnly />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <blockquote>"AI không thay thế nhà báo, nhưng nhà báo dùng AI sẽ thay thế nhà báo không dùng."</blockquote>
    </section>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check_circle" /> {message}
    </div>
  );
}

export function useCopyToast() {
  const [message, setMessage] = useState('');
  async function copy(text: string) {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) copied = fallbackCopy(text);
    setMessage(copied ? 'Đã sao chép prompt vào clipboard.' : 'Không thể dùng clipboard tự động, hãy sao chép thủ công.');
    window.setTimeout(() => setMessage(''), 2400);
  }
  return { message, copy };
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

export function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="infoGrid">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="tagList">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

export function DetailSection({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <section>
      <h2>{title}</h2>
      <List className="detailList">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </section>
  );
}

export function ResultsCount({ count, label }: { count: number; label: string }) {
  return <span className="resultsCount">{count} {label}</span>;
}

export function useMemoFilter<T>(items: T[], predicate: (item: T) => boolean, deps: unknown[]) {
  // Kept tiny and explicit so filtered list behavior is easy to test by inspection.
  return useMemo(() => items.filter(predicate), deps);
}

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
