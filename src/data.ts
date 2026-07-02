export type ChallengeStatus = 'Đang mở' | 'Đang chấm' | 'Đã công bố kết quả' | 'Sắp diễn ra';

export type Challenge = {
  id: string;
  week: number;
  title: string;
  shortTitle: string;
  deadline: string;
  status: ChallengeStatus;
  targetGroup: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  submissionLink: string;
  sampleFile?: string;
  image: string;
  score: number;
};

export type Prompt = {
  id: string;
  title: string;
  category: string;
  department: string;
  contributor: string;
  tool: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  purpose: string;
  context: string;
  fullPrompt: string;
  usageSteps: string[];
  sampleInput: string;
  sampleOutput: string;
  notes: string[];
  applicableDepartments: string[];
  tags: string[];
  week: number;
  status: 'Đã kiểm chứng' | 'Đang thử nghiệm' | 'Đề xuất mới';
  updatedAt: string;
};

export type Submission = {
  id: string;
  title: string;
  participantName: string;
  department: string;
  week: number;
  group: string;
  aiTools: string[];
  problem: string;
  processSummary: string;
  mainPrompt: string;
  finalResult: string;
  beforeAI: string;
  afterAI: string;
  lessons: string[];
  recommendations: string[];
  score: number;
  award: string;
  promptIds: string[];
  fileLink: string;
  tags: string[];
  isScalable: boolean;
  isPromptPublic: boolean;
  image: string;
};

export type LeaderboardItem = {
  rank: number;
  name: string;
  department: string;
  submissionTitle: string;
  week: number;
  score: number;
  award: string;
  badge: string;
  status: string;
};

export type DepartmentScore = {
  department: string;
  submissionCount: number;
  promptCount: number;
  averageScore: number;
  featuredSubmission: string;
};

export type AINewsItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  content: string[];
};

export type AITool = {
  name: string;
  purpose: string;
  suitableFor: string;
  notes: string;
  accent: string;
  icon: string;
};

export type Badge = {
  name: string;
  description: string;
  tone: string;
};

export const heroImage =
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=82';

export const newsroomImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBntxMGkPP7Qyjmzpzl8hfNAH_HVMWFq5v13qQKYsFRaokoy5pUtTDbaEjg63nIB_ai28xklhGmLHNdCi8bgD52eWHhjLHyuzN2Qeh7H-pzp356DEgPkuVwWvNS0wRFx8pDYyf7tS7Qk1DIfwGZHc7mNEM3Ija7pe18neLi3kMOR9i8UpSGsx-uyrtCkqeIyhc-uyLXgNZOP0jeo3q_x_-6iGU4IcHqYK71fbBasUImPTvxAXH6vrH580UnFkW0urb3EOOqWIUTh8w';

export const archiveImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRBHc2q4n0BppHKjfmUvgyxcuWmTI5ugB33F0-ar1GHLrmj10ayxkQGECs6QhnSeJE5l4zB7HC44Ilid2KPSzsPG4EDe_xk-cHJhktXTX_lmxlexXCtBfyjPRTjnrcG2AVCZ4f6tG56IsQMEsik8qhCEU75zmRsVk8bTGgiBICmPkl34VHzlk3V47sarqUioVmPZLFH8dqX6ZjLysQL4_8W60hSxuW4M5GXtFbZUONNBjoYvVrfrYPDqUWHRtKVTa1bV7vacQqRXY';

export const mediaImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcYSBUuNv_iWMQTNyk3LBAtEfPkvJsy2NgIwmm7xFSxaLlOYiqMuTSnEo6_QOWgigRz_mRTrBLWSxb11Ooe22QE6KD4kq3D8B00_sMCPKCu8OG0Tl5Pb89z6ZOREv5V5V-1WUe04kk1f6eph48OgEHUV_PrvxXPLudKE3zSenwgHlSs_yEhAeQMjk9moFP19DJfvmQSrjawb7yQFSDiqReA7ManV1j29Mkxt7IH-mWTevXf2Ma8zeO7y55QqYcHA814t-Om_FyH4Q';

export const routeMap = [
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
  '/contact',
  '/admin',
  '/search',
];

export const challengeWeeks = [
  { week: 1, title: 'Thử thách AI tuần 1', description: 'Ba nhóm nhiệm vụ: báo chí hiện đại, lưu trữ dữ liệu thông minh và sản phẩm truyền thông thương mại hóa.', status: 'Đang mở' },
  { week: 2, title: 'Chủ đề tuần 2', description: 'Nội dung sẽ được Ban Tổ chức công bố sau.', status: 'Sắp diễn ra' },
  { week: 3, title: 'Chủ đề tuần 3', description: 'Nội dung sẽ được Ban Tổ chức công bố sau.', status: 'Sắp diễn ra' },
  { week: 4, title: 'Chủ đề tuần 4', description: 'Nội dung sẽ được Ban Tổ chức công bố sau.', status: 'Sắp diễn ra' },
  { week: 5, title: 'Tuần đặc biệt', description: 'Một đề chung cho toàn cơ quan, không chia nhóm nhiệm vụ.', status: 'Sắp diễn ra' },
];

export const aiNewsItems: AINewsItem[] = [
  {
    id: 'ai-newsroom-workflow',
    title: 'AI trong tòa soạn: từ gợi ý đề tài đến bản nháp có kiểm chứng',
    category: 'AI trong tòa soạn',
    summary:
      'Gợi ý quy trình dùng AI để tìm góc tiếp cận, lập dàn ý, tóm tắt tài liệu và giữ bước kiểm chứng của phóng viên, biên tập viên.',
    date: '02/7/2026',
    readTime: '4 phút đọc',
    image: heroImage,
    tags: ['tòa soạn', 'kiểm chứng', 'quy trình'],
    content: [
      'AI phù hợp nhất khi đóng vai trò trợ lý chuẩn bị: gom ý, đề xuất câu hỏi phỏng vấn, dựng cấu trúc bài và tóm tắt tài liệu nền.',
      'Mỗi đầu ra cần được đối chiếu với nguồn chính thức, ghi lại prompt đã dùng và nêu rõ phần nào do con người quyết định.',
    ],
  },
  {
    id: 'tool-update-week-1',
    title: 'Cập nhật công cụ AI đáng thử trong tuần 1',
    category: 'Cập nhật công cụ AI',
    summary:
      'Danh sách công cụ hỗ trợ nghiên cứu, biên tập, thiết kế nhanh và trình bày ý tưởng để các nhóm chọn đúng công cụ cho bài dự thi.',
    date: '02/7/2026',
    readTime: '3 phút đọc',
    image: archiveImage,
    tags: ['ChatGPT', 'Gemini', 'Canva', 'Gamma'],
    content: [
      'Nhóm phóng viên có thể ưu tiên công cụ nghiên cứu và tóm tắt nguồn; nhóm tổng hợp nên thử luồng phân loại văn bản; nhóm kinh doanh nên kết hợp công cụ trình bày proposal.',
      'Không đưa dữ liệu mật, tài liệu nội bộ nhạy cảm hoặc thông tin chưa được phép công bố vào công cụ AI công khai.',
    ],
  },
  {
    id: 'contest-application-corner',
    title: 'Góc ứng dụng cuộc thi: cách biến prompt thành bài dự thi rõ điểm',
    category: 'Góc ứng dụng cuộc thi',
    summary:
      'Một bài dự thi mạnh nên chỉ ra vấn đề ban đầu, prompt đã dùng, kết quả trước và sau AI, cùng khả năng áp dụng lại trong phòng ban.',
    date: '01/7/2026',
    readTime: '5 phút đọc',
    image: mediaImage,
    tags: ['bài dự thi', 'prompt', 'nhân rộng'],
    content: [
      'Ban Giám khảo cần nhìn thấy tác động thực tế: tiết kiệm thời gian, giảm lỗi, tăng chất lượng nội dung hoặc mở ra sản phẩm truyền thông mới.',
      'Nhật ký tác nghiệp nên ghi theo từng bước để người khác có thể học lại quy trình, không chỉ xem sản phẩm cuối.',
    ],
  },
  {
    id: 'safe-ai-checklist',
    title: 'Checklist dùng AI an toàn cho tài liệu và dữ liệu nội bộ',
    category: 'AI trong tòa soạn',
    summary:
      'Các nguyên tắc nhanh trước khi đưa dữ liệu vào AI: phân loại mức độ nhạy cảm, ẩn thông tin cá nhân và kiểm tra quyền chia sẻ.',
    date: '30/6/2026',
    readTime: '4 phút đọc',
    image: archiveImage,
    tags: ['an toàn dữ liệu', 'lưu trữ', 'quyền truy cập'],
    content: [
      'Với dữ liệu nội bộ, hãy tách phần có thể chia sẻ và phần cần giữ kín trước khi hỏi AI. Ưu tiên mô tả ngữ cảnh thay vì dán nguyên văn tài liệu nhạy cảm.',
      'Kết quả AI chỉ là bản tham khảo. Người phụ trách vẫn phải kiểm tra tính đúng, đủ và phù hợp với quy định cơ quan.',
    ],
  },
  {
    id: 'prompt-review-method',
    title: 'Cách rà soát prompt trước khi đưa vào Kho Prompt',
    category: 'Cập nhật công cụ AI',
    summary:
      'Một prompt tốt cần có vai trò, bối cảnh, dữ liệu đầu vào, định dạng đầu ra và tiêu chí tự kiểm tra để người khác dùng lại ổn định.',
    date: '29/6/2026',
    readTime: '3 phút đọc',
    image: newsroomImage,
    tags: ['Kho Prompt', 'chuẩn hóa', 'chia sẻ'],
    content: [
      'Trước khi công khai prompt, hãy thử với ít nhất hai trường hợp khác nhau để xem đầu ra có nhất quán không.',
      'Nên bổ sung cảnh báo về nguồn dữ liệu, giới hạn sử dụng và bước kiểm chứng để tránh hiểu nhầm AI là kết quả cuối cùng.',
    ],
  },
];

export const challenges: Challenge[] = [
  {
    id: 'newsroom-next',
    week: 1,
    title: 'Nghiên cứu và phát triển các thể loại báo chí hiện đại',
    shortTitle: 'Báo chí hiện đại',
    deadline: '15h ngày 06/7/2026',
    status: 'Đang mở',
    targetGroup: 'Nhóm Phóng viên, Biên tập viên',
    description:
      'Tìm hiểu các thể loại báo chí hiện đại đang được áp dụng tại các cơ quan báo chí trong khu vực ASEAN và các cơ quan báo chí có điều kiện phát triển tương đồng với Việt Nam; từ đó đối chiếu với sản phẩm hiện có của Tạp chí Thời đại và dùng AI đề xuất phương án hoàn thiện, phát triển.',
    requirements: [
      'Xác định tối thiểu 05 thể loại báo chí hiện đại.',
      'Với mỗi thể loại, làm rõ khái niệm, đặc trưng, cấu trúc thể hiện, cách tổ chức nội dung, ưu điểm, hạn chế và điều kiện triển khai trong thực tế.',
      'Với mỗi thể loại, lựa chọn tối thiểu 01 sản phẩm báo chí tiêu biểu để minh họa và phân tích yếu tố tạo nên hiệu quả, sức hấp dẫn, giá trị của sản phẩm.',
      'Đối chiếu với các sản phẩm hiện có của Tạp chí Thời đại để xác định hình thức tương đồng đã triển khai, mức độ đáp ứng tiêu chí và điểm cần hoàn thiện hoặc nâng cấp.',
      'Sử dụng AI để đề xuất phương án điều chỉnh sản phẩm hiện có; nếu chưa có sản phẩm tương ứng, đề xuất lộ trình, giải pháp và điều kiện cần thiết để phát triển.',
    ],
    deliverables: [
      'Bản nghiên cứu tối thiểu 05 thể loại báo chí hiện đại.',
      'Bảng đối chiếu với sản phẩm hiện có của Tạp chí Thời đại.',
      'Đề xuất điều chỉnh, nâng cấp hoặc phát triển mới có sử dụng AI.',
      'Nhật ký tác nghiệp theo từng bước, prompt sử dụng và file minh chứng.',
    ],
    submissionLink: '/submit',
    image: newsroomImage,
    score: 100,
  },
  {
    id: 'smart-archive',
    week: 1,
    title: 'Xây dựng hệ thống lưu trữ văn bản và dữ liệu thông minh',
    shortTitle: 'Lưu trữ thông minh',
    deadline: '15h ngày 06/7/2026',
    status: 'Đang mở',
    targetGroup: 'Nhóm Tổng hợp',
    description:
      'Sử dụng AI để tìm hiểu phương pháp tổ chức, phân loại, lưu trữ và khai thác văn bản, dữ liệu; so sánh các mô hình hiện nay và đề xuất mô hình phù hợp với điều kiện thực tế của Tạp chí Thời đại.',
    requirements: [
      'Tìm hiểu và phân tích các phương pháp tổ chức, phân loại, lưu trữ và khai thác văn bản, dữ liệu bằng AI.',
      'So sánh ưu điểm, hạn chế của các mô hình lưu trữ hiện nay.',
      'Đề xuất mô hình và quy trình lưu trữ, quản lý văn bản, dữ liệu phù hợp với điều kiện thực tế của Tạp chí Thời đại, bảo đảm thuận tiện cho việc tìm kiếm, khai thác và tái sử dụng.',
      'Đề xuất giải pháp ứng dụng AI nhằm nâng cao hiệu quả quản lý, chia sẻ và khai thác dữ liệu trong cơ quan.',
    ],
    deliverables: [
      'Bản phân tích phương pháp và mô hình lưu trữ bằng AI.',
      'Mô hình/quy trình lưu trữ, quản lý văn bản và dữ liệu đề xuất cho Tạp chí.',
      'Giải pháp ứng dụng AI cho quản lý, chia sẻ và khai thác dữ liệu.',
      'Nhật ký tác nghiệp theo từng bước, prompt sử dụng và file minh chứng.',
    ],
    submissionLink: '/submit',
    sampleFile: '/samples/bai-du-thi-nhom-tong-hop-nguyen-duy-dong.docx',
    image: archiveImage,
    score: 100,
  },
  {
    id: 'idea-to-media-product',
    week: 1,
    title: 'Chuyển hóa ý tưởng thành sản phẩm truyền thông có khả năng thương mại hóa',
    shortTitle: 'Sản phẩm truyền thông',
    deadline: '15h ngày 06/7/2026',
    status: 'Đang mở',
    targetGroup: 'Nhóm Kinh doanh',
    description:
      'Sử dụng AI để tìm hiểu các bước chuyển từ ý tưởng ban đầu đến sản phẩm truyền thông hoàn chỉnh, từ đó xây dựng tối thiểu 01 sản phẩm có thể giới thiệu, tiếp thị hoặc chào bán cho khách hàng.',
    requirements: [
      'Tìm hiểu các bước chuyển từ ý tưởng ban đầu đến sản phẩm truyền thông hoàn chỉnh.',
      'Xây dựng tối thiểu 01 sản phẩm truyền thông có thể giới thiệu, tiếp thị hoặc chào bán cho khách hàng.',
      'Phân tích nhu cầu thị trường, đối tượng khách hàng và khả năng thương mại hóa của sản phẩm.',
      'Đề xuất phương án truyền thông, tiếp thị và khai thác sản phẩm trong thực tế.',
      'Nêu rõ vai trò của AI trong quá trình nghiên cứu, phát triển và hoàn thiện sản phẩm.',
    ],
    deliverables: [
      'Bản mô tả hoặc proposal sản phẩm truyền thông.',
      'Phân tích thị trường, khách hàng mục tiêu và khả năng thương mại hóa.',
      'Phương án truyền thông, tiếp thị và khai thác sản phẩm.',
      'Nhật ký tác nghiệp theo từng bước, prompt sử dụng và file minh chứng.',
    ],
    submissionLink: '/submit',
    image: mediaImage,
    score: 100,
  },
];

export const promptCategories = [
  'Tất cả',
  'Phóng viên',
  'Biên tập viên',
  'Tổng hợp',
  'Kinh doanh',
  'Hành chính - văn thư',
  'Lưu trữ dữ liệu',
  'Báo cáo',
  'Rà soát chính tả',
  'Sản xuất video',
  'Truyền thông',
  'Thiết kế hình ảnh',
  'Phân tích dữ liệu',
];

export const promptTools = ['Tất cả', 'ChatGPT', 'Gemini', 'Claude', 'Copilot', 'Perplexity', 'Canva', 'Gamma', 'Khác'];
export const promptDifficulties = ['Tất cả', 'Cơ bản', 'Trung bình', 'Nâng cao'];
export const promptStatuses = ['Tất cả', 'Đã kiểm chứng', 'Đang thử nghiệm', 'Đề xuất mới'];

export const prompts: Prompt[] = [
  {
    id: 'research-modern-journalism',
    title: 'Prompt nghiên cứu thể loại báo chí hiện đại',
    category: 'Phóng viên',
    department: 'Ban Nội dung số',
    contributor: 'Nguyễn Vân A',
    tool: 'Perplexity',
    difficulty: 'Nâng cao',
    purpose: 'Tổng hợp, phân tích và so sánh các thể loại báo chí hiện đại trong khu vực.',
    context: 'Dùng cho nhiệm vụ nghiên cứu và phát triển các thể loại báo chí hiện đại ở tuần 1 khi cần có nguồn, ví dụ và bảng đối chiếu.',
    fullPrompt:
      'Bạn là chuyên gia phát triển sản phẩm báo chí số. Hãy nghiên cứu tối thiểu 05 thể loại báo chí hiện đại đang được áp dụng tại ASEAN hoặc các cơ quan báo chí có điều kiện phát triển tương đồng với Việt Nam. Với mỗi thể loại, hãy trình bày: khái niệm, đặc trưng, cấu trúc, ví dụ tiêu biểu, điều kiện áp dụng, rủi ro, và cách Tạp chí Thời đại có thể nâng cấp sản phẩm hiện có bằng AI. Kết quả cần có bảng so sánh và đề xuất ưu tiên triển khai trong 30 ngày.',
    usageSteps: ['Nêu chủ đề hoặc mảng nội dung cần nghiên cứu.', 'Yêu cầu AI kèm nguồn tham khảo.', 'Kiểm chứng lại từng ví dụ trước khi dùng.', 'Chuyển kết quả thành bảng đối chiếu nội bộ.'],
    sampleInput: 'Chủ đề: báo chí đối ngoại, độc giả trẻ, kênh số.',
    sampleOutput: 'Bảng 05 thể loại: explainer, data story, visual essay, newsletter series, interactive Q&A.',
    notes: ['Không dùng nguồn chưa kiểm chứng.', 'Nên yêu cầu AI tách rõ dữ kiện và đề xuất.'],
    applicableDepartments: ['Phóng viên', 'Biên tập viên', 'Truyền thông'],
    tags: ['research', 'newsroom', 'ASEAN', 'AI workflow'],
    week: 1,
    status: 'Đã kiểm chứng',
    updatedAt: '01/7/2026',
  },
  {
    id: 'administrative-tone-review',
    title: 'Prompt rà soát văn phong hành chính',
    category: 'Hành chính - văn thư',
    department: 'Văn phòng',
    contributor: 'Vũ Mai Anh',
    tool: 'ChatGPT',
    difficulty: 'Cơ bản',
    purpose: 'Rà soát câu chữ, lỗi chính tả và giọng văn hành chính trước khi phát hành.',
    context: 'Dùng cho công văn, email nội bộ, thông báo và kế hoạch ngắn.',
    fullPrompt:
      'Hãy rà soát văn bản sau theo văn phong hành chính chuyên nghiệp, ngắn gọn, rõ ý. Kiểm tra lỗi chính tả, lỗi diễn đạt, câu quá dài, từ chưa phù hợp và đề xuất bản chỉnh sửa. Giữ nguyên nội dung nghiệp vụ, không thêm thông tin mới. Trả kết quả theo ba phần: lỗi phát hiện, bản sửa đề xuất, lưu ý khi phát hành.',
    usageSteps: ['Dán văn bản cần rà soát.', 'Bổ sung bối cảnh phát hành nếu có.', 'Đọc lại bản sửa và duyệt thủ công.', 'Lưu bản cuối vào hồ sơ văn thư.'],
    sampleInput: 'Thông báo lịch họp giao ban tuần.',
    sampleOutput: 'Danh sách lỗi và bản thông báo đã chuẩn hóa.',
    notes: ['Không nhập văn bản mật hoặc chưa được phép xử lý trên công cụ AI công cộng.'],
    applicableDepartments: ['Hành chính - văn thư', 'Tổng hợp'],
    tags: ['hành chính', 'chính tả', 'văn phong'],
    week: 1,
    status: 'Đã kiểm chứng',
    updatedAt: '01/7/2026',
  },
  {
    id: 'smart-archive-model',
    title: 'Prompt thiết kế mô hình lưu trữ thông minh',
    category: 'Lưu trữ dữ liệu',
    department: 'Tổng hợp',
    contributor: 'Nguyễn Duy Đông',
    tool: 'Claude',
    difficulty: 'Nâng cao',
    purpose: 'Thiết kế cây thư mục, khung metadata, quy trình lưu trữ và lộ trình ứng dụng AI cho kho văn bản.',
    context: 'Dựa trên bài dự thi mẫu của anh Nguyễn Duy Đông, Phòng Tổng hợp, cho nhiệm vụ tuần 1 về hệ thống lưu trữ văn bản và dữ liệu thông minh.',
    fullPrompt:
      '1) Hãy phân tích các phương pháp phổ biến hiện nay để tổ chức, phân loại, lưu trữ và khai thác văn bản/dữ liệu bằng AI, so sánh cơ chế hoạt động, mức độ tự động hoá và chi phí triển khai tham khảo.\n\n2) Từ các phương pháp trên, hãy xây dựng bảng so sánh 4 mô hình lưu trữ theo tiêu chí: chi phí, mức tự động hoá, khả năng tìm kiếm, yêu cầu nhân sự kỹ thuật, mức độ phù hợp với một cơ quan báo chí đối ngoại quy mô vừa và nhỏ.\n\n3) Với bối cảnh Tạp chí Thời đại là cơ quan báo chí đối ngoại, có nhiều loại văn bản như công văn, tin bài, tư liệu ảnh, tài liệu đa ngôn ngữ và nguồn lực IT hạn chế, hãy thiết kế cây thư mục, khung metadata và quy trình lưu trữ - khai thác gồm các bước cụ thể, nêu rõ vai trò của AI ở từng bước.\n\n4) Hãy đề xuất các giải pháp ứng dụng AI khả thi, chi phí hợp lý, theo lộ trình ngắn hạn - trung hạn để nâng cao hiệu quả quản lý, chia sẻ và khai thác dữ liệu nội bộ, kèm lưu ý về bảo mật, phân quyền truy cập.',
    usageSteps: ['Khảo cứu phương pháp phân loại, lưu trữ và khai thác văn bản bằng AI.', 'Yêu cầu AI so sánh 4 mô hình lưu trữ bằng bảng tiêu chí rõ ràng.', 'Cung cấp bối cảnh Tạp chí Thời đại để AI thiết kế cây thư mục, metadata và quy trình 6 bước.', 'Rà lại đề xuất theo nhân sự, ngân sách, hạ tầng và ranh giới bảo mật của cơ quan.'],
    sampleInput: 'Công văn, tin bài, tư liệu ảnh, tài liệu đối ngoại đa ngôn ngữ đang lưu rải rác trên Drive/SharePoint.',
    sampleOutput: 'Lộ trình 2 giai đoạn: dùng nền tảng văn phòng điện toán đám mây sẵn có kết hợp AI phân loại/tìm kiếm ngữ nghĩa, sau đó cân nhắc vector database + RAG khi nhu cầu tăng.',
    notes: ['Không đưa văn bản mật hoặc dữ liệu nội bộ nhạy cảm vào công cụ AI công cộng.', 'Khung metadata cần tối giản để cán bộ dễ áp dụng ngay.', 'Mọi gợi ý phân loại của AI cần có người dùng xác nhận.'],
    applicableDepartments: ['Tổng hợp', 'Lưu trữ dữ liệu', 'Hành chính - văn thư'],
    tags: ['archive', 'metadata', 'semantic search', 'RAG'],
    week: 1,
    status: 'Đã kiểm chứng',
    updatedAt: '01/7/2026',
  },
  {
    id: 'commercial-media-product',
    title: 'Prompt xây dựng sản phẩm truyền thông thương mại',
    category: 'Kinh doanh',
    department: 'Kinh doanh',
    contributor: 'Lê Hoàng C',
    tool: 'ChatGPT',
    difficulty: 'Trung bình',
    purpose: 'Biến ý tưởng thành gói sản phẩm truyền thông có thể chào bán.',
    context: 'Dùng cho nhiệm vụ chuyển hóa ý tưởng thành sản phẩm truyền thông có khả năng thương mại hóa.',
    fullPrompt:
      'Bạn là chuyên gia phát triển sản phẩm truyền thông. Từ ý tưởng sau, hãy xây dựng một gói sản phẩm có thể giới thiệu cho khách hàng. Hãy phân tích nhu cầu thị trường, chân dung khách hàng mục tiêu, cấu trúc gói sản phẩm, thông điệp bán hàng, kênh triển khai, chi phí dự kiến, rủi ro và cách đo hiệu quả. Trả kết quả như một proposal ngắn 01 trang.',
    usageSteps: ['Nhập ý tưởng và nhóm khách hàng.', 'Yêu cầu AI tạo proposal.', 'Điều chỉnh theo năng lực thực tế.', 'Tạo slide hoặc email chào bán.'],
    sampleInput: 'Ý tưởng: chuỗi nội dung đối ngoại dành cho doanh nghiệp xuất khẩu.',
    sampleOutput: 'Gói bài viết, video ngắn, infographic và newsletter đối tác.',
    notes: ['Các con số chỉ là giả định, cần bộ phận kinh doanh rà lại.'],
    applicableDepartments: ['Kinh doanh', 'Truyền thông'],
    tags: ['kinh doanh', 'proposal', 'media product'],
    week: 1,
    status: 'Đã kiểm chứng',
    updatedAt: '01/7/2026',
  },
  {
    id: 'short-video-script',
    title: 'Prompt tạo kịch bản video ngắn',
    category: 'Sản xuất video',
    department: 'Truyền thông',
    contributor: 'Phạm Linh D',
    tool: 'Gemini',
    difficulty: 'Trung bình',
    purpose: 'Chuyển bài viết dài thành kịch bản video 60-90 giây.',
    context: 'Dùng cho TikTok, Reels, Shorts hoặc màn hình sự kiện.',
    fullPrompt:
      'Từ bài viết sau, hãy tạo kịch bản video ngắn 60-90 giây gồm hook 3 giây đầu, 3 ý chính, lời dẫn, gợi ý hình ảnh, chữ trên màn hình và CTA. Giọng văn gần gũi, chính xác, không giật tít quá mức. Hãy thêm checklist kiểm chứng thông tin trước khi dựng.',
    usageSteps: ['Dán bài viết hoặc tóm tắt.', 'Chọn nền tảng video.', 'Yêu cầu AI gợi ý shot list.', 'Biên tập lại theo brand voice.'],
    sampleInput: 'Bài viết về hoạt động đối ngoại nhân dân.',
    sampleOutput: 'Kịch bản 8 cảnh, lời dẫn và gợi ý caption.',
    notes: ['Không hy sinh độ chính xác để tăng tính viral.'],
    applicableDepartments: ['Truyền thông', 'Sản xuất video', 'Biên tập viên'],
    tags: ['video', 'short-form', 'script'],
    week: 2,
    status: 'Đề xuất mới',
    updatedAt: '01/7/2026',
  },
  {
    id: 'document-summary',
    title: 'Prompt tóm tắt công văn',
    category: 'Tổng hợp',
    department: 'Tổng hợp',
    contributor: 'Đỗ Anh E',
    tool: 'Copilot',
    difficulty: 'Cơ bản',
    purpose: 'Tóm tắt văn bản hành chính thành ý chính, deadline và việc cần làm.',
    context: 'Dùng với tài liệu đã được phép xử lý trong môi trường an toàn.',
    fullPrompt:
      'Hãy tóm tắt văn bản sau thành 05 gạch đầu dòng quan trọng nhất. Tách riêng: nội dung chính, thời hạn, đơn vị/cá nhân phụ trách, việc cần làm, rủi ro nếu chậm xử lý. Giữ giọng văn hành chính, không suy đoán ngoài văn bản.',
    usageSteps: ['Dán văn bản hoặc đoạn trích.', 'Kiểm tra các mốc thời gian.', 'Gắn việc cần làm vào checklist nội bộ.'],
    sampleInput: 'Công văn mời tham dự hội nghị.',
    sampleOutput: 'Tóm tắt 05 ý và bảng việc cần làm.',
    notes: ['Với văn bản mật, chỉ dùng công cụ nội bộ được cấp phép.'],
    applicableDepartments: ['Tổng hợp', 'Hành chính - văn thư'],
    tags: ['tóm tắt', 'công văn', 'checklist'],
    week: 1,
    status: 'Đã kiểm chứng',
    updatedAt: '01/7/2026',
  },
  {
    id: 'weekly-report',
    title: 'Prompt lập báo cáo tuần',
    category: 'Báo cáo',
    department: 'Văn phòng',
    contributor: 'Hoàng Nam F',
    tool: 'Claude',
    difficulty: 'Trung bình',
    purpose: 'Tổng hợp dữ liệu công việc thành báo cáo tuần có cấu trúc.',
    context: 'Dùng cho báo cáo nội bộ, dashboard hoặc họp giao ban.',
    fullPrompt:
      'Từ các ghi chú công việc sau, hãy lập báo cáo tuần gồm: việc đã hoàn thành, việc đang xử lý, vấn đề tồn đọng, số liệu đáng chú ý, đề xuất tuần tới. Giọng văn ngắn gọn, ưu tiên bảng. Nếu thiếu thông tin, hãy nêu câu hỏi bổ sung thay vì tự bịa.',
    usageSteps: ['Dán ghi chú thô.', 'Yêu cầu format theo mẫu phòng/ban.', 'Rà lại số liệu.', 'Xuất bản vào tài liệu chung.'],
    sampleInput: 'Danh sách đầu việc tuần của phòng Tổng hợp.',
    sampleOutput: 'Bảng báo cáo tuần và 05 đề xuất ưu tiên.',
    notes: ['Các số liệu cần đối soát với nguồn chính thức.'],
    applicableDepartments: ['Báo cáo', 'Tổng hợp', 'Kinh doanh'],
    tags: ['báo cáo', 'tuần', 'dashboard'],
    week: 2,
    status: 'Đang thử nghiệm',
    updatedAt: '01/7/2026',
  },
  {
    id: 'article-data-analysis',
    title: 'Prompt phân tích dữ liệu bài viết',
    category: 'Phân tích dữ liệu',
    department: 'Ban Nội dung số',
    contributor: 'Mai Chi G',
    tool: 'Gemini',
    difficulty: 'Nâng cao',
    purpose: 'Phân tích hiệu quả bài viết, nhóm chủ đề và đề xuất tối ưu nội dung.',
    context: 'Dùng với dữ liệu view, reach, time on page và nguồn traffic.',
    fullPrompt:
      'Bạn là chuyên gia phân tích dữ liệu nội dung. Từ bảng dữ liệu bài viết sau, hãy phân nhóm chủ đề, tìm bài có hiệu quả nổi bật, chỉ ra điểm bất thường, đề xuất 05 hành động tối ưu nội dung tuần tới. Hãy trình bày bằng bảng, có giả thuyết và cách kiểm chứng.',
    usageSteps: ['Chuẩn hóa bảng dữ liệu.', 'Ẩn dữ liệu nhạy cảm nếu cần.', 'Yêu cầu AI phân tích và đề xuất.', 'Đối chiếu với Google Analytics hoặc hệ thống nội bộ.'],
    sampleInput: 'CSV gồm title, category, views, average time, traffic source.',
    sampleOutput: 'Top chủ đề, bài viết tăng trưởng và đề xuất lịch nội dung.',
    notes: ['Không đưa dữ liệu cá nhân độc giả vào AI công cộng.'],
    applicableDepartments: ['Phân tích dữ liệu', 'Biên tập viên', 'Truyền thông'],
    tags: ['analytics', 'data', 'content'],
    week: 3,
    status: 'Đề xuất mới',
    updatedAt: '01/7/2026',
  },
];

export const submissions: Submission[] = [
  {
    id: 'modern-journalism-research',
    title: 'Ứng dụng AI nghiên cứu thể loại báo chí hiện đại',
    participantName: 'Nguyễn Vân A',
    department: 'Ban Nội dung số',
    week: 1,
    group: 'Phóng viên, Biên tập viên',
    aiTools: ['Perplexity', 'ChatGPT'],
    problem: 'Việc nghiên cứu xu hướng báo chí khu vực mất nhiều thời gian và khó chuẩn hóa nguồn.',
    processSummary: 'Dùng Perplexity tìm nguồn, ChatGPT lập bảng so sánh và biên tập viên kiểm chứng thủ công.',
    mainPrompt: prompts[0].fullPrompt,
    finalResult: 'Bộ khung 05 thể loại báo chí hiện đại và lộ trình thử nghiệm trong 30 ngày.',
    beforeAI: '120 phút để tìm nguồn rời rạc, ghi chú thủ công, khó đối chiếu.',
    afterAI: '22 phút để có bảng nguồn ban đầu, sau đó biên tập viên kiểm chứng và tinh chỉnh.',
    lessons: ['Prompt cần nêu rõ thị trường so sánh.', 'Cần yêu cầu AI tách dữ kiện và đề xuất.', 'Nguồn phải kiểm chứng lại trước khi công bố.'],
    recommendations: ['Tạo template nghiên cứu xu hướng dùng chung.', 'Kết hợp kho prompt với thư viện nguồn đã kiểm chứng.'],
    score: 450,
    award: 'Giải Nhất tuần',
    promptIds: ['research-modern-journalism'],
    fileLink: 'File minh chứng nội bộ',
    tags: ['newsroom', 'research', 'scalable'],
    isScalable: true,
    isPromptPublic: true,
    image: newsroomImage,
  },
  {
    id: 'smart-archive-model',
    title: 'Mô hình lưu trữ văn bản và dữ liệu thông minh cho Tạp chí',
    participantName: 'Nguyễn Duy Đông',
    department: 'Tổng hợp',
    week: 1,
    group: 'Tổng hợp',
    aiTools: ['Claude', 'Google Workspace/Microsoft 365'],
    problem: 'Văn bản, tin bài, tư liệu ảnh và tài liệu đối ngoại dễ bị lưu rải rác, phụ thuộc vào cách đặt tên thủ công nên khó tìm kiếm, khai thác lại và tái sử dụng khi nhân sự thay đổi.',
    processSummary: 'Dùng Claude theo 4 bước: khảo cứu phương pháp lưu trữ bằng AI, so sánh 4 mô hình lưu trữ, thiết kế cây thư mục - metadata - quy trình 6 bước cho Tạp chí Thời đại, sau đó đề xuất lộ trình AI kèm kiểm soát bảo mật.',
    mainPrompt: prompts[2].fullPrompt,
    finalResult: 'Đề xuất mô hình 2 giai đoạn: giai đoạn 1 tận dụng Google Workspace/Microsoft 365 kết hợp AI phân loại, gắn nhãn và tìm kiếm ngữ nghĩa trong 1-2 tháng; giai đoạn 2 cân nhắc kho dữ liệu riêng dùng vector database + RAG khi quy mô dữ liệu và nhu cầu tra cứu tăng. Cây thư mục gốc đề xuất: Phòng/Ban -> Loại văn bản -> Năm -> Ngôn ngữ; metadata tối thiểu gồm tiêu đề, loại văn bản, ngày ban hành/xuất bản, đơn vị soạn thảo, ngôn ngữ, mức bảo mật và từ khóa do AI gợi ý, người dùng xác nhận.',
    beforeAI: 'Lưu trữ thủ công theo thư mục và tên file tự do, dễ trùng lặp, thất lạc, tìm kiếm chậm và phụ thuộc trí nhớ cá nhân.',
    afterAI: 'Có cấu trúc thư mục thống nhất, metadata tối thiểu, quy trình 6 bước và định hướng semantic search/trợ lý AI nội bộ để tra cứu bằng ngôn ngữ tự nhiên.',
    lessons: ['AI hiệu quả hơn khi được cung cấp bối cảnh cụ thể về quy mô, đặc thù ngành, nhân sự, ngân sách và hạ tầng.', 'Nên yêu cầu AI trình bày bằng bảng so sánh và quy trình từng bước để dễ đối chiếu, phản biện.', 'Cần hiệu chỉnh đề xuất của AI theo điều kiện thực tế của cơ quan thay vì áp dụng nguyên trạng.', 'Với dữ liệu nội bộ, phải xác định rõ ranh giới bảo mật trước khi đưa vào bất kỳ công cụ AI nào.'],
    recommendations: ['Thí điểm mô hình lưu trữ - phân loại có hỗ trợ AI tại một phòng/ban trong 4-6 tuần trước khi nhân rộng.', 'Ban hành quy ước đặt tên văn bản và khung metadata thống nhất, kèm hướng dẫn ngắn gọn để cán bộ dễ áp dụng.', 'Xây dựng quy chế nội bộ về bảo mật dữ liệu khi sử dụng công cụ AI, đặc biệt với văn bản đối ngoại hoặc nhạy cảm.', 'Tổ chức tập huấn ngắn cho cán bộ, phóng viên về cách khai thác kho dữ liệu qua trợ lý AI nội bộ.'],
    score: 100,
    award: 'Bài dự thi mẫu',
    promptIds: ['smart-archive-model'],
    fileLink: 'Bài dự thi mẫu nhóm Tổng hợp - Nguyễn Duy Đông',
    tags: ['Tổng hợp', 'lưu trữ', 'metadata', 'semantic search', 'RAG'],
    isScalable: true,
    isPromptPublic: true,
    image: archiveImage,
  },
  {
    id: 'commercial-media-package',
    title: 'Gói truyền thông số cho đối tác đối ngoại',
    participantName: 'Lê Hoàng C',
    department: 'Kinh doanh',
    week: 1,
    group: 'Kinh doanh',
    aiTools: ['ChatGPT', 'Gamma', 'Canva'],
    problem: 'Ý tưởng bán hàng chưa chuyển hóa nhanh thành proposal dễ trình bày.',
    processSummary: 'Dùng AI tạo khung proposal, Gamma dựng slide, Canva phác visual cho khách hàng.',
    mainPrompt: prompts[3].fullPrompt,
    finalResult: 'Proposal gói truyền thông số gồm bài viết, video, infographic và newsletter.',
    beforeAI: 'Mất 1-2 ngày để gom ý tưởng, viết proposal và dựng slide.',
    afterAI: 'Có bản nháp proposal trong 45 phút, đội kinh doanh tập trung tinh chỉnh giá trị bán hàng.',
    lessons: ['AI hữu ích ở bước tạo khung, không thay thế hiểu biết khách hàng.', 'Cần kiểm tra tính khả thi của chi phí.'],
    recommendations: ['Tạo bộ mẫu proposal theo ngành.', 'Kết nối kho bài tiêu biểu làm minh chứng bán hàng.'],
    score: 418,
    award: 'Giải Ứng dụng sáng tạo',
    promptIds: ['commercial-media-product'],
    fileLink: 'File minh chứng nội bộ',
    tags: ['kinh doanh', 'proposal', 'media'],
    isScalable: true,
    isPromptPublic: true,
    image: mediaImage,
  },
  {
    id: 'spellcheck-newsletter',
    title: 'Quy trình AI rà soát chính tả bản tin tuần',
    participantName: 'Phạm Linh D',
    department: 'Biên tập',
    week: 1,
    group: 'Biên tập viên',
    aiTools: ['ChatGPT'],
    problem: 'Bản tin tuần có nhiều đoạn ngắn, dễ sót lỗi chính tả và thống nhất thuật ngữ.',
    processSummary: 'Tạo prompt rà lỗi theo checklist rồi biên tập viên duyệt lại từng đề xuất.',
    mainPrompt: prompts[1].fullPrompt,
    finalResult: 'Checklist rà chính tả và văn phong dùng trước khi phát hành bản tin.',
    beforeAI: 'Rà thủ công từng đoạn, dễ bỏ sót lỗi lặp.',
    afterAI: 'Có danh sách lỗi gợi ý và bản sửa, giảm thời gian soát lần đầu.',
    lessons: ['AI đôi khi sửa quá tay.', 'Cần giữ quyền quyết định ở biên tập viên.'],
    recommendations: ['Dùng chung cho thông báo, email và bản tin nội bộ.'],
    score: 410,
    award: 'Prompt hay nhất tuần',
    promptIds: ['administrative-tone-review'],
    fileLink: 'File minh chứng nội bộ',
    tags: ['chính tả', 'biên tập', 'quality'],
    isScalable: true,
    isPromptPublic: true,
    image: heroImage,
  },
  {
    id: 'monthly-report-workflow',
    title: 'Workflow AI tổng hợp báo cáo tháng',
    participantName: 'Đỗ Anh E',
    department: 'Văn phòng',
    week: 2,
    group: 'Tổng hợp',
    aiTools: ['Claude', 'Copilot'],
    problem: 'Báo cáo tháng nhiều nguồn, mất thời gian gom ý chính.',
    processSummary: 'Tạo quy trình nhập ghi chú, gom số liệu, tạo bản nháp báo cáo và checklist đối soát.',
    mainPrompt: prompts[6].fullPrompt,
    finalResult: 'Mẫu báo cáo tháng có bảng việc đã làm, tồn đọng và đề xuất.',
    beforeAI: 'Mỗi báo cáo cần nhiều vòng gom tài liệu.',
    afterAI: 'Có bản nháp chuẩn hóa trong một phiên làm việc.',
    lessons: ['Cần chuẩn hóa dữ liệu đầu vào.', 'AI không thay thế bước xác nhận số liệu.'],
    recommendations: ['Tạo Google Sheet đầu vào thống nhất.', 'Kết nối với Drive để lưu bản nháp.'],
    score: 398,
    award: 'Quy trình có khả năng nhân rộng',
    promptIds: ['weekly-report'],
    fileLink: 'File minh chứng nội bộ',
    tags: ['báo cáo', 'workflow', 'office'],
    isScalable: true,
    isPromptPublic: false,
    image: archiveImage,
  },
  {
    id: 'video-script-from-longform',
    title: 'Kịch bản video truyền thông từ bài viết dài',
    participantName: 'Mai Chi G',
    department: 'Truyền thông',
    week: 2,
    group: 'Truyền thông',
    aiTools: ['Gemini', 'Canva'],
    problem: 'Chuyển bài viết dài thành video ngắn mất thời gian lựa chọn hook và visual.',
    processSummary: 'AI tạo kịch bản 8 cảnh, đội truyền thông biên tập hook và kiểm tra thông tin.',
    mainPrompt: prompts[4].fullPrompt,
    finalResult: 'Kịch bản video 75 giây kèm caption và shot list.',
    beforeAI: 'Tốn nhiều vòng brainstorm để chọn góc video.',
    afterAI: 'Có 3 phiên bản hook và shot list để chọn nhanh.',
    lessons: ['Hook cần đúng mực báo chí.', 'Cần kiểm tra lại tên riêng, ngày tháng.'],
    recommendations: ['Dùng cho các bài dài cần social cutdown.', 'Xây mẫu storyboard chung.'],
    score: 392,
    award: 'Cá nhân lan tỏa AI',
    promptIds: ['short-video-script'],
    fileLink: 'File minh chứng nội bộ',
    tags: ['video', 'social', 'content'],
    isScalable: true,
    isPromptPublic: true,
    image: mediaImage,
  },
];

export const leaderboardItems: LeaderboardItem[] = submissions.map((submission, index) => ({
  rank: index + 1,
  name: submission.participantName,
  department: submission.department,
  submissionTitle: submission.title,
  week: submission.week,
  score: submission.score,
  award: submission.award,
  badge: ['Nhà vô địch AI', 'Người tạo quy trình AI', 'Nhà sáng tạo AI', 'Bậc thầy prompt', 'Người xây dựng prompt', 'Đại sứ AI'][index] || 'Người khởi đầu AI',
  status: index < 3 ? 'Vinh danh' : 'Đã ghi nhận',
}));

export const departmentScores: DepartmentScore[] = [
  { department: 'Ban Nội dung số', submissionCount: 4, promptCount: 5, averageScore: 438, featuredSubmission: 'Ứng dụng AI nghiên cứu thể loại báo chí hiện đại' },
  { department: 'Tổng hợp', submissionCount: 3, promptCount: 4, averageScore: 416, featuredSubmission: 'Mô hình lưu trữ văn bản thông minh cho Tạp chí' },
  { department: 'Kinh doanh', submissionCount: 2, promptCount: 3, averageScore: 418, featuredSubmission: 'Gói truyền thông số cho đối tác đối ngoại' },
  { department: 'Văn phòng', submissionCount: 2, promptCount: 3, averageScore: 398, featuredSubmission: 'Workflow AI tổng hợp báo cáo tháng' },
  { department: 'Truyền thông', submissionCount: 3, promptCount: 4, averageScore: 392, featuredSubmission: 'Kịch bản video truyền thông từ bài viết dài' },
];

export const aiTools: AITool[] = [
  { name: 'ChatGPT', purpose: 'Viết nháp, tóm tắt, brainstorming, chuẩn hóa quy trình.', suitableFor: 'Biên tập viên, Hành chính, Kinh doanh', notes: 'Không nhập tài liệu mật; luôn kiểm chứng dữ kiện.', accent: 'red', icon: 'chat_bubble' },
  { name: 'Gemini', purpose: 'Tra cứu, làm việc với tài liệu Google, phân tích hình ảnh và dữ liệu.', suitableFor: 'Phóng viên, Truyền thông, Phân tích dữ liệu', notes: 'Kiểm tra nguồn trước khi dùng cho sản phẩm báo chí.', accent: 'blue', icon: 'radio_button_checked' },
  { name: 'Claude', purpose: 'Viết văn bản dài, phân tích tài liệu và tạo cấu trúc báo cáo.', suitableFor: 'Biên tập viên, Tổng hợp, Báo cáo', notes: 'Tốt cho nội dung dài nhưng vẫn cần biên tập lại.', accent: 'orange', icon: 'auto_awesome' },
  { name: 'Microsoft Copilot', purpose: 'Hỗ trợ Word, Excel, PowerPoint và quy trình văn phòng.', suitableFor: 'Hành chính, Văn phòng, Báo cáo', notes: 'Ưu tiên dùng trong môi trường tài khoản cơ quan nếu có.', accent: 'red', icon: 'workspace_premium' },
  { name: 'Perplexity', purpose: 'Tìm kiếm AI có trích dẫn, hỗ trợ fact-check ban đầu.', suitableFor: 'Phóng viên, Biên tập viên, Kiểm chứng', notes: 'Trích dẫn là điểm bắt đầu, không phải kết luận cuối.', accent: 'cyan', icon: 'search_check' },
  { name: 'Canva', purpose: 'Thiết kế hình ảnh, infographic, social post và mockup nhanh.', suitableFor: 'Truyền thông, Thiết kế hình ảnh, Kinh doanh', notes: 'Kiểm tra bản quyền ảnh và font trước khi công bố.', accent: 'cyan', icon: 'palette' },
  { name: 'Gamma', purpose: 'Tạo slide, proposal và bố cục báo cáo từ nội dung text.', suitableFor: 'Kinh doanh, Truyền thông, Báo cáo', notes: 'Nên biên tập lại số liệu và nhận diện thương hiệu.', accent: 'purple', icon: 'present_to_all' },
  { name: 'NotebookLM', purpose: 'Làm trợ lý đọc tài liệu chuyên sâu theo bộ nguồn đã chọn.', suitableFor: 'Nghiên cứu, Tổng hợp, Lưu trữ dữ liệu', notes: 'Chỉ đưa vào tài liệu được phép xử lý.', accent: 'red', icon: 'menu_book' },
];

export const badges: Badge[] = [
  { name: 'Người khởi đầu AI', description: 'Hoàn thành thử thách đầu tiên và chia sẻ bài học.', tone: 'soft' },
  { name: 'Người xây dựng prompt', description: 'Đóng góp prompt có thể dùng lại cho phòng/ban.', tone: 'red' },
  { name: 'Người tạo quy trình AI', description: 'Tạo quy trình AI có khả năng nhân rộng.', tone: 'cyan' },
  { name: 'Nhà sáng tạo AI', description: 'Có ý tưởng sáng tạo, khác biệt và thực tế.', tone: 'orange' },
  { name: 'Nhà vô địch AI', description: 'Dẫn đầu bảng vàng tuần hoặc tổng kết.', tone: 'dark' },
  { name: 'Bậc thầy prompt', description: 'Prompt rõ, hiệu quả, dễ áp dụng cho nhiều nhóm.', tone: 'purple' },
  { name: 'Đại sứ AI', description: 'Lan tỏa cách dùng AI an toàn trong cơ quan.', tone: 'soft' },
];

export const scoringCriteria = [
  { label: 'Tính phù hợp với yêu cầu tuần thi', points: 20 },
  { label: 'Hiệu quả ứng dụng AI', points: 30 },
  { label: 'Tính sáng tạo và khả năng nhân rộng', points: 20 },
  { label: 'Chất lượng sản phẩm dự thi', points: 20 },
  { label: 'Tinh thần tham gia và chia sẻ kinh nghiệm', points: 10 },
];

export const submissionChecklist = [
  'Thông tin người dự thi',
  'Tên bài dự thi và nội dung bài dự thi',
  'File bài dự thi upload trực tiếp lên hệ thống',
  'Các công cụ AI sử dụng, gồm tên nền tảng, phiên bản hoặc gói dịch vụ nếu có',
  'Nhật ký tác nghiệp theo từng bước: nội dung thực hiện, công cụ AI, prompt, mô tả đáp án AI và lý do chọn kết quả',
  'Bài học kinh nghiệm rút ra trong quá trình sử dụng AI',
  'Kiến nghị hoặc đề xuất nhằm nâng cao hiệu quả ứng dụng AI trong công việc chuyên môn',
  'Phương pháp tương tác để AI hiểu đúng yêu cầu, văn phong, quy chuẩn hoặc đặc thù công việc của đơn vị',
  'File minh chứng upload trực tiếp lên hệ thống',
  'Cam kết trung thực, bảo mật thông tin và tuân thủ quy tắc nghề nghiệp',
];

export const contactTopics = ['Hỏi về thể lệ', 'Hỏi về cách nộp bài', 'Hỗ trợ kỹ thuật', 'Gửi prompt/bài tiêu biểu để đăng lên kho chung'];

export function findChallenge(id: string) {
  return challenges.find((challenge) => challenge.id === id);
}

export function findPrompt(id: string) {
  return prompts.find((prompt) => prompt.id === id);
}

export function findSubmission(id: string) {
  return submissions.find((submission) => submission.id === id);
}
