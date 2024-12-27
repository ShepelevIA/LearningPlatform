import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import { Box } from '@mui/joy'
import ButtonDarkMode from '../../components/ButtonDarkMode'
import Logo from '../../assets/img/logo.svg'
import BgAuth from '../../assets/img/bg_auth.jpeg'
import { useMediaQuery } from "@mui/material"

export default function Register() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [bgImageLoaded, setBgImageLoaded] = useState(false)

  const isMdScreen1373 = useMediaQuery("(max-width: 1373px)")
  const isMdScreen450 = useMediaQuery("(max-width: 450px)")

  const navigate = useNavigate()

  const handleLoginClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      navigate('/login')
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
      <Sheet
        sx={(theme) => ({
            width: '50%',
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            transform: isMdScreen1373 ? 'none' : isAnimating ? 'translateX(100%)' : 'translateX(0)',
            transition: isMdScreen1373 ? 'none' : 'transform 0.5s ease',
            [theme.breakpoints.down("md")]: {
              width: '100%',
              order: 2
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
            <b>Регистрация</b>
          </Typography>
          <Typography sx={{mb: 2}} level="body-sm">Заполните данные, чтобы зарегистрироваться.</Typography>
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
            <FormControl sx={{ mb: 2, width: isMdScreen450 ? '100%' : isMdScreen1373 ? '48%' : 'auto' }}>
                <FormLabel>Фамилия</FormLabel>
                <Input name="last_name" type="text" placeholder="Иванов" />
            </FormControl>
            <FormControl sx={{ mb: 2, width: isMdScreen450 ? '100%' : isMdScreen1373 ? '48%' : 'auto' }}>
                <FormLabel>Имя</FormLabel>
                <Input name="first_name" type="text" placeholder="Иван" />
            </FormControl>
            <FormControl sx={{mb: 2, width: isMdScreen1373 ? '100%' : 'auto'}}>
                <FormLabel>Отчество</FormLabel>
                <Input name="middle_name" type="text" placeholder="Иванович" />
            </FormControl>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
          <FormControl sx={{ mb: 2, width: isMdScreen450 ? '100%' : '48%' }}>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" placeholder="johndoe@email.com" />
          </FormControl>
          <FormControl sx={{ mb: 2, width: isMdScreen450 ? '100%' : '48%' }}>
            <FormLabel>Кто вы?</FormLabel>
            <Select sx={{ width: '100%' }} placeholder="Преподаватель/Обучающийся">
              <Option value="Teacher">Преподаватель</Option>
              <Option value="Student">Обучающийся</Option>
            </Select>
          </FormControl>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
          <FormControl sx={{ mb: 2, width: isMdScreen450 ? '100%' : '48%' }}>
            <FormLabel>Пароль</FormLabel>
            <Input name="password" type="password" placeholder="Введите пароль" />
          </FormControl>
          <FormControl sx={{ mb: 2, width: isMdScreen450 ? '100%' : '48%' }}>
            <FormLabel>Подтвердите пароль</FormLabel>
            <Input name="confirmPassword" type="password" placeholder="Повторите пароль" />
          </FormControl>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', 'alignItems': 'center'}}>
          <Button sx={{ mt: 3, mx: 'auto', width: '50%' }}>Зарегистрироваться</Button>
            <Typography
                endDecorator={
                <Button variant="plain" onClick={handleLoginClick}>
                    Авторизоваться
                </Button>
                }
                sx={{ mt: 3, fontSize: 'sm', alignSelf: 'center' }}
            >
                У вас уже есть учетная запись?
            </Typography>
            <Box sx={{ mt: 2 }}>
                <ButtonDarkMode />
            </Box>
          </Box>
        </Box>
      </Sheet>

      <Box
        sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50%',
            transform: isMdScreen1373 ? 'none' : isAnimating ? 'translateX(-100%)' : 'translateX(0)',
            transition: isMdScreen1373 ? 'none' : 'transform 0.5s ease',
            [theme.breakpoints.down("md")]: {
              width: '100%',
              py: 6
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
    </Box>
  )
}