import { createStore, combineReducers, applyMiddleware } from 'redux';
import { get } from './http';
import logger from 'redux-logger'

export const ONLINE = 'ONLINE';
export const AWAY = 'AWAY';
export const BUSY = 'BUSY';
export const OFFLINE = 'OFFLINE';
export const UPDATE_STATUS = 'UPDATE_STATUS';
export const CREATE_NEW_MESSAGE = 'CREATE_NEW_MESSAGE';

export const READY = 'READY';
export const WAITING = 'WAITING';
export const NEW_MESSAGE_SERVER_ACCEPTED = 'NEW_MESSAGE_SERVER_ACCEPTED';

const defaultState = {
    messages: [{
        date: new Date('2016-10-10 10:11:34'),
        postedBy: 'billy',
        content: 'sdfasfd'
    },
    {
        date: new Date('2016-10-10 10:11:34'),
        postedBy: 'name',
        content: 'sdfasfd'
    },
    {
        date: new Date('2016-10-10 10:11:34'),
        postedBy: 'glenn',
        content: 'sdfasfd'
    }],
    userStatus: ONLINE,
    apiCommunicationStatus: READY
}

const render = () => {
    const { messages, userStatus, apiCommunicationStatus } = store.getState();
    document.getElementById("messages").innerHTML = messages
        .sort((a, b) => b.date - a.date)
        .map(msg => (`<div>${msg.postedBy} : ${msg.content}</div>`))
        .join('')

    document.forms.newMessage.fields.disabled = userStatus === OFFLINE || apiCommunicationStatus === WAITING
    document.forms.newMessage.newMessage.value = ''
}

const statusUpdateAction = value => {
    return {
        type: UPDATE_STATUS,
        value
    }
}

const newMessageAction = (content, postedBy) => {
    const date = new Date();

    get('/api/create', id => {
        store.dispatch({
            type: NEW_MESSAGE_SERVER_ACCEPTED
        })
    })


    return {
        type: CREATE_NEW_MESSAGE,
        content,
        date,
        postedBy,
    }
}

const userStatusReducer = (state = defaultState.userStatus, { type, value }) => {
    switch (type) {
        case UPDATE_STATUS:
            return value;
        default:
            return state;
    }
}

const apiCommunicationStatusReducer = (state = READY, { type }) => {
    switch (type) {
        case CREATE_NEW_MESSAGE:
            return WAITING;
        case NEW_MESSAGE_SERVER_ACCEPTED:
            return READY;
        default:
            return state;
    }
}

const messageReducer = (state = defaultState.messages, { type, content, postedBy, date }) => {

    switch (type) {
        case CREATE_NEW_MESSAGE: {
            return [
                {
                    content,
                    postedBy,
                    date
                },
                ...state
            ]
        }
        default:
            return state;
    }
}

const combineReducer = combineReducers({
    userStatus: userStatusReducer,
    messages: messageReducer,
    apiCommunicationStatus: apiCommunicationStatusReducer,
})

const store = createStore(combineReducer, applyMiddleware(logger));

document.forms.selectStatus.status.addEventListener('change', e => {
    store.dispatch(statusUpdateAction(e.target.value))
});

document.forms.newMessage.addEventListener('submit', e => {
    e.preventDefault();
    const value = e.target.newMessage.value;
    const username = localStorage['preferences'] ? JSON.parse(localStorage['preferences']).username : 'j blockhead';
    store.dispatch(newMessageAction(value, username))
})
render();

store.subscribe(render);
