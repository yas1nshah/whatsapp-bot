const {Client, LocalAuth, MessageMedia} = require("whatsapp-web.js")
const qrcode = require('qrcode-terminal');


const  register = (id) => {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: id })
    });

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    // Define a sessions object to store session data
    const sessions = {};

    // ! For Incoming Messages
    client.on('message', async (message) => {
        const senderId =  message.from; // Get sender's ID
        const senderName = (await message.getContact()).pushname
        
        // * setting session
        let session = sessions[senderId];        
        
        if (!session) {
            // * If no session exists, create a new one
            session = { state: '*', name: senderName, question : { id : null, state : null}  };
            sessions[senderId] = session;
        }
        session.lastActive = Date.now();
        // ? Reset to main menu
        if(message.body === "0")
        {
            session.state = '*'
        }
        
        if(!((await message.getChat()).isGroup))
        {

            
            // ? Main Menu
            if (session.state === '*')
            {
                client.sendMessage(message.from, `Hey *${session.name}* 👋,\nWelcome to Ghost Protocols! 🏴‍☠️\nPlease reply with an option number 👇?\n\n1️⃣ Looking for a Car?\n2️⃣ Sell Your Car.\n3️⃣ Upgrade your Account\n4️⃣ Book a Detailing Slot\n5️⃣ Book a Review Slot\n6️⃣ Invest in GP\n7️⃣ Talk to Representative\n`)
                session.state = "menu-input"
            }

            // ? Set Question State
            else if(session.state === "menu-input")
            {
                if(message.body === "1")
                {
                    session.state = "question"
                    session.question.id = "1"
                }

                else if(message.body === "2")
                {
                    session.state = "question"
                    session.question.id = "2"
                }

                else if(message.body === "3")
                {
                    session.state = "question"
                    session.question.id = "3"
                }
                else if(message.body === "5")
                {
                    session.state = "question"
                    session.question.id = "5"
                }
                else if(message.body === "6")
                {
                    session.state = "question"
                    session.question.id = "6"
                }
                else if(message.body === "7")
                {
                    session.state = "question"
                    session.question.id = "7"
                }
                else
                {
                    client.sendMessage(message.from, 'Enter a valid menu option!😑');
                }
                
            }

            
            if(session.state === "question")
            {
                // * Find a car
                if(session.question.id === '1' )
                {   
                    if(!session.question.state)
                    {
                        client.sendMessage(message.from, "What Car are you looking for? 🤔\n\nReply with the product name..."); 
                        session.question.state = "getting-product"
                    }
                    else if(session.question.state === "getting-product")
                    {
                        const product = encodeURIComponent(message.body.slice())
                        client.sendMessage(message.from, `Here are some cars we found! ✨\nhttps://ghostprotocols.pk/inventory/search?keyword=${product}\n\nFollow the link above ☝️ `); 
                        session.question.state = null
                        session.question.id = null
                        session.state = "*"
                    }
                }

                // * Sell your Car
                else if(session.question.id === '2' )
                {   
                    if(!session.question.state)
                    {
                        client.sendMessage(message.from, "We currenty offer two ways of selling your Car !🏴‍☠️\n\n1️⃣ Let us Sell your Car\n2️⃣ Post an Ad yourself\n\nReply with a option number ☝️");
                        session.question.state = "choose-option"
                    }
                    else{
                        if(message.body ==="1")
                        {
                            client.sendMessage(`120363254971568437@g.us`,`${session.name} - ${message.from.replace("@c.us", "")}`)
                            client.sendMessage(message.from, 'We have got your request!✨\nOur team will contact you ASAP for futher process!');
                            session.question.state = null
                            session.question.id = null
                            session.state = "*"
                        }
                        else if(message.body ==="2")
                        {
                            client.sendMessage(message.from, 'Great! To post your car at Ghost Protocols, Follow the link below 👇\nhttps://ghostprotocols.pk/inventory/add-car');
                            session.question.state = null
                            session.question.id = null
                            session.state = "*"
                        }
                        else {
                            client.sendMessage(message.from, 'Enter a valid menu option!😑');
                        }
                    }
                    
                    
                }

                // * Upgrade Account
                else if(session.question.id === '3' )
                {   
                    client.sendMessage(message.from, "We're setting this up! Be patient🥺🙏");
                    session.question.state = null
                    session.question.id = null
                    session.state = "*" 
                    // if(!session.question.state)
                    // {
                    //     client.sendMessage(message.from, "You want going to increase your Ad Limit @ghostprotocols.pk\n\nHow many Cars do you want to post?"); 
                    //     session.question.state = "getting-order"
                    // }
                    // else if(session.question.state === "getting-order")
                    // {   
                    //     let intValue = parseInt(message.body);
                    //     if(!isNaN(intValue))
                    //     {
                    //         client.sendMessage(message.from,`Your total cost will be Rs ${intValue * 100}/-\n Pay Now to increase Your Ad limit`); 
                    //         session.question.state = null
                    //         session.question.id = null
                    //         session.state = "*"
                    //     }
                    //     else{
                    //         client.sendMessage(message.from, 'Enter a valid number!😑');
                    //     }
                    // }
                }

                // * Detailing Slot
                else if(session.question.id === '4' )
                {   
                    client.sendMessage(message.from, "We've notified our team 🤗\nSomeone will contact you soon.."); 
                    client.sendMessage(`120363271462405609@g.us`,`${session.name} - ${message.from.replace("@c.us", "")}`)

                    session.question.state = null
                    session.question.id = null
                    session.state = "*"
                    
                }

                // * Review Slot
                else if(session.question.id === '5' )
                {   
                    client.sendMessage(message.from, "We've notified our team 🤗\nSomeone will contact you soon.."); 
                    client.sendMessage(`120363254556542205@g.us`,`${session.name} - ${message.from.replace("@c.us", "")}`)

                    session.question.state = null
                    session.question.id = null
                    session.state = "*"
                }
                
                // * Invest in GP
                else if(session.question.id === '6' )
                {   
                    client.sendMessage(message.from, "We've notified our team 🤗\nSomeone will contact you soon.."); 
                    client.sendMessage(`120363253882643408@g.us`,`${session.name} - ${message.from.replace("@c.us", "")}`)

                    session.question.state = null
                    session.question.id = null
                    session.state = "*"
                }
                
                // * Representative
                else if(session.question.id === '7' )
                {   
                    client.sendMessage(message.from, "We've notified our team 🤗\nSomeone will contact you soon.."); 
                    client.sendMessage(`120363271514568561@g.us`,`${session.name} - ${message.from.replace("@c.us", "")}`)

                    session.question.state = null
                    session.question.id = null
                    session.state = "*"
                }
            }
        }

        function clearExpiredSessions() {
            const currentTime = Date.now();
        
            for (const senderId in sessions) {
                const session = sessions[senderId];
                if (currentTime - session.lastActive > 15 * 60 * 1000) { // 15 minutes
                    delete sessions[senderId];
                }
            }
        }
        
        // Check and clear expired sessions every 5 minutes
        setInterval(clearExpiredSessions, 5 * 60 * 1000);
    });
        
        
    client.initialize();
     
}


module.exports = register


