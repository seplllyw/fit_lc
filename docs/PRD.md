# FitLC 产品需求文档（正式版）

> **注意：** 本文档为正式版 PRD，记录已实现的功能。全部需求（包括未实现的）请参见 [PRD-planning.md](./PRD-planning.md)。

**版本：** 1.5
**日期：** 2026-05-05
**状态：** 已上线

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户角色与权限](#2-用户角色与权限)
3. [核心功能模块](#3-核心功能模块)
   - 3.1 [AI对话记录](#31-ai对话记录)
   - 3.2 [训练动作库](#32-训练动作库)
   - 3.3 [肌肉库](#33-肌肉库)
   - 3.4 [历史记录管理](#34-历史记录管理)
   - 3.5 [数据趋势分析](#35-数据趋势分析)
   - 3.6 [健身计划](#36-健身计划)
   - 3.7 [日历页面](#37-日历页面)
4. [AI增强功能](#4-ai增强功能)
5. [激励与成就系统](#5-激励与成就系统)
6. [技术架构](#6-技术架构)
7. [数据库设计](#7-数据库设计)
8. [API接口设计](#8-api接口设计)
9. [前端页面清单](#9-前端页面清单)
10. [非功能性需求](#10-非功能性需求)

---

## 1. 产品概述

### 1.1 产品定位
FitLC 是一款 AI 健身记录 SaaS 系统，通过自然语言对话自动记录健身数据和身体围度，支持历史数据查询与趋势分析。

### 1.2 核心价值
- **零门槛记录**：用户无需手动填写表单，直接用自然语言描述训练内容
- **智能解析**：AI 自动解析训练动作、组数、次数、重量等参数
- **数据洞察**：自动汇总训练统计和围度变化趋势

### 1.3 目标用户
| 用户类型 | 描述 |
|---------|------|
| 个人健身爱好者 | 希望快速记录训练、追踪围度变化的普通用户 |
| 健身教练 | 管理客户训练数据（未来扩展） |
| 系统管理员 | 维护动作库、肌肉库等基础数据 |

### 1.4 技术栈
| 层级 | 技术选型 |
|------|---------|
| 前端 | React 18 + Vite + TailwindCSS + Zustand + Axios + React Router v6 |
| 后端 | Node.js + Express.js + Prisma ORM |
| 数据库 | MySQL 8.0 |
| AI | LangChain.js + MiniMax Chat 模型 (Abab6/M2.7) |
| 认证 | JWT (JSON Web Token) |

---

## 2. 用户角色与权限

### 2.1 角色定义
| 角色 | 说明 | 权限范围 |
|------|------|---------|
| normal | 普通用户 | 使用AI对话、记录训练/围度、查看历史和趋势 |
| admin | 管理员 | 普通用户权限 + 动作库/肌肉库CRUD、AI增强操作 |

### 2.2 权限矩阵
| 功能 | normal | admin |
|------|--------|-------|
| AI对话记录训练 | ✓ | ✓ |
| AI对话记录围度 | ✓ | ✓ |
| 查看训练历史 | ✓ | ✓ |
| 查看围度历史 | ✓ | ✓ |
| 查看趋势图 | ✓ | ✓ |
| 动作库管理 | - | ✓ |
| 肌肉库管理 | - | ✓ |
| AI增强（批量生成） | - | ✓ |

### 2.3 新用户默认角色
新用户注册时自动分配 `normal` 角色。管理员角色需通过数据库手动分配。

---

## 3. 核心功能模块

### 3.1 AI对话记录

#### 3.1.1 功能描述
用户通过自然语言与AI对话，系统自动识别用户意图（记录训练/记录围度/查询数据）并执行相应操作。

#### 3.1.2 触发场景

**记录训练 (save_workout)**
```
触发示例：
- "今天跑了5公里"
- "深蹲100kg 5组每组8个"
- "练了30分钟hiit"
- "做了100个俯卧撑分5组"
```

**记录围度 (save_measurement)**
```
触发示例：
- "今天胸围94，腰围78"
- "测了一下臂围34"
- "腰又粗了，现在是80"
```

**查询训练 (query_workout)**
```
触发示例：
- "这周跑了多少次？"
- "上个月深蹲总重量多少？"
- "我的训练频率怎么样？"
- "对比一下这周和上周"
```

**查询围度 (query_measurement)**
```
触发示例：
- "我的围度有什么变化？"
- "胸围对比三个月前？"
- "最近腰有没有变细？"
```

#### 3.1.3 数据解析
| 参数 | 说明 |
|------|------|
| date | 训练/测量日期，格式 YYYY-MM-DD |
| exercises | 训练动作数组 [{name, sets, reps, weight, duration, distance}] |
| measurements | 围度数组 [{body_part, value}] |

#### 3.1.4 支持的身体部位
`chest`(胸) | `waist`(腰) | `hips`(臀) | `biceps`(臂) | `thighs`(腿) | `calves`(小腿)

#### 3.1.5 消息历史加载
页面加载时自动获取最近20条对话记录，支持翻页查看历史消息。

#### 3.1.6 AI回复Markdown渲染
AI回复内容支持Markdown格式渲染，包括：
- 代码块、加粗、斜体
- 链接、引用、列表
- 表格（GFM扩展）

#### 3.1.7 撤销功能
保存成功后，用户可通过"撤销"按钮撤回最近一次操作（软删除）。

#### 3.1.8 交互设计
- 消息列表展示用户消息和AI回复
- 保存成功时显示"已保存"标识和撤销按钮
- AI回复包含操作结果摘要

---

### 3.2 训练动作库

#### 3.2.1 功能描述
结构化的训练动作数据库，支持按肌肉群、器械、难度筛选动作详情查看。

#### 3.2.2 动作属性
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(200) | 动作名称 |
| category | ENUM | 肌肉群：chest/back/legs/shoulders/arms/core |
| equipment | ENUM | 器械：barbell/dumbbell/cable/machine/bodyweight/other |
| difficulty | ENUM | 难度：beginner/intermediate/advanced |
| description | TEXT | 动作说明（Markdown） |
| adjustmentNotes | TEXT | 细节调整（Markdown） |
| videoUrl | VARCHAR(500) | 视频教程链接 |
| steps | TEXT | 动作步骤说明 |
| safetyNotes | TEXT | 安全注意事项 |
| commonMistakes | TEXT | 常见错误 |
| exerciseType | STRING | compound(复合动作)/isolation(孤立动作) |
| variantType | ENUM | equipment/difficulty/posture（该动作自身的变体类型） |
| conversionGuide | JSON | 变体转换指南 |
| tags | JSON | 标签数组 |
| status | ENUM | draft(待审核)/published(已发布) |

#### 3.2.3 动作-肌肉关联
| 字段 | 类型 | 说明 |
|------|------|------|
| exerciseId | INT | 动作ID |
| muscleId | INT | 肌肉ID（关联level 2主肌肉） |
| role | ENUM | primary(主要)/secondary(辅助) |

#### 3.2.4 动作转换指南
通过 `conversionGuide` JSON 字段记录动作变体说明，包含以下信息：
- **变体**：该动作的常见变体形式
- **替代动作**：功能相似的其他动作
- **降级选项**：适合初学者的简化版本

用户可在动作详情页查看这些转换指南信息。
**状态：✅ 已实现（2026-04-28）**

#### 3.2.5 审核流程
1. AI或管理员创建动作 → status: `draft`
2. 管理员审核确认 → status: `published`
3. 已发布的动作才能被普通用户查询使用

#### 3.2.6 数据规模
预计 500+ 动作，覆盖 6 大肌肉群、多种器械和难度级别。

---

### 3.3 肌肉库

#### 3.3.1 功能描述
两层层级结构的肌肉数据库：肌肉群（Level 1）→ 主肌肉（Level 2）

#### 3.3.2 肌肉层级结构
```
胸部 (chest)
├── 胸大肌
├── 胸小肌
└── 前锯肌

背部 (back)
├── 背阔肌
├── 中下斜方肌
├── 大圆肌
├── 小圆肌
└── 竖脊肌

腿部 (legs)
├── 股四头肌
├── 腘绳肌
├── 臀大肌
└── 小腿肌群

肩部 (shoulders)
├── 三角肌
└── 肩袖肌群

手臂 (arms)
├── 肱二头肌
├── 肱三头肌
└── 前臂肌群

核心 (core)
├── 腹直肌
├── 腹斜肌
├── 腹横肌
└── 下背肌群
```

#### 3.3.3 肌肉属性
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 肌肉名称 |
| group | ENUM | 肌肉群：chest/back/legs/shoulders/arms/core |
| parentId | INT | 父级肌肉ID，null=肌肉群本身 |
| sortOrder | INT | 排序序号 |
| origin | TEXT | 肌肉起点 |
| insertion | TEXT | 肌肉止点 |
| function | TEXT | 肌肉功能 |
| trainingTips | TEXT | 训练技巧 |

#### 3.3.4 数据统计
| 类型 | 数量 |
|------|------|
| 肌肉群 (Level 1) | 6 |
| 主肌肉 (Level 2) | ~20 |
| 总计 | ~26 |

---

### 3.4 历史记录管理

#### 3.4.1 训练记录 (workouts)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| userId | INT | 用户ID |
| date | DATE | 训练日期 |
| createdAt | DATETIME | 创建时间 |
| deletedAt | DATETIME | 软删除时间（NULL=未删除） |

#### 3.4.2 训练动作 (workout_exercises)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| workoutId | INT | 关联训练记录ID |
| exerciseName | VARCHAR(100) | 动作名称 |
| sets | INT | 组数 |
| reps | INT | 次数 |
| weight | DECIMAL(10,2) | 重量(kg) |
| duration | INT | 时长(分钟) |
| distance | DECIMAL(10,2) | 距离(公里) |
| createdAt | DATETIME | 创建时间 |

#### 3.4.3 围度记录 (body_measurements)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| userId | INT | 用户ID |
| date | DATE | 测量日期 |
| createdAt | DATETIME | 创建时间 |
| deletedAt | DATETIME | 软删除时间（NULL=未删除） |

#### 3.4.4 围度项目 (measurement_items)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| measurementId | INT | 关联围度记录ID |
| bodyPart | ENUM | 部位：chest/waist/hips/biceps/thighs/calves/other |
| value | DECIMAL(10,2) | 数值(cm) |
| createdAt | DATETIME | 创建时间 |

#### 3.4.5 软删除
所有记录支持软删除（设置 `deletedAt` 时间戳），已删除记录不参与统计计算。

---

### 3.5 数据趋势分析

#### 3.5.1 围度趋势图
- 折线图展示多个身体部位的围度变化
- 支持部位：胸围、腰围、臀围、臂围、腿围、小腿围
- 时间范围：最近30天/90天/6个月/1年/全部

#### 3.5.2 训练统计
- 柱状图展示每周训练次数
- 按动作类型分类统计

---

### 3.6 健身计划

#### 3.6.1 功能描述
用户可通过AI生成个性化训练计划，支持对话调整、可视化编辑、执行追踪和进度分析。

**与动作库/肌肉库的集成：**
- 计划动作关联 `exercises.id`，获取完整动作详情（步骤、安全提示、肌肉关联）
- 训练日直接关联目标肌肉群，便于AI理解和用户查看
- 器械选项可视化多选：杠铃、哑铃、绳索、器械、自重、壶铃、弹力带，带图标和颜色区分

**表单预填：** 计划表单自动填充用户画像数据（身高、体重、训练经验）

#### 3.6.2 核心流程

**生成计划**
```
用户描述需求 → AI识别GENERATE_PLAN
→ 根据器械/难度从 exercises 筛选动作
→ 按肌肉群恢复周期分配训练日
→ 返回结构化计划（含 exerciseId）
→ 存入数据库
```

**对话调整**
```
用户提出调整 → AI识别ADJUST_PLAN → 解析意图 → 更新 plan_exercises
```

**执行打卡**
```
进入打卡页 → JOIN exercises 获取动作详情 → 完成打卡
→ 存入 plan_executions
→ AI 分析肌肉恢复状态给出建议
```

#### 3.6.3 肌肉群分配原则
| 肌肉类型 | 最优恢复时间 | 训练频率 |
|---------|-------------|---------|
| 大肌群（胸、背、腿） | 48-72小时 | 每周1-2次 |
| 小肌群（肩、臂、腹） | 24-48小时 | 每周2-3次 |

#### 3.6.4 计划状态
| 状态 | 说明 |
|------|------|
| draft | 草稿（未激活） |
| active | 进行中 |
| completed | 已完成 |
| paused | 已暂停 |

#### 3.6.4 AI Tools
| Tool | 功能 |
|------|------|
| generate_plan | 根据用户信息生成健身计划 |
| adjust_plan | 调整现有计划内容 |
| analyze_execution | 分析执行数据给出建议 |

#### 3.6.5 详情说明
详见 [健身计划详情页](PRD-details/06-workout-plan.md)

---

### 3.7 日历页面

#### 3.7.1 功能描述
用户通过日历页面查看每月训练和围度记录，通过小圆点标识有记录的日期，点击日期展开查看详情。

#### 3.7.2 入口
- 用户在"我的"页面点击"连续打卡"卡片进入日历页面
- 日历页面使用独立布局（无底部 Tab，有顶部返回导航）

#### 3.7.3 页面结构
- 月份切换：左右箭头切换上一月/下一月，支持"今天"快速跳转
- 日期网格：6×7 布局，有记录的日期显示橙色小圆点
- 当天高亮：当天日期有橙色边框
- 详情展开：点击日期后下方展开显示训练/围度记录

---

## 4. AI增强功能

### 4.1 动作详情AI生成

#### 4.1.1 功能描述
管理员可通过AI自动生成动作的详细描述信息。

#### 4.1.2 生成字段
| 字段 | 说明 |
|------|------|
| steps | 动作步骤说明（4-6步） |
| safetyNotes | 安全注意事项（2-3条） |
| commonMistakes | 常见错误（2-3条） |
| adjustmentNotes | 调整说明 |
| exerciseType | compound/isolation |
| suggestedMuscles | 建议关联肌肉列表 |

#### 4.1.3 肌肉关联关系类型
| 关系 | 说明 |
|------|------|
| agonist | 主发力的肌肉 |
| synergist | 协同发力的肌肉 |
| antagonist | 拮抗肌 |
| stabilizer | 稳定肌 |

### 4.2 肌肉详情AI生成

#### 4.2.1 生成字段
| 字段 | 说明 |
|------|------|
| origin | 肌肉起点 |
| insertion | 肌肉止点 |
| function | 肌肉功能 |
| trainingTips | 训练技巧 |

### 4.3 批量生成脚本
支持断点续传的批量生成工具，输出JSON文件供管理员审核后导入数据库。

---

## 5. 激励与成就系统

### 5.1 个人最佳记录 (PR)

#### 5.1.1 功能描述
自动记录用户在各项动作上的个人最佳成绩，包括重量、次数、时长、距离等维度。

#### 5.1.2 记录类型
| 类型 | 说明 |
|------|------|
| weight | 最大重量 (kg) |
| reps | 最大次数 |
| duration | 最长时长 (分钟) |
| distance | 最长距离 (km) |

#### 5.1.3 PR检测
训练保存时自动检测是否突破个人最佳，触发时通知用户。

### 5.2 徽章系统

#### 5.2.1 徽章定义
| 字段 | 说明 |
|------|------|
| code | 唯一标识符 |
| name | 徽章名称 |
| description | 徽章描述 |
| category | 类别：workout/measurement/streak/milestone |
| conditionType | 条件类型：count/streak/pr/first |
| conditionValue | 条件值 (JSON) |
| tier | 等级：bronze/silver/gold/platinum |
| points | 积分奖励 |

#### 5.2.2 徽章类别
- **workout**: 训练相关徽章（首次训练、训练次数等）
- **measurement**: 围度相关徽章（首次测量等）
- **streak**: 连续打卡徽章
- **milestone**: 里程碑成就

### 5.3 里程碑系统

#### 5.3.1 里程碑定义
| 字段 | 说明 |
|------|------|
| code | 唯一标识符 |
| name | 里程碑名称 |
| category | 类别：strength/volume/consistency/measurement |
| metricType | 统计类型 |
| threshold | 阈值 |
| tier | 星级 (1-5) |

#### 5.3.2 进度追踪
自动追踪用户在各里程碑上的进度，完成时通知用户。

### 5.4 累计统计数据

#### 5.4.1 统计类型
| 类型 | 周期 | 说明 |
|------|------|------|
| weekly_workouts | weekly | 本周训练次数 |
| monthly_workouts | monthly | 本月训练次数 |
| total_workouts | all | 累计训练次数 |
| total_volume | all | 累计训练量 |
| weekly_volume | weekly | 本周训练量 |
| streak_days | all | 连续打卡天数 |

### 5.5 触发系统

#### 5.5.1 触发频率控制
同一行为每天最多触发1次，通过 `trigger_events` 表实现去重。

#### 5.5.2 触发类型
- workout_complete: 训练完成
- measurement_complete: 围度记录完成
- streak_broken: 连续打卡中断
- reminder: 定时提醒

### 5.6 首次庆祝动画

#### 5.6.1 功能描述
用户在 Chat 页面保存首次训练记录后，自动显示庆祝动画，持续3秒后消失。

#### 5.6.2 触发条件
`totalWorkouts === 1` 时触发，`FirstTimeCelebration` 组件从 `show=true` 变为显示。

#### 5.6.3 展示内容
- 🎉 emoji 跳动动画
- "恭喜完成首次训练！" 标题
- "坚持记录，你就是最棒的！" 副标题

### 5.7 行为锚点

#### 5.7.1 锚点时机
| 时机 | 形式 | 说明 |
|------|------|------|
| 训练刚结束 | AI确认消息 | 保存成功后显示关键数据摘要 |
| Dashboard空状态 | 引导卡片 | 首次进入时显示记录引导 |
| 次日（待实现） | Web Push | 依赖 F-009 推送服务 |

#### 5.7.2 空状态引导
当用户无训练记录时，Dashboard 显示引导卡片：
- "开始记录你的第一次训练"
- 示例: "今天深蹲 80kg 做了 5 组"
- CTA 按钮跳转 Chat

---

## 6. 技术架构

### 5.1 系统架构图
```
┌─────────────────────────────────────────────────────┐
│               React + Vite 前端                      │
│            (用户对话界面 + 数据展示)                   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / REST API
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Node.js 后端                         │
│  ┌─────────────────────────────────────────────┐    │
│  │          LangChain Agent                    │    │
│  │   - tools: save_workout, query_history...   │    │
│  │   - memory: conversation history            │    │
│  └─────────────────────────────────────────────┘    │
│                      │                               │
│                      ▼                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │SaveService │  │QueryService│  │AuthService │    │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘    │
└────────┼───────────────┼────────────────────────────┘
         │               │
         ▼               ▼
    ┌─────────────────────────┐
    │         MySQL           │
    │  users / workouts /     │
    │  workout_exercises /    │
    │  body_measurements /   │
    │  measurement_items /     │
    │  muscles / exercises /   │
    │  roles                  │
    └─────────────────────────┘
```

### 5.2 后端分层架构
```
Router → Service → Repository
```

| 层级 | 职责 |
|------|------|
| Router | HTTP路由、参数校验、权限校验 |
| Service | 业务逻辑、事务管理 |
| Repository | 数据库访问、ORM操作 |

### 5.3 LangChain Agent Tools
| Tool | 功能 |
|------|------|
| save_workout | 记录训练数据 |
| save_measurement | 记录身体围度 |
| query_workout | 查询训练历史 |
| query_measurement | 查询围度历史 |
| query_exercise | 查询动作库 |
| generate_plan | AI生成健身计划 |
| adjust_plan | 调整现有计划 |
| analyze_execution | 分析计划执行情况 |

---

## 7. 数据库设计

### 6.1 ER关系图
```
users 1 ───< user_roles >──── 1 roles
  │
  │
  └──< workouts >──< workout_exercises >── exercises >──< exercise_muscles >── muscles
  │
  └──< body_measurements >──< measurement_items >
  │
  └──< workout_plans >──< plan_exercises >── exercises
  │                   │
  │                   └──< plan_executions >── plan_exercises
  │
  └──< personal_records >── workouts
  └──< badges >──< user_badges >
  └──< aggregated_stats >
  └──< trigger_events >
  └──< trend_predictions >
  └──< milestones >──< user_milestones >
```

### 6.2 表结构汇总
| 表名 | 说明 | 关键字段 |
|------|------|---------|
| users | 用户表 | id, email, password_hash |
| roles | 角色表 | id, name |
| user_roles | 用户角色关联 | userId, roleId |
| workouts | 训练记录 | id, userId, date, deletedAt |
| workout_exercises | 训练动作 | workoutId, name, sets, reps, weight, duration, distance |
| body_measurements | 围度记录 | id, userId, date, deletedAt |
| measurement_items | 围度项目 | measurementId, bodyPart, value |
| muscles | 肌肉层级 | id, name, group, parentId |
| exercises | 动作库 | id, name, category, equipment, difficulty, status, conversionGuide |
| personal_records | 个人最佳记录 | id, userId, exerciseName, recordType, bestValue, achievedAt |
| badges | 徽章定义 | id, code, name, description, category, conditionType, conditionValue |
| user_badges | 用户徽章记录 | id, userId, badgeId, achievedAt |
| aggregated_stats | 累计统计数据 | id, userId, statType, period, value |
| trigger_events | 触发事件日志 | id, userId, triggerType, triggerKey |
| trend_predictions | 趋势预测模型 | id, userId, metricType, slope, intercept, rSquared |
| milestones | 里程碑定义 | id, code, name, metricType, threshold |
| user_milestones | 用户里程碑记录 | id, userId, milestoneId, progress, achievedAt |
| chat_messages | 对话历史 | id, userId, role, content, savedData, createdAt |

#### 6.2.1 肌肉群训练量统计

通过 `workout_exercises` 与 `exercises` / `exercise_muscles` 关联，聚合计算各肌肉群训练量：

```sql
SELECT m.group, SUM(we.weight * we.sets * we.reps) as volume
FROM workout_exercises we
JOIN exercises e ON we.name = e.name
JOIN exercise_muscles em ON e.id = em.exerciseId
JOIN muscles m ON em.muscleId = m.id
WHERE w.userId = ? AND w.date BETWEEN ? AND ?
GROUP BY m.group
```

返回格式：
```json
{
  "muscleGroups": [
    { "name": "胸部", "group": "chest", "volume": 12500, "percentage": 35 }
  ]
}
```

### 6.3 索引设计
| 表 | 索引字段 |
|------|---------|
| users | email (UNIQUE) |
| workouts | userId, date, deletedAt |
| body_measurements | userId, date, deletedAt |
| exercises | category, equipment, difficulty, status |
| exercise_muscles | muscleId, (exerciseId, muscleId, role) UNIQUE |
| workout_plans | userId, status |
| plan_exercises | planId, dayOfWeek |
| plan_executions | planId, scheduledDate, status |

---

## 8. API接口设计

### 7.1 认证模块 `/api/auth`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /register | 用户注册 | 否 |
| POST | /login | 用户登录 | 否 |
| GET | /me | 获取当前用户 | 是 |

### 7.2 对话模块 `/api/chat`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /messages | 获取最近聊天记录 | 是 |
| POST | /message | 发送AI消息 | 是 |

### 7.3 记录模块 `/api/records`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /workouts | 获取训练记录 | 是 |
| GET | /measurements | 获取围度记录 | 是 |
| DELETE | /workout/:id | 软删除训练 | 是 |
| DELETE | /measurement/:id | 软删除围度 | 是 |
| POST | /workout/:id/restore | 恢复训练 | 是 |
| POST | /measurement/:id/restore | 恢复围度 | 是 |

### 7.4 动作库模块 `/api/exercises`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | / | 获取动作列表 | 是 |
| GET | /:id | 获取动作详情 | 是 |

### 7.5 管理模块 `/api/admin`
| 方法 | 路径 | 说明 | 认证 | 权限 |
|------|------|------|------|------|
| GET | /exercises | 动作列表 | 是 | admin |
| POST | /exercises | 创建动作 | 是 | admin |
| PUT | /exercises/:id | 更新动作 | 是 | admin |
| DELETE | /exercises/:id | 删除动作 | 是 | admin |
| PATCH | /exercises/:id/publish | 发布动作 | 是 | admin |
| POST | /exercises/generate | AI生成动作详情 | 是 | admin |
| GET | /muscles | 肌肉列表 | 是 | admin |
| POST | /muscles | 创建肌肉 | 是 | admin |
| PUT | /muscles/:id | 更新肌肉 | 是 | admin |
| DELETE | /muscles/:id | 删除肌肉 | 是 | admin |
| POST | /muscles/generate | AI生成肌肉详情 | 是 | admin |

### 7.6 健身计划模块 `/api/plans`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /generate | AI生成计划 | 是 |
| GET | / | 获取用户所有计划 | 是 |
| GET | /:id | 获取计划详情 | 是 |
| PUT | /:id | 更新计划 | 是 |
| DELETE | /:id | 删除计划 | 是 |
| POST | /:id/activate | 激活计划 | 是 |

### 7.7 计划动作 `/api/plans/:id/exercises`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | / | 获取计划动作 | 是 |
| POST | / | 添加动作 | 是 |
| PUT | /:exerciseId | 更新动作 | 是 |
| DELETE | /:exerciseId | 移除动作 | 是 |

### 7.8 执行记录 `/api/plans/:id/executions`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | / | 获取执行记录 | 是 |
| POST | / | 记录执行 | 是 |
| POST | /batch | 批量打卡 | 是 |
| GET | /analysis | 执行分析 | 是 |

### 7.9 成就系统 `/api/achievements`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /personal-records | 获取个人最佳记录 | 是 |
| GET | /personal-records/top | 获取最佳PR列表 | 是 |
| GET | /badges | 获取用户徽章 | 是 |
| GET | /milestones | 获取里程碑进度 | 是 |
| GET | /stats | 获取累计统计数据 | 是 |
| GET | /muscle-volume | 获取肌肉群训练量统计 | 是 |
| POST | /check | 触发成就检查 | 是 |

### 7.10 触发系统 `/api/triggers`
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /eligible/:type | 获取可触发提醒 | 是 |
| POST | /record | 记录触发事件 | 是 |
| GET | /should-trigger | 检查是否应触发 | 是 |
| GET | /history | 获取触发历史 | 是 |
| DELETE | /:id | 删除触发事件 | 是 |

---

## 9. 前端页面清单

### 8.1 页面列表
| 路径 | 页面名称 | 说明 | 权限 |
|------|---------|------|------|
| /login | 登录页 | 用户登录 | 公开 |
| /register | 注册页 | 用户注册 | 公开 |
| /onboarding | 引导页 | 首次注册后填写身高/体重/体脂/训练目标 | 公开 |
| /chat | AI对话页 | 核心功能，训练/围度记录（首页Tab） | 登录用户 |
| /history | 历史记录 | 训练和围度历史（数据Tab） | 登录用户 |
| /trends | 趋势分析 | 围度趋势图和训练统计 | 登录用户 |
| /profile | 个人中心 | 用户信息、设置入口、连续打卡入口（我的Tab） | 登录用户 |
| /exercises | 动作库 | 动作列表和筛选（知识Tab） | 登录用户 |
| /muscles | 肌肉库 | 肌肉层级树 | 登录用户 |
| /plans | 健身计划 | AI生成训练计划（计划Tab） | 登录用户 |
| /calendar | 日历 | 查看每月训练/围度记录，点击展开详情 | 登录用户 |
| /badges | 徽章展示 | 用户徽章和成就 | 登录用户 |
| /settings | 设置 | 个人信息、身体数据设置 | 登录用户 |
| /security | 账号安全 | 修改密码、退出登录 | 登录用户 |
| /admin/exercises | 动作库维护 | 动作CRUD和AI增强 | admin |
| /admin/muscles | 肌肉库维护 | 肌肉CRUD和AI增强 | admin |

### 8.2 底部导航栏

用户端底部 Tab 导航（5个Tab）：
| Tab | 图标 | 路径 |
|-----|------|------|
| 首页 | 🏠 | /chat |
| 数据 | 📊 | /history |
| 计划 | 📋 | /plans |
| 知识 | 📚 | /muscles |
| 我的 | 👤 | /profile |

**特殊页面（无底部导航）：**
- /settings、/security、/badges、/calendar - 使用独立布局，有顶部返回导航

### 8.2 UI风格规范

#### 配色方案
| 类型 | 色值 | 用途 |
|------|------|------|
| 背景主色 | #0A0A0A | 深黑 |
| 背景次色 | #1A1A1A | 深灰卡片 |
| 背景三级 | #252525 | 稍浅灰 |
| 强调色主 | #FF4500 | 烈焰橙 |
| 强调色次 | #DC143C | 电红 |
| 文字主色 | #FFFFFF | 白色 |
| 文字次色 | #888888 | 灰色 |
| 边框色 | #333333 | 默认边框 |

#### 视觉风格
- 无圆角或极小圆角 (2-4px)
- 粗边框按钮 (2px solid)
- 几何线条装饰
- 卡片光晕效果
- 深色渐变背景

#### 动效
- 快速过渡 (150-200ms)
- 强调色hover闪烁效果

---

## 10. 非功能性需求

### 9.1 性能
- API响应时间 < 500ms（不含AI调用）
- 前端首屏加载 < 2s
- 支持100+并发用户

### 9.2 安全
- 密码bcrypt加密存储
- JWT token 7天过期
- 后端API必须权限校验
- SQL注入防护（Prisma ORM）

### 9.3 可用性
- 前端错误提示友好
- 网络错误自动重试（可选）
- 401自动跳转登录页

### 9.4 数据完整性
- 外键约束确保关联有效
- 软删除保留历史数据
- 事务保证数据一致性

---

## 附录

### A. 文档索引
| 文档 | 路径 |
|------|------|
| 系统设计 | `docs/superpowers/specs/2026-04-23-fit-lc-design.md` |
| 前端设计 | `docs/superpowers/specs/2026-04-23-fit-lc-frontend-design.md` |
| 健身计划设计 | `docs/superpowers/specs/2026-04-23-fit-lc-workout-plan-design.md` |
| 健身计划实施计划 | `docs/superpowers/plans/2026-04-23-fit-lc-workout-plan-implementation.md` |
| 动作库设计 | `docs/superpowers/specs/2026-04-24-exercise-library-design.md` |
| 动作库批量生成设计 | `docs/superpowers/specs/2026-04-25-exercise-library-generation-design.md` |
| 动作详情设计 | `docs/superpowers/specs/2026-04-25-exercise-detail-design.md` |
| 肌肉详情设计 | `docs/superpowers/specs/2026-04-25-muscle-detail-design.md` |
| RBAC设计 | `docs/superpowers/specs/2026-04-25-rbac-admin-design.md` |
| AI增强设计 | `docs/superpowers/specs/2026-04-25-exercise-ai-design.md` |
| PRD健身计划详情 | `docs/PRD-details/06-workout-plan.md` |

---

**文档版本历史**
| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-04-25 | 初始版本，整合所有模块需求 |
| 1.1 | 2026-04-28 | 更新技术栈、动作属性、AI增强功能 |
| 1.2 | 2026-04-28 | 添加成就系统数据表和API（personal_records, badges, milestones等） |
| 1.3 | 2026-04-29 | 添加前端展示层：PR卡片、徽章页面、肌肉群统计、首次庆祝动画、行为锚点设计 |
| 1.4 | 2026-04-29 | 添加聊天历史加载API、Markdown渲染支持 |
