import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, CheckCircle2, XCircle, Recycle, Award, Sparkles } from "lucide-react";

interface GameItem {
  id: number;
  name: string;
  icon: string;
  correctBin: 'ewaste' | 'recyclable' | 'reusable' | 'landfill';
  fact: string;
}

interface Bin {
  id: 'ewaste' | 'recyclable' | 'reusable' | 'landfill';
  name: string;
  icon: string;
  color: string;
  description: string;
}

const gameItems: GameItem[] = [
  { id: 1, name: "Old Laptop Battery", icon: "ri-battery-line", correctBin: "ewaste", fact: "Laptop batteries contain lithium which can be recovered and reused!" },
  { id: 2, name: "Cardboard Box", icon: "ri-inbox-line", correctBin: "recyclable", fact: "Cardboard can be recycled up to 7 times before the fibers break down." },
  { id: 3, name: "Working Charger", icon: "ri-plug-line", correctBin: "reusable", fact: "Reusable chargers prevent e-waste and can serve multiple devices!" },
  { id: 4, name: "Broken Screen", icon: "ri-computer-line", correctBin: "ewaste", fact: "LCD screens contain mercury and must be properly recycled." },
  { id: 5, name: "Bubble Wrap", icon: "ri-stack-line", correctBin: "reusable", fact: "Bubble wrap can be reused many times before recycling!" },
  { id: 6, name: "Styrofoam Packaging", icon: "ri-archive-line", correctBin: "landfill", fact: "Most styrofoam cannot be recycled and takes 500+ years to decompose." },
  { id: 7, name: "Circuit Board", icon: "ri-cpu-line", correctBin: "ewaste", fact: "Circuit boards contain gold, silver, and copper that can be recovered!" },
  { id: 8, name: "Paper Manual", icon: "ri-book-line", correctBin: "recyclable", fact: "Paper recycling saves 17 trees for every ton recycled." },
  { id: 9, name: "Hard Drive", icon: "ri-database-line", correctBin: "ewaste", fact: "Hard drives contain rare earth metals worth recovering through proper recycling." },
  { id: 10, name: "USB Cable", icon: "ri-usb-line", correctBin: "reusable", fact: "Working cables can be donated or reused, preventing unnecessary e-waste." },
  { id: 11, name: "Plastic Wrapping", icon: "ri-layout-line", correctBin: "landfill", fact: "Most plastic film wrapping cannot be recycled in standard facilities." },
  { id: 12, name: "Metal Brackets", icon: "ri-settings-3-line", correctBin: "recyclable", fact: "Metal can be recycled infinitely without losing quality!" }
];

const bins: Bin[] = [
  { id: 'ewaste', name: 'E-Waste', icon: 'ri-computer-line', color: 'from-red-500 to-orange-500', description: 'Electronics & batteries' },
  { id: 'recyclable', name: 'Recyclable', icon: 'ri-recycle-line', color: 'from-blue-500 to-cyan-500', description: 'Paper, metal, cardboard' },
  { id: 'reusable', name: 'Reusable', icon: 'ri-restart-line', color: 'from-emerald-500 to-teal-500', description: 'Working items' },
  { id: 'landfill', name: 'Landfill', icon: 'ri-delete-bin-line', color: 'from-neutral-600 to-neutral-700', description: 'Non-recyclable waste' }
];

export default function WasteSortingGame({ onComplete }: { onComplete?: (score: number, totalPoints: number) => void }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const currentItem = gameItems[currentRound];
  const progress = ((currentRound + 1) / gameItems.length) * 100;
  const pointsPerItem = 10;

  const handleBinSelect = (binId: string) => {
    if (showFeedback) return;
    
    const correct = binId === currentItem.correctBin;
    setSelectedBin(binId);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + pointsPerItem);
    }
  };

  const handleNext = () => {
    if (currentRound < gameItems.length - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedBin(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setGameComplete(true);
      onComplete?.(score, gameItems.length * pointsPerItem);
    }
  };

  const handleRestart = () => {
    setCurrentRound(0);
    setScore(0);
    setSelectedBin(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setGameComplete(false);
  };

  const getScoreMessage = () => {
    const finalScore = score;
    const percentage = (finalScore / (gameItems.length * pointsPerItem)) * 100;
    
    if (percentage === 100) return "🏆 Perfect! You're a Waste Sorting Master!";
    if (percentage >= 80) return "🌟 Excellent! You really know your waste categories!";
    if (percentage >= 60) return "♻️ Great Job! You're becoming an eco-expert!";
    if (percentage >= 40) return "🌱 Good Start! Keep learning about proper waste sorting!";
    return "🌍 Nice Try! Practice makes perfect!";
  };

  if (gameComplete) {
    const finalScore = score;
    const totalPossible = gameItems.length * pointsPerItem;
    const correctCount = Math.round(finalScore / pointsPerItem);
    const percentage = (finalScore / totalPossible) * 100;
    
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
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold text-neutral-900">Game Complete!</CardTitle>
            <p className="text-lg text-neutral-600 mt-2">{getScoreMessage()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-600 mb-2">
                {finalScore} / {totalPossible}
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
                  {gameItems.length - correctCount}
                </div>
                <p className="text-sm text-neutral-600">Incorrect</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Award className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">+{finalScore}</div>
                <p className="text-sm text-neutral-600">XP Earned</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleRestart} className="flex-1 border-2" variant="outline">
                <i className="ri-refresh-line mr-2"></i>
                Play Again
              </Button>
              <Button onClick={() => window.location.href = "/"} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
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
    <div className="max-w-4xl mx-auto" data-testid="waste-sorting-game">
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              <Recycle className="h-3 w-3 mr-1" />
              Waste Sorting Challenge
            </Badge>
            <Badge className="bg-orange-500 text-white hover:bg-orange-500">
              <Zap className="h-3 w-3 mr-1" />
              {score} XP
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Item {currentRound + 1} of {gameItems.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentRound}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6 border-2">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  drag={!showFeedback}
                  dragSnapToOrigin
                  whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                  className="inline-block"
                  onDragStart={() => setDraggedItem(currentItem.id.toString())}
                  onDragEnd={() => setDraggedItem(null)}
                >
                  <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4 mx-auto border-4 border-dashed ${
                    draggedItem ? 'border-violet-400' : 'border-violet-200'
                  } ${!showFeedback ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
                    <i className={`${currentItem.icon} text-6xl text-violet-600`}></i>
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{currentItem.name}</h3>
                <p className="text-neutral-600">
                  {showFeedback ? "Tap or drag items into the correct bin" : "Where should this go?"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bins.map((bin) => {
                  const isSelected = selectedBin === bin.id;
                  const isCorrectBin = bin.id === currentItem.correctBin;
                  const showResult = showFeedback;
                  
                  return (
                    <motion.div
                      key={bin.id}
                      whileHover={!showFeedback ? { scale: 1.05 } : {}}
                      whileTap={!showFeedback ? { scale: 0.95 } : {}}
                    >
                      <button
                        onClick={() => handleBinSelect(bin.id)}
                        disabled={showFeedback}
                        className={`w-full p-4 rounded-xl border-4 transition-all ${
                          showResult && isCorrectBin
                            ? 'border-green-500 bg-green-50'
                            : showResult && isSelected && !isCorrectBin
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        } ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
                        data-testid={`bin-${bin.id}`}
                      >
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bin.color} flex items-center justify-center mx-auto mb-3`}>
                          <i className={`${bin.icon} text-3xl text-white`}></i>
                        </div>
                        <div className="font-bold text-neutral-900 mb-1">{bin.name}</div>
                        <div className="text-xs text-neutral-600">{bin.description}</div>
                        {showResult && isCorrectBin && (
                          <div className="mt-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" />
                          </div>
                        )}
                        {showResult && isSelected && !isCorrectBin && (
                          <div className="mt-2">
                            <XCircle className="h-6 w-6 text-red-600 mx-auto" />
                          </div>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-300'
                  : 'bg-orange-50 border-orange-300'
              }`}>
                <CardContent className="p-6">
                  <div className="flex gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        isCorrect ? 'text-green-900' : 'text-orange-900'
                      }`}>
                        {isCorrect ? `Correct! +${pointsPerItem} XP` : 'Not quite right!'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-neutral-700 mt-1">
                          This should go in <strong>{bins.find(b => b.id === currentItem.correctBin)?.name}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-start gap-2">
                      <i className="ri-lightbulb-line text-xl text-amber-600 flex-shrink-0 mt-0.5"></i>
                      <div>
                        <p className="font-semibold text-neutral-900 mb-1">Did you know?</p>
                        <p className="text-sm text-neutral-700">{currentItem.fact}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleNext}
                    className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-11"
                    data-testid="game-next-button"
                  >
                    {currentRound < gameItems.length - 1 ? 'Next Item' : 'See Results'}
                    <i className="ri-arrow-right-line ml-2"></i>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
