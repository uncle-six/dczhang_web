import type { QuizQuestion } from './javaQuestions';

type Fact = [term: string, definition: string, trap: string, example: string];

const springBoot: Fact[] = [
  ['IoC 容器', '负责创建、装配和管理 Bean 的生命周期', '要求业务代码手动 new 所有依赖', 'ApplicationContext'],
  ['依赖注入', '由容器把对象所需的依赖提供给它', '对象主动通过全局变量寻找依赖', '构造器注入 Service'],
  ['@Autowired', '按类型从容器中解析依赖并完成注入', '把普通类自动转换成数据库表', '在单构造器组件中可省略'],
  ['Bean 作用域', 'singleton 默认每个容器一个实例，prototype 每次获取创建实例', 'singleton 表示整个分布式系统只有一个实例', '@Scope("prototype")'],
  ['配置属性', '可从 properties 或 YAML 读取外部化配置', '配置值必须硬编码在 Java 源码中', '@ConfigurationProperties'],
  ['AOP', '把日志、事务等横切关注点从业务逻辑中分离', '通过继承复制所有业务代码', '为服务方法统一记录耗时'],
  ['切点 Pointcut', '描述哪些连接点需要应用增强', '表示增强执行后的返回值', 'execution(* com.example.service..*(..))'],
  ['通知 Advice', '定义在匹配连接点前后执行的横切逻辑', '定义数据库表之间的关联', '@Around'],
  ['组件扫描', '发现指定包下带组件注解的类并注册为 Bean', '扫描数据库中的所有记录', '@ComponentScan'],
  ['@Primary', '同类型存在多个 Bean 时标记首选候选者', '保证 Bean 最先完成初始化', '主数据源实现'],
  ['@Qualifier', '按限定名称在多个同类型 Bean 中精确选择', '把 Bean 的作用域改成 prototype', '@Qualifier("smsSender")'],
  ['条件装配', '仅在满足类、属性或 Bean 等条件时注册组件', '运行后随机选择一个 Bean', '@ConditionalOnProperty'],
  ['数据源 DataSource', '提供和管理数据库连接的标准抽象', '表示一条已经执行完成的 SQL', '连接池实现 HikariCP'],
  ['JdbcTemplate', '封装 JDBC 资源管理和常见数据库操作', '完全替代数据库事务和 SQL', 'queryForObject'],
  ['声明式事务', '通过事务拦截器围绕方法统一控制提交与回滚', '要求每个方法手动调用 commit', '@Transactional'],
  ['事务传播 REQUIRED', '加入已有事务，没有事务时创建新事务', '无论如何都暂停当前事务并新建事务', '默认传播行为'],
  ['事务隔离级别', '控制并发事务之间可见的数据变化程度', '控制一个方法是否能被继承', 'READ_COMMITTED'],
  ['异步方法', '把符合条件的方法提交给任务执行器异步执行', '保证方法一定在调用线程内执行', '@EnableAsync 与 @Async'],
];

const springMvc: Fact[] = [
  ['@Controller', '声明 MVC 控制器，通常配合视图解析返回页面', '声明持久层 Mapper 接口', '返回 Thymeleaf 视图名'],
  ['@RestController', '等价于 @Controller 与 @ResponseBody 的组合', '只能接收 GET 请求', '返回 JSON 的 REST 接口'],
  ['@RequestMapping', '在类或方法上建立请求路径、方法等映射', '只用于读取请求体 JSON', '@RequestMapping("/users")'],
  ['@PathVariable', '从 URI 路径模板中提取变量', '读取 HTTP 请求体', '/users/{id}'],
  ['@RequestParam', '读取查询参数或表单参数', '读取路径模板变量', '?page=2'],
  ['@RequestBody', '借助消息转换器把请求体反序列化为对象', '把方法返回值写入响应体', '接收 JSON DTO'],
  ['@ResponseBody', '把返回值经消息转换器写入 HTTP 响应体', '把请求体绑定到参数', '返回 JSON 数据'],
  ['@ModelAttribute', '绑定请求参数到模型对象，也可预先向模型添加属性', '专门用于捕获全局异常', '表单对象绑定'],
  ['@ExceptionHandler', '在控制器或通知类中处理指定异常', '拦截所有静态资源请求', '处理 BusinessException'],
  ['@ControllerAdvice', '集中提供跨控制器的异常处理和绑定逻辑', '为 Service 开启数据库事务', '统一异常响应'],
  ['RESTful 资源设计', '以资源 URI 配合 HTTP 方法表达操作', '把所有动作都设计成 GET 请求', 'DELETE /orders/42'],
  ['DispatcherServlet', 'Spring MVC 前端控制器，协调映射器、适配器和视图解析', '负责创建数据库连接池', '接收并分派 Web 请求'],
  ['Filter', 'Servlet 规范组件，在请求进入 Servlet 前后执行过滤逻辑', '只能拦截 Controller 方法调用', '字符编码或链路追踪过滤'],
  ['Servlet 生命周期', '容器负责初始化、调用 service 并在销毁时回收', '每个 HTTP 请求都必须重新加载 Servlet 类', 'init、service、destroy'],
  ['MVC', '把模型、视图和控制器职责分离', '要求业务逻辑全部写在 Controller', 'Controller 调用 Service 后选择响应'],
];

const springCloud: Fact[] = [
  ['微服务', '围绕业务能力拆分为可独立部署的服务', '必须共享同一个进程和数据库', '订单与库存服务独立部署'],
  ['服务注册与发现', '服务实例注册地址，调用方按服务名发现可用实例', '把所有配置编译进客户端', 'Nacos 服务发现'],
  ['Eureka', 'Spring Cloud 体系中的服务注册与发现组件', '分布式关系数据库', '服务实例发送心跳'],
  ['OpenFeign', '以声明式 HTTP 接口调用远程服务', '消息队列的持久化引擎', '@FeignClient'],
  ['API Gateway', '统一承接外部流量并执行路由、鉴权和限流等', '保存所有业务数据的共享数据库', 'Spring Cloud Gateway'],
  ['配置中心', '集中管理并向不同环境和服务分发配置', '仅保存 Java 源代码', 'Nacos Config'],
  ['Docker 镜像', '应用及其运行依赖组成的不可变分层模板', '正在运行且可变的容器实例本身', 'docker build'],
  ['Maven', '基于 POM 管理依赖与构建生命周期', '只负责运行数据库迁移', 'mvn package'],
];

const mybatis: Fact[] = [
  ['MyBatis 映射', '把 SQL 的参数和结果与 Java 对象建立映射', '自动生成完整领域模型且无需 SQL', 'Mapper XML 或注解'],
  ['#{ } 参数', '使用预编译参数占位，通常可降低 SQL 注入风险', '直接把原始文本拼接进 SQL', 'WHERE id = #{id}'],
  ['${ } 参数', '进行原始字符串替换，使用不当可能引入 SQL 注入', '总会生成 JDBC 问号占位符', '受控的动态列名'],
  ['resultMap', '显式描述结果列与对象属性的复杂映射', '只用于配置数据库连接地址', '嵌套对象映射'],
  ['settings', '配置缓存、驼峰映射等 MyBatis 全局行为', '定义每一条业务 SQL', 'mapUnderscoreToCamelCase'],
  ['typeAliases', '为 Java 类型配置更简短的别名', '给数据库字段批量改名', 'User 代替完整类名'],
  ['动态 SQL', '根据条件安全组合不同 SQL 片段', '要求在 Java 中手工拼接所有字符串', '<if> 与 <where>'],
  ['一级缓存', '默认与 SqlSession 生命周期关联的本地缓存', '跨所有应用实例永久共享', '同一会话重复查询'],
];

const middleware: Fact[] = [
  ['中间件', '位于系统软件与应用之间提供通信、缓存、消息等通用能力', '只指前端 UI 组件库', 'Redis、Kafka、RabbitMQ'],
  ['Redis', '以内存数据结构为核心的键值存储，常用于缓存和分布式协调', '只能存储磁盘文件且不支持过期', '缓存热点数据'],
  ['缓存穿透', '大量查询必然不存在的数据，导致请求绕过缓存访问数据库', '热点键失效瞬间造成并发回源', '缓存空值或布隆过滤器'],
  ['缓存击穿', '单个热点键失效时大量并发同时回源', '大量键在同一时间批量过期', '互斥重建热点缓存'],
  ['缓存雪崩', '大量缓存同时失效或缓存服务不可用导致数据库压力突增', '仅一个不存在的键被反复查询', '过期时间加随机抖动'],
  ['RabbitMQ', '实现 AMQP 的消息中间件，支持交换机与队列路由', '关系型数据库查询引擎', 'direct 或 topic exchange'],
  ['消息幂等', '重复消费同一消息不会产生额外业务副作用', '每条消息必须执行两次', '以业务唯一键去重'],
  ['消息可靠性', '通过确认、持久化、重试和死信等机制降低消息丢失风险', '仅依赖消费者日志即可绝对不丢', 'publisher confirm'],
];

const databaseTheory: Fact[] = [
  ['连接查询', '根据关联条件组合多个表中的行', '只允许读取单个表', 'JOIN orders ON users.id=orders.user_id'],
  ['INNER JOIN', '只返回两侧满足连接条件的记录', '始终保留左表所有记录', '查询有订单的用户'],
  ['LEFT JOIN', '保留左表所有行，右侧不匹配处补 NULL', '只返回两侧匹配行', '查询全部用户及其订单'],
  ['嵌套查询', '在一个 SQL 语句中使用另一个查询的结果', '必须建立两个独立数据库连接', 'WHERE id IN (SELECT ...)'],
  ['集合查询 UNION', '合并两个兼容查询结果并默认去重', '连接同一行的不同列', '合并历史表与当前表'],
  ['UNION ALL', '合并结果且保留重复行，通常少一步去重', '只返回交集记录', '合并无需去重的数据'],
  ['事务原子性', '事务中的操作要么全部成功，要么全部回滚', '事务结果不受并发影响', '转账扣款与入账共同提交'],
  ['事务一致性', '事务使数据从一个有效状态转换到另一个有效状态', '所有事务必须串行执行', '约束在提交后仍成立'],
  ['事务隔离性', '并发事务的中间状态按隔离级别相互隔离', '提交后的数据永不丢失', '防止或限制脏读'],
  ['事务持久性', '事务提交后的结果即使故障也应保留', '事务中的每步都必须并行', 'WAL 与落盘机制'],
  ['索引', '以额外空间和写入成本换取特定查询速度', '索引越多写入越快且没有代价', '为高选择性查询列建索引'],
  ['执行计划', '数据库优化器选择的访问路径和连接方式', 'SQL 语句的运行结果数据', 'EXPLAIN'],
];

const database: Fact[] = [
  ['多表查询', '从两个或更多相关表组合所需数据', '等同于重复执行同一个单表查询', 'JOIN'],
  ['子查询', '把一个查询嵌入另一个 SQL 语句', '只能出现在 SELECT 列表中', 'EXISTS 子查询'],
  ['关联子查询', '子查询引用外层查询列，通常对候选行相关执行', '与外层查询完全无关且只运行一次', 'WHERE EXISTS (...)'],
  ['CREATE TABLE', '定义表名、列、数据类型及约束', '删除已有表结构', 'CREATE TABLE users (...)'],
  ['ALTER TABLE', '修改已有表结构', '只更新表中某一行数据', 'ADD COLUMN'],
  ['DELETE', '按条件删除行，属于 DML 且通常可在事务中回滚', '直接删除表结构', 'DELETE FROM users WHERE id=?'],
  ['DISTINCT', '从结果集中消除重复组合', '对结果进行降序排序', 'SELECT DISTINCT city'],
  ['WHERE', '在分组和聚合前过滤行', '只能过滤聚合后的分组', 'WHERE status = 1'],
  ['LIKE', '通过通配符进行模式匹配', '执行数值范围匹配', "name LIKE '张%'"],
  ['IS NULL', '判断 SQL 空值，不能用等号可靠替代', '等价于 = NULL', 'deleted_at IS NULL'],
  ['BETWEEN', '通常表示包含上下边界的范围条件', '只包含下界不包含上界', 'score BETWEEN 60 AND 100'],
  ['ORDER BY', '按一个或多个表达式对结果排序', '对行进行分组聚合', 'ORDER BY created_at DESC'],
  ['LIMIT', '限制返回行数，常用于分页', '限制表能够保存的总行数', 'LIMIT 20 OFFSET 40'],
  ['COUNT', '统计行数或非 NULL 表达式数量', '计算数值列平均值', 'COUNT(*)'],
  ['GROUP BY', '按指定表达式形成分组供聚合计算', '按指定列排序结果', 'GROUP BY department_id'],
  ['HAVING', '在聚合后过滤分组', '在读取表之前过滤原始行', 'HAVING COUNT(*) > 5'],
];

const kafka: Fact[] = [
  ['Kafka Producer', '向指定主题分区发送消息', '从主题拉取并处理消息', 'send ProducerRecord'],
  ['Kafka Consumer', '订阅主题并从分区读取消息', '只负责创建 Topic', 'poll'],
  ['Topic', '对消息进行逻辑分类的名称空间', '单个消费者进程的别名', 'orders topic'],
  ['Partition', 'Topic 的有序分片，是并行度和顺序性的基本单位', '保证整个集群所有消息绝对全局有序', '同一键路由到同一分区'],
  ['Offset', '消息在某个分区内的位置标识', 'Broker 的网络端口', '提交消费位点'],
  ['Consumer Group', '组内消费者协作分担 Topic 分区', '组内每个消费者都必须收到每条消息', '同组分区互斥分配'],
  ['Broker', '运行 Kafka 服务并存储分区副本的节点', '只存在于消费者客户端中的对象', 'Kafka 集群节点'],
  ['ZooKeeper', '传统 Kafka 架构中用于集群元数据协调，新版本可使用 KRaft', '用于存储业务消息正文的唯一数据库', '旧版控制器选举'],
];

const sql: Fact[] = [
  ['游标', '逐行定位并处理查询结果的数据库对象', '天然比集合操作更快，应优先使用', '存储过程逐行处理'],
  ['聚合查询', '把多行归纳为计数、总和、平均值等结果', '只用于给表添加新列', 'SUM(amount)'],
  ['排序', '使用 ORDER BY 明确结果顺序', '没有 ORDER BY 时仍保证插入顺序', 'ORDER BY score DESC'],
  ['WHERE 子句', '在聚合前按条件筛选原始行', '专门筛选 GROUP BY 后的分组', 'WHERE paid = true'],
  ['CASE 表达式', '在 SQL 中按条件产生不同值', '只能用于控制事务提交', 'CASE WHEN score>=60 THEN 1 ELSE 0 END'],
  ['IF 控制流', '部分数据库过程语言提供的条件分支结构', '标准查询中唯一可用的聚合函数', 'IF ... THEN ... END IF'],
  ['窗口函数', '在保留明细行的同时对相关行集合计算排名或聚合', '必然把多行折叠成一行', 'ROW_NUMBER() OVER (...)'],
  ['CTE', '用 WITH 为复杂查询定义可复用的临时命名结果', '永久创建一张物理表', 'WITH recent_orders AS (...)'],
  ['EXISTS', '判断子查询是否至少返回一行', '返回子查询第一列的总和', 'WHERE EXISTS (...)'],
  ['参数化 SQL', '把 SQL 结构与参数值分离，降低注入风险', '通过拼接用户输入构造语句', 'PreparedStatement'],
  ['索引失效风险', '对索引列使用不合适函数或隐式转换可能妨碍索引利用', '任何 WHERE 条件都必然使用索引', '避免 WHERE YEAR(created_at)=?'],
];

const architecture: Fact[] = [
  ['Session', '在多次 HTTP 请求之间保存特定用户的会话状态', '天然在所有服务实例间自动同步', '登录状态'],
  ['分布式 Session', '把会话状态放到 Redis 等共享存储或采用无状态令牌', '要求所有请求永远固定到单机且无故障', 'Spring Session Redis'],
  ['数据安全', '通过认证、授权、加密、审计等保护机密性与完整性', '只需隐藏前端按钮即可完成授权', '服务端权限校验'],
  ['服务降级', '依赖异常或高负载时返回受控的替代结果以保护系统', '为提升速度永久关闭核心功能', '推荐服务不可用时返回默认列表'],
  ['分布式缓存', '多个应用实例共享的缓存服务', '每个进程独有且互不通信的 HashMap', 'Redis Cluster'],
  ['分布式锁', '在多个进程间协调同一资源的互斥访问', 'Java synchronized 可直接锁住多台机器', '带过期时间和所有权标识的 Redis 锁'],
  ['缓存预热', '上线或流量到来前提前装载热点数据', '删除全部缓存等待自然回源', '发布后批量加载热门商品'],
  ['推栈线程模型', '任务或事件主动驱动后续处理，需要关注背压和线程边界', '所有请求只能同步阻塞执行', '事件驱动流水线'],
  ['PV', '页面浏览次数，同一用户多次访问可重复计数', '去重后的独立访客数量', '文章页面浏览量'],
  ['死锁', '多个线程循环等待彼此持有的资源而无法推进', '单线程正常等待 I/O', '按统一锁顺序避免'],
  ['HTTP 状态码', '用三位数字表达请求处理结果类别', '只在响应正文中出现', '404 表示资源未找到'],
  ['雪崩效应', '下游故障经同步调用链和资源耗尽逐级放大', '单个日志记录失败且无任何影响', '超时、熔断、隔离'],
  ['volatile', '保证变量可见性和一定有序性，但不保证复合操作原子性', '使 count++ 自动成为原子操作', '状态标志位'],
  ['synchronized', '提供互斥和内存可见性，可保护临界区', '可跨多个 JVM 进程自动互斥', '保护共享对象状态'],
  ['微服务拆分原则', '围绕业务边界和独立演进能力拆分，避免过细耦合', '按数据库每张表创建一个服务', '按领域能力划分服务'],
  ['幂等设计', '相同请求重复执行产生与执行一次相同的业务效果', '禁止客户端重试任何请求', '支付回调用业务单号去重'],
  ['REST 谓词', 'GET、POST、PUT、DELETE 等方法表达资源操作语义', '所有接口一律使用 POST 才算 REST', 'PUT /users/42'],
  ['接入层', '承接外部流量，处理路由、认证、限流等边界职责', '集中实现全部核心业务规则', 'API 网关'],
];

const categories = [
  { name: 'Spring Boot', facts: springBoot, count: 39 },
  { name: 'Spring MVC', facts: springMvc, count: 26 },
  { name: 'Spring Cloud', facts: springCloud, count: 13 },
  { name: 'MyBatis', facts: mybatis, count: 13 },
  { name: '中间件', facts: middleware, count: 17 },
  { name: '数据库原理', facts: databaseTheory, count: 22 },
  { name: '数据库', facts: database, count: 17 },
  { name: 'Kafka', facts: kafka, count: 13 },
  { name: 'SQL', facts: sql, count: 22 },
  { name: '架构设计', facts: architecture, count: 18 },
];

function rotate<T>(items: T[], amount: number) {
  const n = amount % items.length;
  return [...items.slice(n), ...items.slice(0, n)];
}

function buildQuestion(facts: Fact[], factIndex: number, variant: number, id: number, category: string): QuizQuestion {
  const fact = facts[factIndex];
  const distractors = [1, 2, 3].map((step) => facts[(factIndex + step) % facts.length]);
  const difficulty = (variant === 0 ? '基础' : variant === 1 ? '进阶' : '挑战') as QuizQuestion['difficulty'];
  let stem: string;
  let correct: [string, string];
  let wrong: [string, string][];

  if (variant % 3 === 0) {
    stem = `在 Java 实践中，关于「${fact[0]}」的说法哪一项正确？`;
    correct = [fact[1], `正确。${fact[0]}：${fact[1]}。`];
    wrong = [
      [fact[2], `错误。这是常见误区；准确说法是：${fact[1]}。`],
      [distractors[0][1], `错误。这描述的是「${distractors[0][0]}」。`],
      [distractors[1][1], `错误。这描述的是「${distractors[1][0]}」。`],
    ];
  } else if (variant % 3 === 1) {
    stem = `以下描述对应哪个实践知识点？\n“${fact[1]}”`;
    correct = [fact[0], `正确，这正是「${fact[0]}」的作用。典型场景：${fact[3]}。`];
    wrong = distractors.map((item) => [item[0], `错误。「${item[0]}」是指：${item[1]}。`]);
  } else {
    stem = `下列哪个场景最适合用来说明「${fact[0]}」？`;
    correct = [fact[3], `正确。这个场景体现了 ${fact[0]}：${fact[1]}。`];
    wrong = distractors.map((item) => [item[3], `错误。这个场景主要体现「${item[0]}」，不是「${fact[0]}」。`]);
  }

  const raw = [
    { text: correct[0], explanation: correct[1], correct: true },
    ...wrong.map(([text, explanation]) => ({ text, explanation, correct: false })),
  ];
  const options = rotate(raw, (id * 3 + factIndex) % 4);
  return {
    id,
    category,
    topic: fact[0],
    difficulty,
    stem,
    options: options.map(({ text, explanation }) => ({ text, explanation })),
    answer: options.findIndex((option) => option.correct),
    takeaway: `${fact[0]}：${fact[1]}。实践锚点：${fact[3]}。`,
  };
}

export const practiceQuestions: QuizQuestion[] = [];
let nextId = 1;
for (const category of categories) {
  for (let i = 0; i < category.count; i += 1) {
    practiceQuestions.push(buildQuestion(category.facts, i % category.facts.length, Math.floor(i / category.facts.length), nextId, category.name));
    nextId += 1;
  }
}

export const practiceCategoryCounts = categories.map(({ name, count }) => ({ name, count }));
