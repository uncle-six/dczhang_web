export type QuizOption = { text: string; explanation: string };
export type QuizQuestion = {
  id: number;
  category: string;
  topic: string;
  difficulty: '基础' | '进阶' | '挑战';
  stem: string;
  options: QuizOption[];
  answer: number;
  takeaway: string;
};

type Fact = [term: string, definition: string, trap: string, example: string];

const java: Fact[] = [
  ['JDK', 'Java 开发工具包，包含编译器、调试器以及 JRE', '只负责运行字节码，不包含开发工具', '使用 javac 编译源文件'],
  ['JRE', 'Java 运行环境，包含 JVM 和运行所需类库', '等同于完整的开发工具包 JDK', '为已编译的 Java 程序提供运行环境'],
  ['javac', '把 .java 源文件编译为 .class 字节码的工具', '直接把 Java 源码解释成机器码并长期保存', '执行 javac Hello.java'],
  ['byte', '8 位有符号整数，取值范围是 -128 到 127', '8 位无符号整数，取值范围是 0 到 255', 'byte n = 127'],
  ['char', '16 位无符号 UTF-16 代码单元', '8 位有符号 ASCII 字符', "char grade = 'A'"],
  ['自动类型提升', 'byte、short、char 参与算术运算时通常先提升为 int', '运算结果始终保持原操作数的窄类型', 'byte a=1,b=2; a+b 的类型为 int'],
  ['短路与 &&', '左侧为 false 时不再计算右侧表达式', '无论左侧结果如何都会计算右侧', 'obj != null && obj.isReady()'],
  ['switch 表达式', '可用箭头标签返回值，并避免传统贯穿问题', '只能接收 int，且不能产生值', 'int n = switch(day) { case SAT,SUN -> 0; default -> 1; }'],
  ['for 循环', '适合初始化、条件和迭代逻辑明确的重复执行', '循环体保证至少执行一次', 'for (int i=0; i<10; i++)'],
  ['do-while', '先执行循环体再判断条件，因此至少执行一次', '先判断条件，条件为 false 时一次也不执行', 'do { read(); } while (retry);'],
  ['break', '立即结束当前循环或 switch', '跳过本次循环并直接开始下一次', '找到目标后 break'],
  ['continue', '跳过当前迭代剩余语句并进入下一次迭代', '永久终止当前循环', '遇到无效数据时 continue'],
  ['String 不可变性', 'String 对象创建后内容不可改变，拼接通常产生新对象', 'String 的字符数组可通过下标直接修改', 's.toUpperCase() 返回新的字符串'],
  ['字符串池', '字符串字面量可复用池中的同内容对象', 'new String 总会自动返回池内同一引用', '"java" 与另一个相同字面量通常共享引用'],
  ['equals', 'String.equals 比较字符序列内容', '对所有引用类型都等同于比较内存地址', '"a".equals(input)'],
  ['StringBuilder', '非线程安全的可变字符序列，单线程拼接通常更高效', '不可变且每次 append 都创建新对象', '循环中使用 builder.append(value)'],
  ['StringBuffer', '方法通常带同步，适合确有共享可变缓冲区的场景', '一定比 StringBuilder 更快', '多线程共享同一缓冲区时考虑使用'],
  ['数组 length', '数组长度在创建后固定，通过 length 字段读取', '数组可自动扩容，通过 length() 方法读取', 'scores.length'],
  ['二维数组', '本质是数组的数组，各行长度可以不同', '必须是每行长度相等的连续矩阵', 'int[][] a = {{1}, {2,3}}'],
  ['封装', '隐藏内部状态，通过受控方法维护对象不变式', '把所有字段声明为 public 以方便访问', 'private balance 配合 deposit 方法'],
  ['继承', '子类复用并扩展父类的可访问行为，Java 类为单继承', '一个 Java 类可以直接继承多个类', 'class Dog extends Animal'],
  ['多态', '父类型引用可指向子类对象，运行时选择被重写的方法', '根据变量声明类型固定调用实现，和实际对象无关', 'Animal a = new Dog(); a.speak()'],
  ['方法重载', '同一类中方法名相同而参数列表不同', '仅修改返回值类型即可形成重载', 'print(int) 与 print(String)'],
  ['方法重写', '子类提供与父类可覆盖实例方法兼容的新实现', 'static 方法会发生运行时动态绑定', '@Override public String toString()'],
  ['抽象类', '可包含状态、构造器、抽象方法和具体方法', '不能包含任何已经实现的方法', 'abstract class Shape'],
  ['接口', '定义能力契约；类可实现多个接口', '接口可以被 new 直接实例化', 'class FileStore implements Store'],
  ['default 方法', '接口可提供带实现的实例方法以演进 API', 'default 表示该方法只能在包内访问', 'default void log() { ... }'],
  ['访问修饰符 protected', '同包可访问，且不同包的子类可按继承规则访问', '只允许当前类内部访问', '供子类扩展使用的 protected 方法'],
  ['static 字段', '属于类本身，通常由该类的所有实例共享', '每创建一个实例都会复制一份独立值', 'private static int count'],
  ['final 变量', '只能赋值一次；引用不可改指向但对象自身未必不可变', '被引用对象的所有字段都会自动冻结', 'final List<String> names = new ArrayList<>()'],
  ['Object 类', '除 Object 自身外，所有 Java 类最终都继承 Object', '只有显式写 extends Object 的类才继承它', '可重写 toString、equals 与 hashCode'],
  ['equals 与 hashCode', '相等对象必须具有相同 hashCode', 'hashCode 相同即可断定两个对象相等', '作为 HashMap 键时应同时正确重写'],
  ['instanceof 模式匹配', '检查类型并可在成功分支直接绑定已转换变量', '会无条件强制转换，类型不符时编译失败', 'if (obj instanceof String s)'],
  ['内部类', '非静态内部类实例隐式关联一个外部类实例', '不依赖外部类实例且不能访问其成员', 'outer.new Inner()'],
  ['枚举 enum', '表示一组受限实例，可拥有字段、构造器和方法', '只是 int 常量的语法别名，不能有行为', 'enum Level { LOW, HIGH }'],
  ['受检异常', '除 RuntimeException 外的 Exception 子类通常需捕获或声明', '编译器从不检查其处理情况', 'IOException'],
  ['运行时异常', 'RuntimeException 及其子类通常表示编程错误，不强制捕获', '必须在每一层都写 throws 才能编译', 'NullPointerException'],
  ['try-with-resources', '自动关闭实现 AutoCloseable 的资源，关闭顺序与声明顺序相反', '只能管理数据库连接，不能管理文件流', 'try (var in = Files.newInputStream(path))'],
  ['finally', '通常无论是否异常都会执行，适合必要清理但不应覆盖返回或异常', '仅当 try 无异常时执行', '在 finally 中释放非自动管理的资源'],
  ['泛型', '在编译期提供类型约束并减少显式强制转换', '在运行期为每种类型参数生成完全独立的类', 'List<String>'],
  ['类型擦除', '多数泛型类型参数信息在编译后被擦除', '运行时可可靠使用 T.class 获取任意类型参数', 'List<String> 与 List<Integer> 运行时类相同'],
  ['List', '有序集合，允许重复元素并可按索引访问', '元素永不重复且没有顺序', 'ArrayList 与 LinkedList'],
  ['ArrayList', '基于动态数组，随机访问快，中间插入可能移动元素', '基于双向链表，按索引访问必须逐个遍历', '频繁 get 的列表'],
  ['LinkedList', '基于双向链表，也实现 Deque；随机索引访问较慢', '底层是连续数组，扩容时复制全部元素', 'addFirst 与 removeLast'],
  ['Set', '集合语义上不保留重复元素', '始终按插入顺序排序且允许重复', 'HashSet'],
  ['HashSet', '基于哈希结构，不保证迭代顺序', '按元素自然顺序自动排序', '用于快速判重'],
  ['Map', '保存键到值的映射，键不能重复', '每个键可以同时映射多个独立值而无需容器', 'Map<String, Integer>'],
  ['HashMap', '允许一个 null 键和多个 null 值，非线程安全且不保证顺序', '天然线程安全并按键排序', '按用户 ID 查找对象'],
  ['Iterator', '以统一方式遍历集合，并可通过 iterator.remove 安全删除当前元素', '可在增强 for 中随意调用集合 remove 而不受影响', 'while (it.hasNext()) it.next()'],
  ['Comparable', '由类定义自身的自然顺序，实现 compareTo', '专门用于定义多个外部排序策略', 'class User implements Comparable<User>'],
  ['Comparator', '在类外定义可组合的比较策略', '要求修改被比较类并实现 compareTo', 'Comparator.comparing(User::age)'],
  ['lambda 表达式', '为函数式接口提供简洁实现，可捕获 effectively final 局部变量', '可以随意修改捕获的局部变量', 'items.removeIf(x -> x.isBlank())'],
  ['Stream', '声明式数据处理流水线，终止操作触发计算且通常不修改源', '等同于可反复消费并保存元素的集合', 'list.stream().filter(...).toList()'],
  ['Optional', '表达可能缺失的返回值，避免用 null 隐式表示缺失', '适合替代所有字段、参数和集合元素', 'repository.findById(id)'],
  ['LocalDate', '不可变、线程安全，只表示日期而不含时区和时刻', '包含时区、小时和分钟', 'LocalDate.of(2026, 10, 19)'],
  ['Math.random', '返回 [0.0, 1.0) 范围的 double', '可能返回 1.0 且包含负数', 'int n = (int)(Math.random()*10)'],
  ['File 与 Path', 'Path 是现代 NIO 路径抽象；File 是较早的文件路径 API', '创建 File 或 Path 对象会立即创建磁盘文件', 'Files.exists(path)'],
  ['字节流', 'InputStream/OutputStream 处理原始字节，适合二进制数据', '自动按字符编码解码文本', '读取图片内容'],
  ['字符流', 'Reader/Writer 处理字符，文本转换需要明确字符集', '最适合原样复制任意二进制文件', 'Files.newBufferedReader(path, UTF_8)'],
  ['JDBC PreparedStatement', '使用参数占位符绑定值，有助于防止 SQL 注入并复用执行计划', '通过字符串拼接用户输入生成 SQL 最安全', 'SELECT * FROM user WHERE id = ?'],
];

const design: Fact[] = [
  ['单一职责原则 SRP', '一个模块应只有一个引起它变化的主要原因', '一个类只能拥有一个方法', '把报表计算与邮件发送拆分'],
  ['里氏替换原则 LSP', '子类型应能替换父类型且不破坏程序正确性', '子类必须复制父类全部代码', '重写方法不强化前置条件'],
  ['接口隔离原则 ISP', '客户端不应被迫依赖它不需要的方法', '所有能力都应放进一个大型接口', '按使用方拆分细粒度接口'],
  ['依赖倒置原则 DIP', '高层策略和底层细节都依赖抽象', '高层模块必须直接 new 具体数据库实现', '构造器注入 Repository 接口'],
  ['简单工厂', '由集中工厂根据参数创建不同具体产品', '确保全局只有一个实例', 'ParserFactory.create(type)'],
  ['工厂方法', '把对象创建延迟到实现工厂接口的子类或具体工厂', '通过复制现有对象创建新对象', '不同平台工厂创建各自按钮'],
  ['单例模式', '控制一个类只有一个实例并提供访问点', '保证对象在分布式系统中全局唯一', '枚举单例'],
  ['外观模式', '为复杂子系统提供统一的高层入口', '动态替换对象算法', '一个 checkout 方法协调库存、支付与物流'],
  ['代理模式', '代理对象控制对真实对象的访问', '把一组对象组织为树结构', '远程代理或权限代理'],
  ['观察者模式', '主题状态变化时通知已订阅的观察者', '请求沿处理链逐个传递', '事件发布与监听'],
];

const jvm: Fact[] = [
  ['堆', '线程共享，主要存放对象实例和数组，也是垃圾回收重点区域', '每个线程私有并存放栈帧', 'new 创建的普通对象通常位于堆中'],
  ['Java 虚拟机栈', '线程私有，每次方法调用创建包含局部变量等信息的栈帧', '线程共享并主要存放所有对象', '深度递归可能导致 StackOverflowError'],
  ['元空间', '使用本地内存保存类元数据，取代早期永久代', '只用于保存普通对象实例', '加载大量动态类可能消耗元空间'],
  ['类加载双亲委派', '类加载器通常先委托父加载器，避免核心类被重复或恶意替换', '任何类都先由自定义加载器直接定义', '应用类加载器委托平台或启动类加载器'],
];

const structures: Fact[] = [
  ['大 O 记号', '描述输入规模增长时算法时间或空间的渐近上界', '精确表示程序在某台机器上的运行毫秒数', '二分查找为 O(log n)'],
  ['栈', '后进先出 LIFO，常见操作为 push、pop、peek', '先进先出 FIFO', '函数调用栈'],
  ['队列', '先进先出 FIFO，通常从队尾入队、队头出队', '后进先出 LIFO', '任务排队处理'],
  ['单向链表', '节点保存数据和指向下一节点的引用', '可用 O(1) 时间按任意索引访问', '头部插入可为 O(1)'],
  ['双向链表', '节点同时保存前驱和后继引用，便于双向移动', '每个节点只有一个 next 引用', '已知节点时可更方便删除'],
  ['循环队列', '用固定数组和首尾索引循环复用空间', '出队后剩余元素必须全部向前搬移', '环形缓冲区'],
];

const clean: Fact[] = [
  ['有意义的命名', '名称应表达意图、可搜索，并避免误导', '变量名越短越专业，应优先使用 a、b、c', 'elapsedTimeInDays'],
  ['小函数', '函数应聚焦一个抽象层次并做好一件事', '函数越长越能减少调用开销，因此更清晰', '把校验、计算和持久化拆为清晰步骤'],
  ['避免重复 DRY', '相同知识应有单一、权威的表达位置', '任何两行相似代码都必须立即抽象', '集中业务规则，避免多处各自维护'],
  ['德墨忒尔法则', '对象应尽量只与直接协作者交互，减少链式依赖', '对象应了解整个系统内部结构', 'order.customer().address().city() 暴露过深导航'],
];

const categories = [
  { name: 'Java', facts: java, count: 240 },
  { name: '设计模式', facts: design, count: 18 },
  { name: 'JVM', facts: jvm, count: 12 },
  { name: '数据结构', facts: structures, count: 18 },
  { name: '代码整洁', facts: clean, count: 12 },
];

function rotate<T>(items: T[], amount: number) {
  const n = amount % items.length;
  return [...items.slice(n), ...items.slice(0, n)];
}

function buildQuestion(facts: Fact[], factIndex: number, variant: number, id: number, category: string): QuizQuestion {
  const fact = facts[factIndex];
  const distractors = [1, 2, 3].map((step) => facts[(factIndex + step * 7) % facts.length]);
  const difficulty = (variant === 0 ? '基础' : variant === 1 ? '进阶' : '挑战') as QuizQuestion['difficulty'];
  let stem = '';
  let correctText = '';
  let wrongTexts: string[] = [];
  let correctExplanation = '';
  let wrongExplanations: string[] = [];

  if (variant === 0) {
    stem = `关于「${fact[0]}」，下列说法正确的是？`;
    correctText = fact[1];
    wrongTexts = [fact[2], distractors[0][1], distractors[1][1]];
    correctExplanation = `正确。${fact[0]}：${fact[1]}。`;
    wrongExplanations = [
      `错误。这是关于 ${fact[0]} 的常见误解；准确说法是：${fact[1]}。`,
      `错误。这描述的是「${distractors[0][0]}」，不是「${fact[0]}」。`,
      `错误。这描述的是「${distractors[1][0]}」，与题干概念不符。`,
    ];
  } else if (variant === 1) {
    stem = `哪一个概念最符合这段描述？\n“${fact[1]}”`;
    correctText = fact[0];
    wrongTexts = distractors.map((item) => item[0]);
    correctExplanation = `正确，这正是「${fact[0]}」的定义。典型用法：${fact[3]}。`;
    wrongExplanations = distractors.map((item) => `错误。「${item[0]}」指的是：${item[1]}。`);
  } else if (variant === 2) {
    stem = `下列哪个场景最能体现「${fact[0]}」？`;
    correctText = fact[3];
    wrongTexts = distractors.map((item) => item[3]);
    correctExplanation = `正确。该场景直接体现了 ${fact[0]}：${fact[1]}。`;
    wrongExplanations = distractors.map((item) => `错误。这个场景主要体现「${item[0]}」，其含义是：${item[1]}。`);
  } else {
    stem = `复习「${fact[0]}」时，哪一项属于需要排除的错误认识？`;
    correctText = fact[2];
    wrongTexts = [fact[1], fact[3], `应结合其定义理解：${fact[1]}`];
    correctExplanation = `正确，这句话是错误认识。应改为：${fact[1]}。`;
    wrongExplanations = [
      `不选。这是「${fact[0]}」的准确描述。`,
      `不选。这是「${fact[0]}」的合理示例。`,
      `不选。这句话方向正确，没有违背概念定义。`,
    ];
  }

  const raw = [
    { text: correctText, explanation: correctExplanation, correct: true },
    ...wrongTexts.map((text, index) => ({ text, explanation: wrongExplanations[index], correct: false })),
  ];
  const options = rotate(raw, (id * 7 + factIndex) % 4);
  return {
    id,
    category,
    topic: fact[0],
    difficulty,
    stem,
    options: options.map(({ text, explanation }) => ({ text, explanation })),
    answer: options.findIndex((option) => option.correct),
    takeaway: `${fact[0]}：${fact[1]}。记忆锚点：${fact[3]}。`,
  };
}

export const questions: QuizQuestion[] = [];
let nextId = 1;
for (const category of categories) {
  for (let i = 0; i < category.count; i += 1) {
    questions.push(buildQuestion(category.facts, i % category.facts.length, Math.floor(i / category.facts.length) % 4, nextId, category.name));
    nextId += 1;
  }
}

export const categoryCounts = categories.map(({ name, count }) => ({ name, count }));
