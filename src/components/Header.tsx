import { Box, Button } from '@mui/joy'
import { useMediaQuery } from "@mui/material"
import { useState } from 'react'
import { Menu, Close } from '@mui/icons-material'

interface HeaderProps {
    onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {

    const [sidebarVisible, setSidebarVisible] = useState(false)

    const isMdScreen = useMediaQuery("(max-width:899px)")

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible)
        onToggleSidebar()
    }

  return (
    <Box sx={(theme) => ({
      display: 'flex',
      alignItems: 'center',
      height: '60px',
      borderBottom: `1px solid ${
        theme.palette.mode === "light" ? "#e8eaee" : "#21262b"
      }`
    })}>
    <Button
        sx={(theme) => ({
          position: "relative",
          zIndex: 1000,
          marginLeft: "5px",
          color: `${
            theme.palette.mode === "dark" ? "#858687" : "#adafb1"
          }`,
        })}
        onClick={toggleSidebar}
        variant="plain"
      >
        {isMdScreen && sidebarVisible ? <Close /> : <Menu />}
    </Button>
    </Box>
  )
}
