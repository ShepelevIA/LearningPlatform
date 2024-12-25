import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import { Box } from '@mui/joy'

interface ParentComponentProps {
    children: React.ReactNode
}

export default function Content({ children }: ParentComponentProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const storedValue = localStorage.getItem('isSidebarOpen')
        return storedValue ? JSON.parse(storedValue) : true
    })

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    useEffect(() => {
        localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen))
    }, [isSidebarOpen])
  return (
    <>
        <Sidebar isOpenSidebar={isSidebarOpen} />
                <Box sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '100vh',
                    width: '100%'
                }}>
                <Header onToggleSidebar={toggleSidebar} />
                    <Box sx={{
                        position: 'relative',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '15px 20px',
                        height: 'calc(100vh - 138px)',
                        boxSizing: 'border-box'

                    }}
                    >
                        {children}
                    </Box>
                <Footer />
                </Box>
    </>
  )
}
