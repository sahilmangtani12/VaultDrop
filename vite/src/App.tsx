
import { Suspense } from 'react'
import './index.css'
import routes from "virtual:generated-pages-react"
import { useRoutes } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Transfers from './pages/transfers/Transfers'


function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex grow relative">
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-6 relative z-10">
        {children}
      </div>
      <Transfers />
    </div>
  );
}

/* Ambient background with drifting color orbs */
function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base */}
      <div className="absolute inset-0 bg-[#08080c]" />
      {/* Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[120px] animate-drift" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/[0.05] rounded-full blur-[100px] animate-drift" style={{ animationDelay: '-7s' }} />
      <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[100px] animate-drift" style={{ animationDelay: '-14s' }} />
      <div className="absolute bottom-[30%] left-[15%] w-[350px] h-[350px] bg-blue-400/[0.03] rounded-full blur-[80px] animate-drift" style={{ animationDelay: '-5s' }} />
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
    </div>
  );
}


export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AmbientBackground />
      <Header />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      }>
        <Container>
          {useRoutes(routes)}
        </Container>
      </Suspense>
      <Footer />
    </div>
  );
}
