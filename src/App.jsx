import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaUser, FaRobot, FaPlay, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './index.css';
import taffyFixed from './taffy_compressed.jpg';
import taffyBg1 from './塔菲/塔菲1.jpg';
import taffyBg2 from './塔菲/塔菲2.jpg';
import taffyBg3 from './塔菲/塔菲3.jpg';
import taffyBg4 from './塔菲/塔菲4.jpg';
import taffyEvil from './塔菲/塔菲淫笑.jpg';
import taffyLaugh from './塔菲/塔菲狂笑动图.gif';

const backgrounds = [taffyBg1, taffyBg2, taffyBg3, taffyBg4];

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

const App = () => {
  const [currentStep, setCurrentStep] = useState('setup');
  const [selectedJob, setSelectedJob] = useState('');
  const [customJob, setCustomJob] = useState('');
  const [useCustomJob, setUseCustomJob] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(taffyBg1);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewStats, setInterviewStats] = useState(null);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showTaffyBubble, setShowTaffyBubble] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showScrollWarning, setShowScrollWarning] = useState(false);
  const [interviewMode, setInterviewMode] = useState('behavioral');
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  
  const [candidateIdentity, setCandidateIdentity] = useState('');
  const [interviewDifficulty, setInterviewDifficulty] = useState('');
  const [skillAreas, setSkillAreas] = useState([]);
  const [showSuggestionBox, setShowSuggestionBox] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowScrollWarning(currentScrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const interviewTips = [
    "保持自信和积极的态度，眼神接触很重要喵~",
    "回答问题时要具体，使用STAR法则（情况-任务-行动-结果）喵~",
    "准备一些与职位相关的具体例子和成就喵~",
    "不要害怕表达你的想法和观点喵~",
    "倾听面试官的问题，如有不清楚的地方可以请求澄清喵~",
    "展示你的学习能力和适应能力喵~",
    "保持微笑，展现你的热情和兴趣喵~",
    "准备一些关于公司和行业的问题喵~",
    "注意语言表达的专业性和准确性喵~",
    "强调你的团队合作精神喵~"
  ];

  const TaffySuggestionBox = useMemo(() => {
    if (!showSuggestionBox) return null;
    
    const MemoizedSuggestionBox = () => {
      const [isExpanded, setIsExpanded] = useState(false);
      const prevTipRef = useRef(currentTip);
      
      useEffect(() => {
        prevTipRef.current = currentTip;
      }, [currentTip]);
      
      return (
        <motion.div
          key={`suggestion-${currentTip}`}
          className={`taffy-suggestion-box ${isExpanded ? 'expanded' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 999,
            cursor: 'pointer'
          }}
        >
          <div className="suggestion-header">
            <img src={taffyFixed} alt="塔菲" className="taffy-icon" />
            <h4>塔菲小建议</h4>
            <button 
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowSuggestionBox(false);
              }}
              title="关闭"
            >
              ✕
            </button>
          </div>
          <motion.div 
            className="suggestion-content"
            layout
          >
            {isExpanded ? (
              <div>
                <p style={{ marginBottom: '15px' }}>{interviewTips[currentTip]}</p>
                <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                  点击切换查看其他建议
                </p>
              </div>
            ) : (
              <p>{interviewTips[currentTip].length > 60 ? interviewTips[currentTip].substring(0, 60) + '...' : interviewTips[currentTip]}</p>
            )}
          </motion.div>
          <motion.div 
            className="suggestion-nav"
            layout
          >
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentTip(prev => (prev - 1 + interviewTips.length) % interviewTips.length);
              }}
              whileTap={{ scale: 0.95 }}
            >
              上一条
            </motion.button>
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentTip(prev => (prev + 1) % interviewTips.length);
              }}
              whileTap={{ scale: 0.95 }}
            >
              下一条
            </motion.button>
          </motion.div>
        </motion.div>
      );
    };
    
    return MemoizedSuggestionBox;
  }, [showSuggestionBox]);

  const SummaryPopup = () => {
    return (
      <AnimatePresence>
        {showSummaryPopup && (
          <motion.div
            className="summary-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              style={{
                background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 50%, #ffd1dc 100%)',
                borderRadius: '25px',
                padding: '40px',
                textAlign: 'center',
                maxWidth: '420px',
                boxShadow: '0 15px 50px rgba(255, 182, 193, 0.6)',
                border: '4px solid #ffb6c1',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '15px' }}>
                <img 
                  src={taffyFixed} 
                  alt="塔菲" 
                  style={{ width: '70px', height: '70px', borderRadius: '15px' }}
                />
              </div>
              
              <h2 style={{ 
                color: '#ff69b4', 
                marginBottom: '20px', 
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                面试完成啦喵~
              </h2>
              
              <p style={{ 
                color: '#ff1493', 
                marginBottom: '15px', 
                lineHeight: '1.8',
                fontSize: '16px'
              }}>
                恭喜你完成了全部 {questionCount} 道面试题目喵！<br />
                你表现得非常认真和努力呢~
              </p>
              
              <p style={{ 
                color: '#ff69b4', 
                marginBottom: '25px', 
                lineHeight: '1.8',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                不管结果如何，敢于挑战自己就是最棒的！<br />
                蒸棒，taffy看好你哦！
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src={taffyLaugh} 
                  alt="塔菲狂笑" 
                  style={{ 
                    width: '120px', 
                    borderRadius: '15px',
                    boxShadow: '0 5px 20px rgba(255, 105, 180, 0.3)'
                  }}
                />
              </div>
              
              <motion.button
                onClick={() => {
                  setShowSummaryPopup(false);
                  setCurrentStep('results');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 35px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#fff',
                  fontWeight: 'bold',
                  boxShadow: '0 5px 20px rgba(255, 154, 158, 0.5)'
                }}
              >
                查看详细结果
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const taffyBgImages = [taffyBg1, taffyBg2, taffyBg3];
  const [bgImageIndex] = useState(() => Math.floor(Math.random() * taffyBgImages.length));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'AI' && !lastMessage.isTypingComplete && !lastMessage.typingStarted) {
      const updatedMessage = { ...lastMessage, typingStarted: true };
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = updatedMessage;
        return newMessages;
      });
      
      let currentIndex = 0;
      const text = lastMessage.text;
      const lines = text.split('\n');
      let currentLineIndex = 0;
      let currentLineText = '';
      const messageKey = Date.now();
      
      const typeChar = () => {
        if (currentLineIndex < lines.length) {
          const currentLine = lines[currentLineIndex];
          if (currentIndex < currentLine.length) {
            currentLineText += currentLine[currentIndex];
            currentIndex++;
            setMessages(prev => {
              const newMessages = [...prev];
              const msgIndex = newMessages.findIndex(m => m.timestamp === lastMessage.timestamp);
              if (msgIndex !== -1) {
                newMessages[msgIndex] = { ...newMessages[msgIndex], displayText: currentLineText };
              }
              return newMessages;
            });
            setTimeout(typeChar, 60);
          } else {
            currentLineIndex++;
            currentIndex = 0;
            if (currentLineIndex < lines.length) {
              currentLineText += '\n';
              setTimeout(typeChar, 50);
            }
          }
        } else {
          setMessages(prev => {
            const newMessages = [...prev];
            const msgIndex = newMessages.findIndex(m => m.timestamp === lastMessage.timestamp);
            if (msgIndex !== -1) {
              newMessages[msgIndex] = { ...newMessages[msgIndex], displayText: text, isTypingComplete: true };
            }
            return newMessages;
          });
        }
      };
       
       setMessages(prev => {
         const newMessages = [...prev];
         const msgIndex = newMessages.findIndex(m => m.timestamp === lastMessage.timestamp);
         if (msgIndex !== -1) {
           newMessages[msgIndex] = { ...newMessages[msgIndex], displayText: '', isTypingComplete: false };
         }
         return newMessages;
       });
       
       setTimeout(typeChar, 50);
    }
  }, [messages.length]);

  useEffect(() => {
    let interval = null;
    if (isInterviewActive && interviewStartTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - interviewStartTime) / 1000);
        setInterviewDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewActive, interviewStartTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    if (!selectedJob && !customJob) return;
    
    setIsLoading(true);
    setCurrentStep('interview');
    setCurrentQuestion(0);
    setMessages([]);
    setInterviewStartTime(Date.now());
    setIsInterviewActive(true);
    setCurrentBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    
    try {
      const firstQuestion = await generateQuestion(1, null);
      if (firstQuestion) {
        setMessages([{
          sender: 'AI',
          text: firstQuestion,
          timestamp: new Date()
        }]);
        setCurrentQuestion(1);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestion = async (questionNumber = null, userAnswerText = null, previousAnswers = {}) => {
    const job = useCustomJob ? customJob : selectedJob;
    const qNum = questionNumber || currentQuestion;
    
    const identityMap = {
      'fresh': '应届生',
      'junior': '1-3年经验',
      'senior': '3-5年经验',
      'expert': '5年以上'
    };
    
    const difficultyMap = {
      'easy': { level: '简单', focus: '基础概念和潜力', temp: 0.5 },
      'medium': { level: '中等', focus: '综合能力和经验', temp: 0.7 },
      'hard': { level: '困难', focus: '深度专业能力和挑战', temp: 0.9 }
    };
    
    const skillLabels = {
      'communication': '沟通能力',
      'teamwork': '团队协作',
      'problem_solving': '问题解决',
      'leadership': '领导力',
      'learning': '学习能力',
      'creativity': '创新能力'
    };
    
    const identityText = candidateIdentity ? `${identityMap[candidateIdentity]}身份` : '';
    const difficultyText = interviewDifficulty ? `难度为${difficultyMap[interviewDifficulty].level}` : '';
    const skillsText = skillAreas.length > 0 ? `重点考察${skillAreas.map(id => skillLabels[id]).join('、')}` : '';
    
    const contextInfo = [identityText, difficultyText, skillsText].filter(Boolean).join('，');
    
    const getOpeningPrompt = () => `你是一位专业、亲和的AI面试官，正在进行一场真实的${job}岗位面试。

面试背景信息：
- 候选人身份：${identityText || '应届生/社招'}
- 面试难度：${difficultyText || '中等'}
- 重点考察：${skillsText || '综合能力'}

【面试开场白规则】
请用温暖专业的语气开始面试，简要介绍自己和面试流程。
要求：
- 2-3句话
- 表达对候选人的欢迎
- 告知面试将采用STAR法则（情境-任务-行动-结果）
- 结尾加"喵~"

记住：你是面试官，不是候选人。不要回答问题，只负责提问和引导。`;

    const getSituationPrompt = () => `你是正在主持${job}岗位面试的专业面试官。

候选人背景：${contextInfo}
这是面试的第1个问题，关于STAR法则的S（情境/Situation）。

【真实面试规则】
1. 基于候选人的背景，提出一个具体的、真实的职场情境问题
2. 问题应该能引出候选人真实的工作/实习/项目经历
3. 不要假设任何具体经历，让候选人自己选择例子
4. 问题要有针对性，符合该岗位的能力要求

【好的情境问题特征】
- 有明确的背景（时间、地点、团队规模等）
- 能体现岗位相关的核心能力
- 有一定的挑战性或代表性

【追问机制】
如果候选人回答过于笼统（如"我学到了很多"），你需要追问具体细节。
但这是第1轮，先提出一个好的情境问题。

【格式要求】
- 一句话问完
- 不要列表或编号
- 不要用"请描述..."
- 直接问出具体情境
- 结尾加"喵~"

开始提问：`;

    const getTaskPrompt = (prevAnswer) => `你是${job}岗位的面试官。

候选人背景：${contextInfo}
面试阶段：Task（任务）问题

【面试上下文】
候选人的情境回答是：${prevAnswer || '（候选人刚回答情境问题）'}

【任务问题规则】
1. 从情境中提取关键要素：候选人做了什么、涉及哪些人
2. 基于这个情境，明确候选人在该情境下的具体目标或责任
3. 问题要聚焦于"你要达成什么"、"你的职责是什么"
4. 适当追问情境中的具体任务细节
5. 如果候选人没有说清楚团队规模/个人角色，可以追问

【好的任务问题特征】
- 与情境紧密相关
- 明确候选人的个人责任
- 能区分个人贡献和团队成果

【追问原则】
- 不要重复候选人的话
- 不要总结候选人回答
- 直接问出关于任务的具体问题
- 结尾加"喵~"

开始提问：`;

    const getActionPrompt = (situationAnswer, taskAnswer) => `你是${job}岗位的面试官。

候选人背景：${contextInfo}
面试阶段：Action（行动）问题

【面试上下文】
情境问题回答：${situationAnswer || '（无）'}
任务问题回答：${taskAnswer}

【行动问题规则】
1. 基于情境和任务，明确候选人个人采取的具体行动
2. 关注候选人的决策过程、思维方式、关键技能
3. 追问"具体怎么做的"、"为什么选择这种方法"
4. 区分候选人和团队其他成员的贡献
5. 如果候选人说的是"我们"，追问"你个人做了什么"

【追问技巧】
- 候选人提到技术方案 → 问为什么选择这个方案
- 候选人提到沟通协调 → 问具体和谁沟通、怎么说
- 候选人提到解决问题 → 问遇到的最大的困难是什么

【格式要求】
- 一句话问完
- 不要列表或编号
- 直接问出关于行动的具体问题
- 结尾加"喵~"

开始提问：`;

    const getResultPrompt = (situationAnswer, taskAnswer, actionAnswer) => `你是${job}岗位的面试官。

候选人背景：${contextInfo}
面试阶段：Result（结果）问题

【面试上下文】
情境问题回答：${situationAnswer || '（无）'}
任务问题回答：${taskAnswer || '（无）'}
行动问题回答：${actionAnswer}

【结果问题规则】
1. 确认候选人行动的可量化成果
2. 关注候选人对团队的价值贡献
3. 询问候选人的反思和成长
4. 如果成果不够明确，追问"有什么数据证明"、"领导/同事有什么反馈"
5. 如果成果不够理想，追问"如果重来你会怎么做"

【结果验证原则】
- 候选人说的数字要能追溯到具体来源
- 候选人的自我评价要能通过具体事例验证
- 不要接受模糊的成就描述（如"效果很好"）

【好的结果问题】
- "最终这个项目的转化率提升了多少？"
- "你在这件事中最大的成长是什么？"
- "如果让你重来，你会做出什么改变？"

【格式要求】
- 一句话问完
- 不要列表或编号
- 直接问出关于结果的具体问题
- 结尾加"喵~"

开始提问：`;

    const getFollowUpPrompt = (prevAnswer, history) => `你是${job}岗位的专业面试官。

【面试上下文】
候选人刚才的回答：${prevAnswer}
候选人之前的回答：
- 情境：${history.situation || '（未回答）'}
- 任务：${history.task || '（未回答）'}
- 行动：${history.action || '（未回答）'}

【回答审视规则】
1. 首先审视候选人刚才的回答是否：
   - 过于笼统、缺乏具体细节？
   - 与之前的回答有矛盾？
   - 回避了你追问的核心问题？
   - 完全不相关或敷衍？

2. 如果回答不合格：
   - 明确指出问题所在
   - 用温和但直接的方式要求补充

【追问要求】
- 不要重复面试官之前的问题
- 不要用"能否详细说说"这类模糊追问
- 直接指出具体需要补充的内容
- 如果连续两次追问后仍不达标，可以标记为该维度薄弱

【输出格式】
- 先简短评价候选人的回答（1-2句话）
- 然后提出具体的追问
- 结尾加"喵~"

开始追问：`;

    const getFinalPrompt = (qNum) => `你是${job}岗位的面试官。

候选人背景：${contextInfo}
面试进程：第${qNum}道问题

【面试上下文】
这是面试的最后一轮，请基于候选人之前所有回答进行综合评价。

【综合评价要求】
1. 回顾候选人在之前各轮STAR回答中的表现
2. 指出候选人的2-3个亮点
3. 指出候选人的1-2个需要改进的地方
4. 用温暖鼓励的语气结束面试
5. 告诉候选人面试大概流程已经完成

【格式要求】
- 不要列表或编号
- 3-5句话
- 结尾加"喵~"

开始评价：`;

    let systemPrompt;
    let userContent;
    
    if (userAnswerText === null) {
      systemPrompt = getOpeningPrompt();
      userContent = '请开始面试开场白';
    } else if (userAnswerText === 'situation') {
      systemPrompt = getSituationPrompt();
      userContent = '请提出情境问题';
    } else if (userAnswerText === 'task') {
      systemPrompt = getTaskPrompt(previousAnswers.situation);
      userContent = '请提出任务问题';
    } else if (userAnswerText === 'action') {
      systemPrompt = getActionPrompt(previousAnswers.situation, previousAnswers.task);
      userContent = '请提出行动问题';
    } else if (userAnswerText === 'result') {
      systemPrompt = getResultPrompt(previousAnswers.situation, previousAnswers.task, previousAnswers.action);
      userContent = '请提出结果问题';
    } else if (userAnswerText === 'final') {
      systemPrompt = getFinalPrompt(qNum);
      userContent = '请进行综合评价';
    } else {
      const history = {
        situation: previousAnswers.situation || '',
        task: previousAnswers.task || '',
        action: previousAnswers.action || '',
        result: previousAnswers.result || ''
      };
      systemPrompt = getFollowUpPrompt(userAnswerText, history);
      userContent = '请追问';
    }

    const temperature = difficultyMap[interviewDifficulty]?.temp || 0.7;

    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          max_tokens: 200,
          temperature: temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      if (error.response) {
        console.error('API Response Error:', error.response.data);
      }
      throw error;
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    const newMessages = [...messages, {
      sender: 'User',
      text: userAnswer,
      timestamp: new Date()
    }];
    setMessages(newMessages);
    
    setIsLoading(true);
    const tempUserAnswer = userAnswer;
    setUserAnswer('');
    
    try {
      const currentQ = Math.floor(currentQuestion / 5) + 1;
      const phase = currentQuestion % 5;
      
      const previousAnswers = {
        situation: newMessages.find(m => m.phase === 'situation')?.text || '',
        task: newMessages.find(m => m.phase === 'task')?.text || '',
        action: newMessages.find(m => m.phase === 'action')?.text || '',
        result: newMessages.find(m => m.phase === 'result')?.text || ''
      };
      
      let nextPhase;
      let phaseLabel;
      
      if (phase === 0) {
        nextPhase = 'task';
        phaseLabel = 'task';
      } else if (phase === 1) {
        nextPhase = 'action';
        phaseLabel = 'action';
      } else if (phase === 2) {
        nextPhase = 'result';
        phaseLabel = 'result';
      } else if (phase === 3) {
        if (currentQ >= questionCount) {
          const finalQuestion = await generateQuestion(currentQ, 'final', previousAnswers);
          setMessages([...newMessages, {
            sender: 'AI',
            text: finalQuestion,
            timestamp: new Date(),
            phase: 'final'
          }]);
          setCurrentQuestion(currentQuestion + 1);
          setIsLoading(false);
          return;
        } else {
          nextPhase = 'situation';
          phaseLabel = 'situation';
        }
      } else {
        nextPhase = 'situation';
        phaseLabel = 'situation';
      }
      
      const nextQuestion = await generateQuestion(currentQ + 1, nextPhase, previousAnswers);
      
      setMessages([...newMessages, {
        sender: 'AI',
        text: nextQuestion,
        timestamp: new Date(),
        phase: phaseLabel
      }]);
      
      setCurrentQuestion(currentQuestion + 1);
    } catch (error) {
      console.error('Error in submitAnswer:', error);
      setMessages([...newMessages, {
        sender: 'AI',
        text: '抱歉，我遇到了一点问题。请稍后再试，或者重新开始面试。',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setShowSummaryPopup(true);
    
    const answeredCount = Math.floor(messages.filter(m => m.sender === 'User').length / 4) * 4;
    const completeRounds = Math.floor(messages.filter(m => m.sender === 'User').length / 4);
    
    setInterviewStats({
      totalQuestions: questionCount * 4,
      answeredQuestions: messages.filter(m => m.sender === 'User').length,
      completedRounds: completeRounds,
      duration: interviewDuration,
      score: Math.min(completeRounds * 25, 100)
    });
  };

  const resetInterview = () => {
    setCurrentStep('setup');
    setMessages([]);
    setCurrentQuestion(0);
    setIsInterviewActive(false);
    setUserAnswer('');
    setInterviewStats(null);
    setInterviewStartTime(null);
    setInterviewDuration(0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setUseCustomJob(false);
  };

  const handleTaffyClick = () => {
    const randomTip = Math.floor(Math.random() * interviewTips.length);
    setCurrentTip(randomTip);
    setShowTaffyBubble(true);
    
    setTimeout(() => {
      setShowTaffyBubble(false);
    }, 3000);
  };

  return (
    <div className="app-container">
      <div 
        className="background-layer"
        style={{
          backgroundImage: currentStep === 'interview' ? `url(${currentBackground})` : 'none'
        }}
      />
      
      {currentStep === 'setup' && (
        <div className="scrollable-content">
          <div className="taffy-container-wrapper">
            <div className="taffy-container" onClick={handleTaffyClick}>
              <img src={taffyFixed} alt="塔菲" className="taffy-image" />
              <AnimatePresence>
                {showTaffyBubble && (
                  <div className="taffy-bubble">
                    <div className="taffy-bubble-content">
                      💡 {interviewTips[currentTip]}
                      <div className="taffy-bubble-arrow" />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="main-content-panel">
            <div className="header">
              <h1>小塔菲AI模拟面试官 🌸</h1>
              <p>AI陪你练习面试，提升你的求职成功率喵~</p>
            </div>
            
            <div className="setup-section">
              <div className="section-title">📋 请选择目标职位</div>
              <div className="job-cards-container">
                {[
                  { id: 'frontend', title: '前端开发', desc: 'HTML/CSS/JS/Vue/React' },
                  { id: 'backend', title: '后端开发', desc: 'Java/Python/Node.js' },
                  { id: 'product', title: '产品经理', desc: '需求分析/产品设计' },
                  { id: 'design', title: 'UI设计', desc: 'Figma/Sketch/PS' },
                  { id: 'operations', title: '运营', desc: '内容运营/用户运营' },
                  { id: 'data', title: '数据分析', desc: 'SQL/Python/Excel' }
                ].map(job => (
                  <div 
                    key={job.id}
                    className={`job-card ${selectedJob === job.id ? 'selected' : ''}`}
                    onClick={() => handleJobSelect(job.id)}
                  >
                    <div className="job-card-content">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-description">{job.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="checkbox-group" style={{ marginTop: '20px' }}>
                <input 
                  type="checkbox" 
                  id="customJob"
                  checked={useCustomJob}
                  onChange={(e) => {
                    setUseCustomJob(e.target.checked);
                    if (e.target.checked) {
                      setSelectedJob('');
                    }
                  }}
                />
                <label htmlFor="customJob">我想输入其他职位</label>
              </div>
              
              {useCustomJob && (
                <input
                  type="text"
                  className="form-control"
                  placeholder="请输入目标职位名称"
                  value={customJob}
                  onChange={(e) => setCustomJob(e.target.value)}
                  style={{ marginTop: '10px' }}
                />
              )}
            </div>
            
            <div className="setup-section">
              <div className="section-title">👤 你的身份</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'fresh', label: '🌱 应届生', desc: '即将毕业或刚毕业' },
                  { id: 'junior', label: '🚀 1-3年', desc: '有工作经验' },
                  { id: 'senior', label: '💼 3-5年', desc: '资深职场人' },
                  { id: 'expert', label: '🏆 5年+', desc: '行业专家' }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    className={`mode-btn ${candidateIdentity === opt.id ? 'active' : ''}`}
                    onClick={() => setCandidateIdentity(opt.id)}
                    style={{ flex: '1', minWidth: '100px' }}
                  >
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="setup-section">
              <div className="section-title">🎯 面试难度</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'easy', label: '🏠 练手模式', desc: '适合新手入门' },
                  { id: 'medium', label: '🏢 正式面试', desc: '标准面试流程' },
                  { id: 'hard', label: '🏰 大厂挑战', desc: '高难度高压' }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    className={`mode-btn ${interviewDifficulty === opt.id ? 'active' : ''}`}
                    onClick={() => setInterviewDifficulty(opt.id)}
                    style={{ flex: '1', minWidth: '100px' }}
                  >
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="setup-section">
              <div className="section-title">⭐ 考察重点（可多选）</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'communication', label: '💬 沟通能力' },
                  { id: 'teamwork', label: '🤝 团队协作' },
                  { id: 'problem_solving', label: '🧩 问题解决' },
                  { id: 'leadership', label: '👑 领导力' },
                  { id: 'learning', label: '📚 学习能力' },
                  { id: 'creativity', label: '💡 创新能力' }
                ].map(skill => (
                  <div 
                    key={skill.id}
                    className={`mode-btn ${skillAreas.includes(skill.id) ? 'active' : ''}`}
                    onClick={() => {
                      if (skillAreas.includes(skill.id)) {
                        setSkillAreas(skillAreas.filter(id => id !== skill.id));
                      } else {
                        setSkillAreas([...skillAreas, skill.id]);
                      }
                    }}
                    style={{ flex: '1', minWidth: '100px' }}
                  >
                    <span>{skill.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="setup-section">
              <div className="section-title">📝 题目数量</div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                style={{ width: '100%', margin: '15px 0' }}
              />
              <div style={{ textAlign: 'center', color: '#ff8ac5', fontWeight: '600' }}>
                {questionCount} 道面试题
              </div>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={startInterview}
              disabled={(!selectedJob && !customJob) || !candidateIdentity || !interviewDifficulty}
              style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fbc2eb 100%)' }}
            >
              <FaPlay /> 开始模拟面试
            </button>
          </div>
        </div>
      )}
      
      {currentStep === 'interview' && (
        <div className="interview-page">
          <img src={currentBackground} alt="背景" className="interview-bg-image" />
          
          <div className="interview-overlay">
            <div className="chat-container interview-chat">
              <div className="chat-header">
                <h2>💬 模拟面试进行中</h2>
                <div>
                  <div>⏱️ {formatTime(interviewDuration)}</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(currentQuestion / (questionCount * 5)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <motion.div 
                    key={index}
                    className="message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`message-avatar ${msg.sender === 'AI' ? 'ai' : 'user'}`}>
                      {msg.sender === 'AI' ? <FaRobot /> : <FaUser />}
                    </div>
                    <div className="message-content">
                      <div className="message-sender">
                        {msg.sender === 'AI' ? '🤖 面试官' : '👤 你'}
                      </div>
                      <div className="message-text">
                        {msg.displayText || msg.text}
                        {msg.sender === 'AI' && !msg.isTypingComplete && <span className="typing-cursor">|</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="loading">
                    <div className="loading-dot" />
                    <div className="loading-dot" />
                    <div className="loading-dot" />
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-input"
                    placeholder="在这里输入你的回答...（按 Enter 发送，Shift+Enter 换行）"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={2}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isLoading}
                    style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}
                  >
                    发送
                  </button>
                </div>
                <button 
                  className="btn btn-secondary"
                  onClick={endInterview}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  结束面试
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 'results' && (
        <div className="scrollable-content">
          <div className="main-content-panel">
            <div className="header">
              <h1>📊 面试结果分析</h1>
              <p>以下是塔菲对你的面试表现评估喵~</p>
            </div>
            
            <div className="stats-container">
              <div className="stats-title">📈 面试统计</div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{interviewStats?.completedRounds || 0}</div>
                  <div className="stat-label">完成轮次</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatTime(interviewStats?.duration || 0)}</div>
                  <div className="stat-label">面试时长</div>
                </div>
                <div className="stat-item">
                  <div 
                    className="score-circle" 
                    style={{ '--score-deg': `${(interviewStats?.score || 0) * 3.6}deg` }}
                  >
                    <span className="score-value">{interviewStats?.score || 0}</span>
                  </div>
                  <div className="stat-label">综合评分</div>
                </div>
              </div>
            </div>
            
            <div className="analysis-container">
              <h3>💡 塔菲的评估</h3>
              
              <div className="analysis-section">
                <h4>✨ 你的优势</h4>
                <ul className="analysis-list">
                  <li className="analysis-item strength">积极参加模拟面试练习，这本身就是一种进步</li>
                  <li className="analysis-item strength">愿意接受AI面试官的考察，说明你有提升自己的决心</li>
                  <li className="analysis-item strength">通过反复练习，你可以逐渐熟悉面试流程和问题类型</li>
                </ul>
              </div>
              
              <div className="analysis-section">
                <h4>📈 提升建议</h4>
                <ul className="analysis-list">
                  <li className="analysis-item suggestion">建议使用STAR法则组织回答（情境-任务-行动-结果）</li>
                  <li className="analysis-item suggestion">多准备一些具体的项目或实习经历作为例子</li>
                  <li className="analysis-item suggestion">练习时注意控制回答时间，太长或太短都不太好</li>
                </ul>
              </div>
              
              <div className="analysis-section overall">
                <h4>🎯 综合评价</h4>
                <p className="overall-assessment">
                  {interviewStats?.score >= 80 
                    ? '你的表现非常出色！对STAR法则运用熟练，回答逻辑清晰。继续保持这份自信，真正的面试对你来说一定没问题的喵~ 🌟'
                    : interviewStats?.score >= 60 
                    ? '你的表现不错，基本掌握了面试的节奏。但在细节描述上还可以更具体一些。建议多练习几次，你会发现自己的进步越来越明显的喵~ 💪'
                    : '面试是一个需要不断练习的过程，你已经迈出了第一步！建议多熟悉STAR法则的准备和表达方式，多练习几次后会越来越好的喵~ 🌱'}
                </p>
              </div>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={resetInterview}
              style={{ width: '100%', marginTop: '25px', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}
            >
              <FaRedo /> 再来一次
            </button>
          </div>
        </div>
      )}
      
      <TaffySuggestionBox />
      <SummaryPopup />
    </div>
  );
};

export default App;
