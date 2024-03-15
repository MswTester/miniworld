import { useEffect, useState } from 'react'
import GameEngine from './engine'

function App() {
  const [once, setOnce] = useState(false)
  const [state, setState] = useState<"main"|"game">("main")

  useEffect(() => {
    if(once) {
      // check mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if(!isMobile) {
        alert('This game is only available on mobile devices')
      }
    }
  }, [once])
  useEffect(() => setOnce(true), [])

  return (
    <>
      {state === "main" && (
        <main className='flex flex-col w-full h-full justify-center items-center'>
          <h1 className='font-semibold text-3xl flex-1 w-full flex flex-row items-center justify-center'>Mini World</h1>
          <div className="flex-1 w-full flex flex-row items-center justify-center">
            <button className='font-semibold rounded-full border-1 border border-gray-300 text-xl px-8 py-4' onClick={() => {
              // request full screen
              const elem = document.documentElement
              if (elem.requestFullscreen) {
                elem.requestFullscreen()
              }
              setState("game")
            }}>Start</button>
          </div>
        </main>
      )}
      {state === "game" && <GameEngine />}
    </>
  )
}

export default App
