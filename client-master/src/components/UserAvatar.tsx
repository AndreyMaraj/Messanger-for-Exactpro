import {useState} from 'react'
import {observer} from 'mobx-react';
import OnlineStatusStore from '../stores/OnlineStatusStore';
import { Avatar, Badge, createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';

// Аватар пользователя
const UserAvatar = observer(({user, onlineStatusStore, size}: {user: {name: string, picture: string}, onlineStatusStore: OnlineStatusStore, size: number}) => {

    const [status, setStatus] = useState<boolean>(false) // "Онлайн" статус пользователя

    const useStyles = makeStyles((theme: Theme) => // Стили
        createStyles({
            avatar: {
                width: theme.spacing(size),
                height: theme.spacing(size)
            }
        })
    )
    const classes = useStyles() // Классы стилей

    // обновление статуса 
    function Status(): boolean {
        setTimeout(Update, 16000)
        const d1: Date = new Date()
        const d2: Date | undefined = onlineStatusStore.userTimes.get(user.name)
        if (d2 !== undefined){
            if (d1.getTime() >= d2.getTime() + 15000){
                return (false)
            }
            else {
                return (true)
            }
        }
        else {
            return (false)
        }
    }
    
    // Проверка на значение статуса "онлайн" пользователя
    function Update(): void {
        const d1: Date = new Date() // Время сейчас
        const d2: Date | undefined = onlineStatusStore.userTimes.get(user.name) // Время последнего пребывания "онлайн" пользователя
        if (d2 !== undefined){
            if (d1.getTime() >= d2.getTime() + 15000){ // Сравнение времени последнего пребывания "онлайн" пользователя 
                setStatus (false)
            }
            else {
                setStatus (true)
            }
        }
        else {
            setStatus (false) // Если нет информации - пользователь не "онлайн"
        }
    }
    const StyledBadge = withStyles((theme: Theme) => // Аватарка с "оналайн" статусом
        createStyles({
            badge: {
                backgroundColor: '#44b700',
                color: '#44b700',
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: '$ripple 1.2s infinite ease-in-out',
                    border: '1px solid currentColor',
                    content: '""'
                }
            },
            '@keyframes ripple': {
                '0%': {
                    transform: 'scale(.8)',
                    opacity: 1
                },
                '100%': {
                    transform: 'scale(2.4)',
                    opacity: 0
                }
            }
        })
    )(Badge)

    return (
        Status() ?
            <StyledBadge
                overlap="circle"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                variant="dot"
            >
                <Avatar 
                    src={user.picture} 
                    className={classes.avatar}
                />
            </StyledBadge>
        :
            <Avatar 
                src={user.picture} 
                className={classes.avatar}
            />
    )
    
})

export default UserAvatar
