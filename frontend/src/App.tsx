import { Toaster } from 'sonner'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppRouter } from '@/router/AppRouter'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AppRouter />
      <Toaster richColors position="top-right" closeButton duration={2000} />
    </ThemeProvider>
  )
}

export default App
