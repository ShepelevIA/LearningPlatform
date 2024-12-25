import { Box,Typography } from "@mui/joy"
import { useState, useEffect } from "react"
import defaultReact from '../assets/react.svg' 
import ButtonDarkMode from "./ButtonDarkMode"

interface SidebarProps {
    isOpenSidebar?: boolean
}

export default function Sidebar({ isOpenSidebar }: SidebarProps) {

    const [isHovered, setIsHovered] = useState<boolean>(false)


    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
    }

    useEffect(() => {
        localStorage.setItem('isSidebarOpen', JSON.stringify(isOpenSidebar))
    }, [isOpenSidebar])

  return (
    <Box
    onMouseEnter={handleMouseEnter} 
    onMouseLeave={handleMouseLeave} 
    sx={(theme) => ({
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        height: "100vh",
        width: isOpenSidebar || isHovered ? "350px" : "80px",
        padding: "0 15px 15px 15px",
        zIndex: "1",
        transition: "width 0.5s ease, box-shadow 0.5s ease, opacity 0.5s ease",
        borderRight: `1px solid ${
          theme.palette.mode === "light" ? "#e8eaee" : "#21262b"
        }`,
        boxSizing: "border-box",
        [theme.breakpoints.down("md")]: {
          position: "absolute",
          zIndex: 1000,
          opacity: isOpenSidebar || isHovered ? 1 : 0,
          width: isOpenSidebar || isHovered ? "350px" : "0",
          backgroundColor: `${
            theme.palette.mode === "light" ? "#fff" : "#0f1214"
          }`,
        },
        [theme.breakpoints.down("sm")]: {
          width: isOpenSidebar || isHovered ? "100%" : "0",
        },
      })}
    >
        <Box 
            sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px'
            }}
        >
          <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <img src={defaultReact} alt="defaultReact" />
            { isOpenSidebar || isHovered ? 
              <Typography 
              sx={{
                whiteSpace: "nowrap",
                marginLeft: "10px",
              }}
              level="h4"
              >
                Lerning platform
              </Typography> 
              : '' 
            }
          </Box>
        </Box>
    <ButtonDarkMode isOpenSidebar={isOpenSidebar} isHovered={isHovered} />
</Box>
  )
}
