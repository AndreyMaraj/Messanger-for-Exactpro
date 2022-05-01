import {useState} from 'react'
import Requests from '../Requests'
import Cookie from '../Cookie'
import { makeStyles } from '@material-ui/core/styles'
import { Avatar, Button, Container, TextField, Typography } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { Redirect } from 'react-router'

// Форма авторизации (вход/регистрация)
const Authorization = () => {

  const [username, setUsername] = useState<string>("") // Введеный ник
  const [password, setPassword] = useState<string>("") // Введенный пароль
  // const crypt = require('crypto') // Функция хэширования пароля
  // Стили для формы
  const useStyles: any = makeStyles((theme) => ({ 
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main
    },
    form: {
      width: '100%',
      marginTop: theme.spacing(1)
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
      color: "primary"
    }
  }))
  const classes: any = useStyles() // Классы стилей 

  // Валидация формы
  function FormSubmit(): boolean {
    if(username === "" || password === "") {
      alert("Not all fields of the form are filled in.");
      return false;
    }
    return true;
  }

  // Успешная авторизация
  function IsAuthorized(): void{
    // props.LogIn() // Выход из формы авторизации
    var request: {responseText: string, status: number} | null = Requests.Alive() // Оповщение сервер, что клиент "онлайн"
    switch(request?.status){
      case 0:
        <Redirect to='/messenger' />
        break
      case 200:
        break
      case 401:
        alert("User is not logged in.")
        break
      default:
        alert("Error.")
        break
    }
  }

  // Вход в мессенджер
  function LogIn(): void{
    if (FormSubmit()) {
      // var hashPassword: string = crypt.createHash('sha256').update(password).digest('hex') // Хэширование пароля
      var hashPassword: string = password // Хэширование пароля
      var request: {responseText: string, status: number} = Requests.LogIn(username, hashPassword) // Запрос на вход
      switch(request.status){
        case 200:
          Cookie.Set('key', JSON.parse(request.responseText).key)
          IsAuthorized()
          break
        case 401:
          alert("User is not logged in.")
          break
        default:
          alert("Error.")
          break
      }
    }
  }

  // Регистрация
  function SignIn(): void{
    if (FormSubmit()){
      var data: {name: string, password: string} = { // Формирование данных для запроса на сервер
        name: username,
        // password: crypt.createHash('sha256').update(password).digest('hex') // Хэширование пароля
        password: password // Хэширование пароля
      }
      var request: {responseText: string, status: number} = Requests.SignIn(data) // Запорс на регистрацию
      switch(request.status){
        case 200:
          Cookie.Set('key', JSON.parse(request.responseText).key) // Кладем ключ сессии в куки бразузера
          IsAuthorized() // Успешная авторизация
          break
        case 406:
          alert("Username is taken.")
          break
        default:
          alert("Error.")
          break
      }
    }
  }

  return (
      <Container 
        component="main" 
        maxWidth="xs"
      >
        <div 
          className={classes.paper}
        >
          <Avatar 
            className={classes.avatar}
          >
            <LockOutlinedIcon />
          </Avatar>
          <Typography
            component="h1" 
            variant="h5"
          >
            Sign Up
          </Typography>
          <form
            className={classes.form}
            noValidate
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="User name"
              name="username"
              autoComplete="off"
              value={username}
              onChange={event=>setUsername(event.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="off"
              value={password} 
              onChange={event=>setPassword(event.target.value)}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              className={classes.submit}
              onClick={()=>LogIn()}
            >
              Log In
            </Button>
            <Button
              type="button"
              fullWidth
              variant="contained"
              className={classes.submit}
              onClick={()=>SignIn()}
            >
              Sign In
            </Button>
          </form>
        </div>
      </Container>
    )
}

export default Authorization