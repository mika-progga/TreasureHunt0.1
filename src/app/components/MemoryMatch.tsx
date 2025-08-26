"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import styles from "./MemoryMatch.module.css"

const SYMBOLS = [
  "⚛️",
  "🎲",
  "💻",
  "🚀",
  "⚡",
  "🎯",
  "🔥",
  "💎",
  "🌟",
  "🎨",
  "🎪",
  "🎭",
  "🎸",
  "🎺",
  "🎻",
  "🎹",
  "🏆",
  "🏅",
]

type Card = {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [won, setWon] = useState(false)
  const [showRules, setShowRules] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(200)
  const [showWinPopup, setShowWinPopup] = useState(false)
  const [gameEndedByTimeout, setGameEndedByTimeout] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resetGame = useCallback(() => {
    const shuffled = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((s, i) => ({ id: i, symbol: s, isFlipped: false, isMatched: false }))
    setCards(shuffled)
    setFlipped([])
    setMoves(0)
    setScore(0)
    setWon(false)
    setShowWinPopup(false)
    setGameStarted(false)
    setTimeLeft(200)
    setGameEndedByTimeout(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [])

  const handleTimeUp = useCallback(() => {
    setGameStarted(false)
    setTimeLeft(200)
    setGameEndedByTimeout(true)
    setShowRules(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !won) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && !won) {
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [gameStarted, timeLeft, won, handleTimeUp])

  const handleStartGame = () => {
    setShowRules(false)
    if (gameEndedByTimeout) {
      resetGame()
    }
  }

  const handleClick = (i: number) => {
    if (flipped.length === 2 || cards[i].isFlipped || cards[i].isMatched) return

    if (!gameStarted) {
      setGameStarted(true)
    }

    const updated = [...cards]
    updated[i].isFlipped = true
    setCards(updated)
    const newFlipped = [...flipped, i]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [a, b] = newFlipped
      if (cards[a].symbol === cards[b].symbol) {
        setTimeout(() => {
          const matched = [...updated]
          matched[a].isMatched = true
          matched[b].isMatched = true
          setCards(matched)
          setScore(score + 10)
          setFlipped([])
          if (matched.every((c) => c.isMatched)) {
            setWon(true)
            setShowWinPopup(true)
            if (timerRef.current) {
              clearTimeout(timerRef.current)
            }
          }
        }, 400)
      } else {
        setTimeout(() => {
          const reset = [...updated]
          reset[a].isFlipped = false
          reset[b].isFlipped = false
          setCards(reset)
          setFlipped([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={styles.wrapper}>
      {showRules && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3>🧠 Memory Match Rules</h3>
            <div className={styles.rules}>
              <p>• You have 100 seconds to complete the game</p>
              <p>• Match all pairs of emojis to win</p>
              <p>• Timer starts when you click your first tile</p>
              <p>• If time runs out, the game will auto-shuffle</p>
              <p>• Complete the game to get your clue!</p>
            </div>
            <button className={styles.okButton} onClick={handleStartGame}>
              OK, Let&apos;s Play!
            </button>
          </div>
        </div>
      )}

      {showWinPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3>🎉 Congratulations!</h3>
            <p>You completed the Memory Match in {moves} moves!</p>
            <p>Time remaining: {formatTime(timeLeft)}</p>
            <p>
              <strong>Here&apos;s your clue:</strong>
            </p>
            <div className={styles.clue}>&quot;They've got all the fame and names on plaques just beside the place,that got all snacks; travel a bit further to red bricked zone ; careful to check all corners and see beyond horizon...&quot;</div>
            <button className={styles.okButton} onClick={() => setShowWinPopup(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {!showRules && (
        <>
          <div className={styles.header}>
            <h2>🧠 Memory Match</h2>
            <div className={styles.stats}>
              <span className={timeLeft <= 30 ? styles.timeWarning : ""}>⏰ {formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.grid}>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.flipped : ""}`}
                onClick={() => handleClick(card.id)}
              >
                <div className={styles.inner}>
                  <div className={styles.front}>?</div>
                  <div className={styles.back}>{card.symbol}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}






