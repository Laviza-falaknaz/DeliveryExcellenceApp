import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, CheckCircle2, XCircle, Lightbulb, Award } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How much e-waste does a remanufactured laptop prevent from entering landfills?",
    options: ["500g", "1.5kg", "3kg", "5kg"],
    correctAnswer: 2,
    explanation: "A single remanufactured laptop prevents approximately 3kg of e-waste from polluting our environment!",
    points: 10
  },
  {
    id: 2,
    question: "What percentage of a laptop's carbon footprint occurs during manufacturing?",
    options: ["20%", "40%", "60%", "80%"],
    correctAnswer: 3,
    explanation: "Manufacturing accounts for about 80% of a laptop's total carbon footprint. By choosing remanufactured devices, you significantly reduce environmental impact!",
    points: 15
  },
  {
    id: 3,
    question: "How much water is saved by choosing a remanufactured laptop over a new one?",
    options: ["50 litres", "200 litres", "500 litres", "1,200 litres"],
    correctAnswer: 3,
    explanation: "Remanufacturing saves approximately 1,200 litres of water per laptop - enough to provide clean drinking water for a family for a week!",
    points: 10
  },
  {
    id: 4,
    question: "Which rare earth mineral is commonly found in laptops and is non-renewable?",
    options: ["Iron", "Copper", "Tantalum", "Aluminum"],
    correctAnswer: 2,
    explanation: "Tantalum is a rare earth mineral used in laptop capacitors. It's mined from conflict zones and is non-renewable, making reuse critical!",
    points: 20
  },
  {
    id: 5,
    question: "What is the circular economy principle?",
    options: [
      "Buy, use, and dispose",
      "Reduce, reuse, recycle",
      "Design out waste and keep products in use",
      "Minimize production costs"
    ],
    correctAnswer: 2,
    explanation: "The circular economy focuses on designing out waste, keeping products and materials in use, and regenerating natural systems!",
    points: 15
  },
  {
    id: 6,
    question: "How many trees worth of carbon does one remanufactured laptop save?",
    options: ["1 tree", "3 trees", "5 trees", "10 trees"],
    correctAnswer: 1,
    explanation: "Each remanufactured laptop saves the equivalent carbon absorption of 3 trees per year - that's a mini forest with every purchase!",
    points: 10
  },
  {
    id: 7,
    question: "What happens to most electronic waste globally?",
    options: [
      "It's properly recycled",
      "It's remanufactured",
      "It ends up in landfills or is illegally shipped to developing countries",
      "It's converted to energy"
    ],
    correctAnswer: 2,
    explanation: "Sadly, over 80% of e-waste is improperly disposed of, polluting communities and environments. Choosing remanufactured devices helps break this cycle!",
    points: 15
  },
  {
    id: 8,
    question: "How long does it take for electronic waste to decompose in a landfill?",
    options: ["10 years", "50 years", "100 years", "Over 1,000 years"],
    correctAnswer: 3,
    explanation: "Electronic waste can take over 1,000 years to decompose, leaching toxic chemicals into soil and water. Remanufacturing keeps these materials in productive use!",
    points: 20
  }
];

export default function SustainabilityQuiz({ onComplete }: { onComplete?: (score: number, totalPoints: number) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>(new Array(quizQuestions.length).fill(false));
  const [quizComplete, setQuizComplete] = useState(false);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const totalPossiblePoints = quizQuestions.reduce((sum, q) => sum + q.points, 0);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const isCorrect = answerIndex === question.correctAnswer;
    setAnsweredCorrectly(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = isCorrect;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = quizQuestions.reduce((total, q, index) => 
        total + (answeredCorrectly[index] ? q.points : 0), 0
      );
      setQuizComplete(true);
      onComplete?.(finalScore, totalPossiblePoints);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnsweredCorrectly(new Array(quizQuestions.length).fill(false));
    setQuizComplete(false);
  };

  const getScoreMessage = () => {
    const finalScore = quizQuestions.reduce((total, q, index) => 
      total + (answeredCorrectly[index] ? q.points : 0), 0
    );
    const percentage = (finalScore / totalPossiblePoints) * 100;
    
    if (percentage >= 90) return "🌟 Sustainability Expert! You're a champion of the circular economy!";
    if (percentage >= 70) return "🌱 Eco Warrior! Great knowledge of sustainable practices!";
    if (percentage >= 50) return "♻️ Green Learner! You're on the right path to sustainability!";
    return "🌍 Eco Beginner! Keep learning - every step counts!";
  };

  if (quizComplete) {
    const finalScore = quizQuestions.reduce((total, q, index) => 
      total + (answeredCorrectly[index] ? q.points : 0), 0
    );
    const correctCount = answeredCorrectly.filter(Boolean).length;
    const percentage = (finalScore / totalPossiblePoints) * 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center"
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold text-neutral-900">Quiz Complete!</CardTitle>
            <p className="text-lg text-neutral-600 mt-2">{getScoreMessage()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#08ABAB] mb-2">
                {finalScore} / {totalPossiblePoints}
              </div>
              <p className="text-neutral-600">Total Points</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Accuracy</span>
                <span className="font-bold text-neutral-900">{Math.round(percentage)}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">
                  {correctCount}
                </div>
                <p className="text-sm text-neutral-600">Correct</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">
                  {quizQuestions.length - correctCount}
                </div>
                <p className="text-sm text-neutral-600">Incorrect</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Award className="h-8 w-8 text-[#08ABAB] mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">+{finalScore}</div>
                <p className="text-sm text-neutral-600">XP Earned</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleRestart} className="flex-1" variant="outline">
                <i className="ri-refresh-line mr-2"></i>
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1 bg-gradient-to-r from-[#08ABAB] to-emerald-500 hover:from-[#07999] hover:to-emerald-600">
                <Trophy className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="sustainability-quiz">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="bg-[#08ABAB] text-white border-none">
              <Lightbulb className="h-3 w-3 mr-1" />
              Sustainability Quiz
            </Badge>
            <Badge variant="outline" className="bg-orange-500 text-white border-none">
              <Zap className="h-3 w-3 mr-1" />
              {quizQuestions.reduce((total, q, index) => 
                total + (answeredCorrectly[index] ? q.points : 0), 0
              )} XP
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showResult = showExplanation;
                
                let buttonClass = "w-full justify-start text-left h-auto py-4 px-5 transition-all";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += " bg-green-100 border-2 border-green-500 text-green-900 hover:bg-green-100";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += " bg-red-100 border-2 border-red-500 text-red-900 hover:bg-red-100";
                  } else {
                    buttonClass += " opacity-50";
                  }
                } else if (isSelected) {
                  buttonClass += " bg-[#08ABAB]/10 border-2 border-[#08ABAB]";
                }
                
                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    variant="outline"
                    className={buttonClass}
                    disabled={showExplanation}
                    data-testid={`quiz-option-${index}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        showResult && isCorrect ? 'bg-green-500 text-white' :
                        showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        isSelected ? 'bg-[#08ABAB] text-white' :
                        'bg-neutral-200 text-neutral-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  </Button>
                );
              })}
              
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    selectedAnswer === question.correctAnswer
                      ? 'bg-green-50 border-green-300'
                      : 'bg-orange-50 border-orange-300'
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    {selectedAnswer === question.correctAnswer ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-bold ${
                        selectedAnswer === question.correctAnswer ? 'text-green-900' : 'text-orange-900'
                      }`}>
                        {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Not quite!'}
                        {selectedAnswer === question.correctAnswer && ` +${question.points} XP`}
                      </p>
                      <p className="text-sm text-neutral-700 mt-1">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {showExplanation && (
                <Button 
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-[#08ABAB] to-emerald-500 hover:from-[#079999] hover:to-emerald-600"
                  data-testid="quiz-next-button"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
