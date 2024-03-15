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

  const onFullscreenButtonClick = async () => {
    try {
      // 전체 화면 모드로 전환
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) { // Firefox
        await (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) { // IE/Edge
        await (document.documentElement as any).msRequestFullscreen();
      }
  
      // 화면 방향을 가로로 고정
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape')
      }
    } catch (error) {
      console.error(`Error trying to force fullscreen and lock orientation: ${error}`);
    }
  };

  return (
    <>
      {state === "main" && (
        <main className='flex flex-col w-full h-full justify-center items-center'>
          <h1 className='font-semibold text-3xl flex-1 w-full flex flex-row items-center justify-center'>Mini World</h1>
          <div className="flex-1 w-full flex flex-row items-center justify-center">
            <button className='font-semibold rounded-full border-1 border border-gray-300 text-xl px-8 py-4' onClick={() => {
              onFullscreenButtonClick()
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
