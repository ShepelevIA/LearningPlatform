import { Box, Typography } from "@mui/joy"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@mui/material"
import logo from "../assets/img/logo.svg"
import ButtonDarkMode from "./ButtonDarkMode"

interface SidebarProps {
    isOpenSidebar?: boolean
}

export default function Sidebar({ isOpenSidebar }: SidebarProps) {
    const [isHovered, setIsHovered] = useState<boolean>(false)

    const isMdScreen = useMediaQuery("(max-width: 899px)")

    const handleMouseEnter = () => {
        if (!isMdScreen) setIsHovered(true)
    }

    const handleMouseLeave = () => {
        if (!isMdScreen) setIsHovered(false)
    }

    useEffect(() => {
        localStorage.setItem("isSidebarOpen", JSON.stringify(isOpenSidebar))
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
                width: isOpenSidebar || (!isMdScreen && isHovered) ? "350px" : "80px",
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
                    opacity: isOpenSidebar ? 1 : 0,
                    width: isOpenSidebar ? "350px" : "0",
                    backgroundColor: `${
                        theme.palette.mode === "light" ? "#fff" : "#0f1214"
                    }`,
                },
                [theme.breakpoints.down("sm")]: {
                    width: isOpenSidebar ? "100%" : "0",
                },
            })}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Box
                    component="img"
                    src={logo}
                    alt="Logo"
                    sx={{
                        width: "50px"
                    }}
                    />
                    {isOpenSidebar || (!isMdScreen && isHovered) ? (
                        <Typography
                        sx={{
                            marginLeft: "10px",
                            background: `linear-gradient(
                              to top, 
                              rgba(124,68,247,1) 0%, 
                              rgba(64,147,246,1) 50%, 
                              rgba(61,167,248,1) 100%
                            )`,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textFillColor: "transparent", 
                            whiteSpace: "nowrap", 
                          }}
                            level="h4"
                        >
                            Learning Platform
                        </Typography>
                    ) : (
                        ""
                    )}
                </Box>
            </Box>
            <ButtonDarkMode isOpenSidebar={isOpenSidebar} isHovered={!isMdScreen && isHovered} />
        </Box>
    )
}