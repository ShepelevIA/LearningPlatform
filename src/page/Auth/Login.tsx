import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import { Box } from '@mui/joy'
import ButtonDarkMode from '../../components/ButtonDarkMode'
import Logo from '../../assets/img/logo.svg'
import BgAuth from '../../assets/img/bg_auth.jpeg'
import { useMediaQuery } from "@mui/material"

export default function Login() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [bgImageLoaded, setBgImageLoaded] = useState(false)

  const isMdScreen1373 = useMediaQuery("(max-width: 1373px)")

  const navigate = useNavigate()

  const handleRegisterClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      navigate('/register')
    }, 500) 
  }

  useEffect(() => {
    const img = new Image()
    img.src = BgAuth
    img.onload = () => setBgImageLoaded(true)
  }, [])

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        width: '100%',
        backgroundImage: bgImageLoaded
          ? `linear-gradient(
              to top, 
              rgba(124,68,247,0.7) 0%, 
              rgba(64,147,246,0.7) 50%, 
              rgba(61,167,248,0.7) 100%
            ), url(${BgAuth})`
          : undefined,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: 'hidden',
        position: 'relative',
        [theme.breakpoints.down("md")]: {
            flexWrap: 'wrap'
        }
      })}
    >

      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50%',
          transform: isMdScreen1373 ? 'none' : isAnimating ? 'translateX(100%)' : 'translateX(0)',
          transition: isMdScreen1373 ? 'none' : 'transform 0.5s ease',
          [theme.breakpoints.down("md")]: {
            width: '100%'
          }
        })}
      >
        <Box
        component="img"
        src={Logo}
        alt="Logo"
        sx={(theme) => ({
            maxWidth: "230px",
            width: "100%",
            [theme.breakpoints.down("md")]: {
            maxWidth: "100px",
            },
        })}
        />
        <Typography
          sx={(theme) => ({
            marginLeft: '10px',
            whiteSpace: 'nowrap',
            [theme.breakpoints.down("md")]: {
                fontSize: 30
            },
          })}
          level="h1"
        >
          Learning Platform
        </Typography>
      </Box>

      <Sheet
        sx={(theme) => ({
          width: '50%',
          py: 3,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
          transform: isMdScreen1373 ? 'none' : isAnimating ? 'translateX(-100%)' : 'translateX(0)',
          transition: isMdScreen1373 ? 'none' : 'transform 0.5s ease',
          [theme.breakpoints.down("md")]: {
            width: '100%'
          }
        })}
      >
        <Box
          sx={{
            
            opacity: isAnimating ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Typography level="h4" component="h1">
            <b>Добро пожаловать!</b>
          </Typography>
          <Typography sx={{mb: 2}} level="body-sm">Войдите, чтобы продолжить.</Typography>
          <FormControl sx={{mb: 2}}>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" placeholder="johndoe@email.com" />
          </FormControl>
          <FormControl>
            <FormLabel>Пароль</FormLabel>
            <Input name="password" type="password" placeholder="*******" />
          </FormControl>
          <Box sx={{display: 'flex', flexDirection: 'column', 'alignItems': 'center'}}>
            <Button sx={{ mt: 3, mx: 'auto', width: '50%' }}>Войти</Button>
            <Typography
                endDecorator={
                <Button variant="plain" onClick={handleRegisterClick}>
                    Регистрация
                </Button>
                }
                sx={{ mt: 3, fontSize: 'sm', alignSelf: 'center' }}
            >
                У вас нет учетной записи?
            </Typography>
            <Box sx={{mt: 2}}>
                <ButtonDarkMode />
            </Box>
          </Box>
        </Box>
      </Sheet>
    </Box>
  )
}