const socket = io()

// socket.on('countUpdate', (count) => {
//     console.log('The value of count is: '+count);
    
    
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked!');
    
//     socket.emit('increment')
// })

// ELEMENT

const $messageform = document.querySelector('#message-form')
const $input = $messageform.querySelector('input')
const $formButtom = $messageform.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')






// TEMPLATES

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) 

const autoscroll = () => {
    // New Message Element
    const $newMessage = $messages.lastElementChild
    console.log($newMessage);
    
    // Height of the new Message
    const newMessageStyle = getComputedStyle($newMessage)  // To get all the css properties
    // console.log(newMessageStyle);
    
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    console.log(newMessageMargin);
    
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin + 16  // Message Total Height and 16 is the bottom margin given in css file for anothe div which is inside new div
    console.log(newMessageHeight);
    

    // Visible Height
    const VisibleHegiht = $messages.offsetHeight   // Only the current height which we can see

    // Height of the message container
    const containerHeight = $messages.scrollHeight  // Total height of the container including scroll

    // How far i have scroll
    const scrollOffset = $messages.scrollTop + VisibleHegiht  // height of the container including scroll and its visible height

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }


}

const autoscrollMe = () => {
    $messages.scrollTop = $messages.scrollHeight
}


socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })   // This will require a key pair value 

    

    $messages.insertAdjacentHTML('beforeend', `<div style='color:green;margin-left:5%;margin-bottom:16px;'>${html}</div>`)

    autoscroll()
    
})

socket.on('messageMe', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })   // This will require a key pair value 
    
     
     
     

    $messages.insertAdjacentHTML('beforeend', `<div style='margin-left:85%;margin-bottom:16px;'>${html}</div>`)

    autoscrollMe()
    
    
})


socket.on('locationMessage', (location) => {
    console.log(location);

    const html = Mustache.render(locationTemplate, {
        username: location.username,
        locationURL: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })

    

    $messages.insertAdjacentHTML('beforeend', `<div style='color:green;margin-left:5%;margin-bottom:16px;'>${html}</div>`)

    autoscroll()
    
})

socket.on('locationMessageMe', (location) => {
    console.log(location);

    const html = Mustache.render(locationTemplate, {
        username: location.username,
        locationURL: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })

    

    $messages.insertAdjacentHTML('beforeend', `<div style='margin-left:85%;margin-bottom:16px;'>${html}</div>`)

    autoscrollMe()
    
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    console.log(users);
    

    document.querySelector('#sidebar').innerHTML = html
})

// const input = document.querySelector('input')

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()

    $formButtom.setAttribute('disabled', 'disabled')
    // const msg = input.value
    const msg = e.target.elements.message.value

    socket.emit('messageUpdate', (msg), () => {

        $formButtom.removeAttribute('disabled')
        $input.value = ''
        $input.focus()
        

        console.log('Message Dileverd!');
        
    })
})


$sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Your browser does not support locationa')
        
    } 

    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position.coords.latitude);

        socket.emit('sendLocation', ({
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude
              }), () => {

                $sendLocation.removeAttribute('disabled')
                
                 console.log('Location Shared!');
            
        })
        
    })
})

socket.emit('room', { username, room }, (error) => {

    if(error) {
        alert(error)
        location.href = '/'
    }
})