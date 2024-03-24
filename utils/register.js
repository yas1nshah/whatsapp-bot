const {Client, LocalAuth, MessageMedia} = require("whatsapp-web.js")
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;


const WooCommerce = new WooCommerceRestApi({
    url: 'https://applepakistan.com.pk',
    consumerKey: 'ck_dd8876401b45b61ca4d35e7b44cde7f679454f59',
    consumerSecret: 'cs_517d121dfab31729bb858862abba86bfb9bba5a6',
    version: 'wc/v3',
    queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
  });

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
        
        const labels = await (await message.getChat()).getLabels()
        let pauseBotLabelExists = false;

        for (let i=0; i < (labels).length; i++) {
            if (labels[i].name === 'pause-bot') {
                pauseBotLabelExists = true;
                break;
            }
        }

        // only run code below if the label with name pause-bot does not exist
        if (!pauseBotLabelExists){
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
                session.question.state =  null
                session.question.id =  null
            }
            
            // ? Main Menu
            if (session.state === '*')
            {
                client.sendMessage(message.from, `Hi *${session.name}* 🤗,\nWelcome to Apple Pakistan! 🇵🇰\nPlease reply with an option number 👇?\n\n1️⃣ Looking for a Product?\n2️⃣ What's the procedure.\n3️⃣ Track your order\n4️⃣ Talk to a Representative\n`)
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
                else if(message.body === "4")
                {
                    session.state = "question"
                    session.question.id = "4"
                }
                else
                {
                    client.sendMessage(message.from, 'Enter a valid menu option!😑');
                }
                
            }

            // * Product
            if(session.state === "question")
            {
                if(session.question.id === '1' )
                {   
                    if(!session.question.state)
                    {
                        client.sendMessage(message.from, "What product are you looking for? 🤔\nReply with the product name..."); 
                        session.question.state = "getting-product"
                    }
                    else if(session.question.state === "getting-product")
                    {
                        const product = message.body.slice().replace(/ /g, "+")
                        client.sendMessage(message.from, `Here are some products we found! ✨\nhttps://applepakistan.com.pk/?s=${product}&ct_post_type=product\n\nFollow the link above ☝️ `); 
                        session.question.state = null
                        session.question.id = null
                        session.state = "*"
                    }
                }

                // * Procedrue
                else if(session.question.id === '2' )
                {   
                    client.sendMessage(message.from, "Guess What? 😌 Its this Easy\n1. Place your order 😇\n2. Confirm your Payment 🫡\n3. Get delivery in 2-4 Business Days 🫠\n4. Give your satisfied review 🤗\n\nNote: Incase your product is not listed on website, it can be sourced from Apple Store Dubai on Demand!");
                    session.question.state = null
                    session.question.id = null
                    session.state = "*"
                    
                }

                // * Track Order
                else if(session.question.id === '3' )
                {   
                    if(!session.question.state)
                    {
                        client.sendMessage(message.from, "Enter your Order-ID 😶‍🌫️"); 
                        session.question.state = "getting-order"
                    }
                    else if(session.question.state === "getting-order")
                    {
                        (await message.getChat()).sendStateTyping()

                    await WooCommerce.get(`orders/${message.body}`)
                        .then(async (response) => {
                            let order;
                            if(!response.data.needs_payment)
                            {
                                await WooCommerce.get(`orders/${message.body}/notes`)
                                .then((res) => {
                                    order = `Your Order #${response.data.id}\nStatus ${response.data.status}\nPAID\n\n`;
                                    console.log(res.data);
                                    for (let i = 0; i < res.data.length; i++) {
                                        if (res.data[i].customer_note) {
                                            order += `${res.data[i].note}\n`;
                                        }
                                    }
                                })
                                
                                .catch((error) => {
                                    order = `Your Order #*${response.data.id}*\nStatus *${response.data.status}*\n*PAID*\n No notes found.`
                                });
                            }
                            else
                            {
                                order = `Your Order #*${response.data.id}*\nStatus *${response.data.status}*\n*UN-PAID*\nPay now using this link👇\n${response.data.payment_url}`
                            }
                        client.sendMessage(message.from, order);

                        session.question.state = null
                        session.question.id = null
                        session.state = "*"
                        
                        })
                        .catch((error) => {
                            client.sendMessage(message.from, "Unable to find the product 🫤\nEnter Order-ID again!\n\nReply with 0️⃣ for main menu");
                            console.log(error.response.data);
                        });
                    
                        
                    }
                }

                // * Talk to representative
                else if(session.question.id === '4' )
                {   
                    if(!session.question.state)
                    {
                        client.sendMessage(message.from, "We've notified our team 🤗\nSomeone will takeover the chat soon..\n\nReply with 0️⃣ for main menu"); 
                        session.question.state = "representative";
                        console.log(message.from)
                        client.sendMessage("923135502848@c.us", `Attend ${message.from.replace("@c.us", "")} ASAP`); 
                        // client.sendMessage("923218833337@c.us", `Attend ${message.from.replace("@c.us", "")} ASAP`); 
                        const chat = await message.getChat()
                        chat.pin();
                        chat.markUnread();
                    }
                    else if(session.question.state ==="representative")
                    {
                        // if(msg[0].body.cont)
                        client.sendMessage(message.from, "Please Hold on!! 🤗\nSomeone will takeover the chat soon..\n\nReply with 0️⃣ for main menu"); 
                    }
                    
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
